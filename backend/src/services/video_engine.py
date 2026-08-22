import sys
import os
import json
import hashlib
import glob
import shutil
import sqlite3
import tempfile
import atexit
import urllib.request
import yt_dlp

CACHE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'media_cache')
os.makedirs(CACHE_DIR, exist_ok=True)

COOKIES_BROWSER = os.environ.get('YT_DLP_COOKIES_BROWSER', '').strip() or None

# Temporary cookie DB copies (created so yt-dlp never reads a locked browser DB)
_COOKIE_TEMP_FILES = []

def _browser_cookie_db_paths(browser):
    """Return candidate cookie DB paths for a browser on Windows."""
    b = (browser or '').lower()
    local = os.path.expandvars('%LOCALAPPDATA%')
    if b in ('chrome', 'chromium', 'chrome_beta', 'chrome_dev', 'chrome_canary'):
        base = os.path.join(local, 'Google', 'Chrome', 'User Data')
    elif b in ('edge', 'msedge'):
        base = os.path.join(local, 'Microsoft', 'Edge', 'User Data')
    elif b in ('brave', 'brave_browser'):
        base = os.path.join(local, 'BraveSoftware', 'Brave-Browser', 'User Data')
    else:
        return []
    return [
        os.path.join(base, 'Default', 'Network', 'Cookies'),
        os.path.join(base, 'Default', 'Cookies'),
    ]

def _copy_browser_cookies_to_temp(browser):
    """Copy a live browser cookie DB to a temp file via SQLite read access.

    Opening the DB with 'mode=ro&immutable=1' lets us read it even while the
    browser is open (Windows file lock), avoiding yt-dlp's
    'Could not copy Chrome cookie database' error. Returns the temp path or None.
    """
    for src in _browser_cookie_db_paths(browser):
        if not os.path.isfile(src):
            continue
        tmp = None
        try:
            fd, tmp = tempfile.mkstemp(suffix='.sqlite', prefix='ydl_cookies_')
            os.close(fd)
            src_uri = 'file:' + src.replace('\\', '/') + '?mode=ro&immutable=1'
            con_src = sqlite3.connect(src_uri, uri=True, timeout=5)
            con_dst = sqlite3.connect(tmp, timeout=5)
            try:
                con_src.backup(con_dst)
            finally:
                con_src.close()
                con_dst.close()
            if os.path.getsize(tmp) > 0:
                _COOKIE_TEMP_FILES.append(tmp)
                return tmp
        except Exception:
            if tmp and os.path.exists(tmp):
                try:
                    os.remove(tmp)
                except Exception:
                    pass
    return None

def _resolve_cookies():
    """Resolve yt-dlp cookie options. Returns a dict, or {} when none are available.

    Order of preference:
      1. An explicit backend/cookies.txt file (most reliable).
      2. A live browser cookie DB copied safely to a temp file (no lock error).
      3. yt-dlp's own cookiesfrombrowser (only as a last resort, may warn).
    """
    # 1. Explicit cookie file
    cookies_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'cookies.txt')
    if os.path.isfile(cookies_file):
        return {'cookiefile': cookies_file}

    # 2. Browser cookies (only when explicitly enabled via env var)
    if COOKIES_BROWSER:
        tmp = _copy_browser_cookies_to_temp(COOKIES_BROWSER)
        if tmp:
            return {'cookiefile': tmp}
        # Fall back to yt-dlp's mechanism (can warn if the browser is open)
        return {'cookiesfrombrowser': (COOKIES_BROWSER,)}

    return {}

@atexit.register
def _cleanup_cookie_temp_files():
    for f in _COOKIE_TEMP_FILES:
        try:
            if os.path.exists(f):
                os.remove(f)
        except Exception:
            pass

# ── Auto-detect FFmpeg ────────────────────────────────────────────────────────
_FFMPEG_CANDIDATES = [
    # Explicit env override
    os.environ.get('FFMPEG_PATH', ''),
    # WinGet install path (detected on this machine)
    r'C:\Users\97798\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.1-full_build\bin\ffmpeg.exe',
    # Common manual install paths
    r'C:\ffmpeg\bin\ffmpeg.exe',
    r'C:\Program Files\ffmpeg\bin\ffmpeg.exe',
    r'C:\Program Files (x86)\ffmpeg\bin\ffmpeg.exe',
]
_FFMPEG_PATH = None
for _c in _FFMPEG_CANDIDATES:
    if _c and os.path.isfile(_c):
        _FFMPEG_PATH = os.path.dirname(_c)   # yt-dlp wants the folder, not the binary
        break
if not _FFMPEG_PATH:
    _found = shutil.which('ffmpeg')
    if _found:
        _FFMPEG_PATH = os.path.dirname(_found)

def get_url_hash(url):
    return hashlib.md5(url.encode('utf-8')).hexdigest()[:12]

def format_duration(seconds):
    if not seconds:
        return "Unknown"
    seconds = int(seconds)
    mins, secs = divmod(seconds, 60)
    hours, mins = divmod(mins, 60)
    if hours > 0:
        return f"{hours}:{mins:02d}:{secs:02d}"
    return f"{mins}:{secs:02d}"

def format_size(bytes_size):
    if not bytes_size:
        return "N/A"
    mb = bytes_size / (1024 * 1024)
    if mb >= 1024:
        return f"{mb / 1024:.2f} GB"
    return f"{mb:.2f} MB"

def get_base_ydl_opts():
    opts = {
        'quiet': True,
        'no_warnings': True,
        'socket_timeout': 30,
        'retries': 10,
        'fragment_retries': 10,
        'js_runtimes': {'node': {}},
        'http_headers': {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
        }
    }
    # Auto-inject detected FFmpeg location
    if _FFMPEG_PATH:
        opts['ffmpeg_location'] = _FFMPEG_PATH
    # NOTE: Do NOT add cookiesfrombrowser here.
    # Chrome locks its DB while open, causing "Could not copy Chrome cookie database".
    # Cookies are injected only into specific download strategies with error handling.
    return opts


def _try_download_with_cookies(opts, url):
    """Download with cookies. If the cookie DB is locked/unavailable, retry without cookies."""
    try:
        with yt_dlp.YoutubeDL(opts) as ydl:
            ydl.download([url])
        return True
    except Exception as e:
        err = str(e).lower()
        if 'cookie' in err or 'could not copy' in err:
            # Chrome is open / DB locked — retry without cookies
            no_cookie = {k: v for k, v in opts.items()
                         if k not in ('cookiesfrombrowser', 'cookiefile')}
            return _try_download(no_cookie, url)
        return False

def extract_metadata(url):
    ydl_opts = get_base_ydl_opts()
    ydl_opts['skip_download'] = True
    
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=False)
        
        # Check if playlist or multi-item gallery
        gallery_items = []
        if 'entries' in info and info['entries']:
            entries = list(info['entries'])
            if len(entries) > 1:
                for idx, entry in enumerate(entries[:20]):
                    e_thumb = entry.get('thumbnail') or entry.get('url') or ''
                    e_url = entry.get('url') or e_thumb
                    e_ext = entry.get('ext') or ('jpg' if e_url.endswith(('.jpg', '.jpeg', '.png', '.webp')) else 'mp4')
                    gallery_items.append({
                        'index': idx + 1,
                        'title': entry.get('title') or f"Item {idx + 1}",
                        'thumbnail': e_thumb,
                        'url': e_url,
                        'ext': e_ext,
                        'mediaType': 'image' if entry.get('vcodec') == 'none' or e_ext in ['jpg', 'jpeg', 'png', 'webp'] else 'video'
                    })
            info = entries[0] if entries else info

        title = info.get('title') or "Social Media Post"
        thumbnail = info.get('thumbnail') or info.get('url') or ""
        duration = info.get('duration') or 0
        uploader = info.get('uploader') or info.get('channel') or info.get('creator') or info.get('uploader_id') or "Author"
        extractor = (info.get('extractor_key') or info.get('extractor') or 'web').lower()
        
        # Determine media type (image vs video vs gallery)
        raw_ext = (info.get('ext') or '').lower()
        has_video_formats = any(f.get('vcodec') != 'none' and f.get('vcodec') is not None for f in info.get('formats', []))
        
        if gallery_items:
            media_type = 'gallery'
        elif not has_video_formats and not duration and raw_ext in ['jpg', 'jpeg', 'png', 'gif']:
            media_type = 'image'
        else:
            media_type = 'video'

        url_hash = get_url_hash(url)
        size_bytes = info.get('filesize') or info.get('filesize_approx') or 0

        formats_list = []

        if media_type == 'image':
            formats_list.append({
                'formatId': 'original_image',
                'ext': raw_ext or 'jpg',
                'resolution': f"{info.get('width', 'Original')}x{info.get('height', 'Resolution')}",
                'label': f"Original Quality {raw_ext.upper() if raw_ext else 'Image'}",
                'sizeFormatted': format_size(size_bytes)
            })
        else:
            # Video: Extract highest quality per resolution
            if 'formats' in info and info['formats']:
                height_best = {}
                for f in info['formats']:
                    h = f.get('height')
                    if not h or f.get('vcodec') == 'none':
                        continue
                    f_size = f.get('filesize') or f.get('filesize_approx') or 0
                    tbr = f.get('tbr') or f.get('vbr') or 0
                    score = (f_size or (tbr * 1000))
                    
                    if h not in height_best:
                        height_best[h] = (f, score)
                    else:
                        if score > height_best[h][1]:
                            height_best[h] = (f, score)

                # Sort by height descending: 4K (2160p), 1440p, 1080p, 720p, 480p, 360p
                for h in sorted(height_best.keys(), reverse=True):
                    f = height_best[h][0]
                    f_size = f.get('filesize') or f.get('filesize_approx') or 0
                    fps = f.get('fps') or ''
                    fps_str = f" {int(fps)}fps" if fps and int(fps) > 30 else ''
                    
                    quality_tag = ""
                    if h >= 2160:
                        quality_tag = " (4K Ultra HD)"
                    elif h >= 1440:
                        quality_tag = " (2K Quad HD)"
                    elif h >= 1080:
                        quality_tag = " (Full HD)"
                    elif h >= 720:
                        quality_tag = " (HD)"

                    label = f"{h}p{fps_str}{quality_tag}"
                    formats_list.append({
                        'formatId': f.get('format_id'),
                        'ext': 'mp4',
                        'resolution': f"{f.get('width', '')}x{h}" if f.get('width') else f"{h}p",
                        'label': label,
                        'sizeFormatted': format_size(f_size)
                    })

            # Add MP3 High-Bitrate Audio option
            formats_list.append({
                'formatId': 'audio_mp3',
                'ext': 'mp3',
                'resolution': 'Audio Only',
                'label': 'MP3 Audio (Highest Quality 320 kbps)',
                'sizeFormatted': 'Audio'
            })

        return {
            'success': True,
            'mediaId': url_hash,
            'mediaType': media_type,
            'title': title,
            'uploader': uploader,
            'thumbnail': thumbnail,
            'duration': format_duration(duration) if media_type == 'video' else 'Image',
            'durationSeconds': duration,
            'sizeBytes': size_bytes,
            'formattedSize': format_size(size_bytes),
            'extractor': extractor,
            'sourceUrl': url,
            'gallery': gallery_items,
            'formats': formats_list[:12]
        }

def _try_download(opts, url):
    """Attempt yt-dlp download, return True on success."""
    try:
        with yt_dlp.YoutubeDL(opts) as ydl:
            ydl.download([url])
        return True
    except Exception:
        return False


def download_and_prepare_media(url, format_id=None):
    url_hash = get_url_hash(url)
    is_audio = format_id == 'audio_mp3'
    is_image_format = format_id == 'original_image'
    base_name = f"{url_hash}_{format_id or 'default'}"

    # ── Check cache ──────────────────────────────────────────────────────────────
    for cand_ext in (['mp3'] if is_audio else ['jpg', 'jpeg', 'png', 'webp', 'gif'] if is_image_format else ['mp4', 'mkv', 'webm']):
        cand_path = os.path.join(CACHE_DIR, f"{base_name}.{cand_ext}")
        if os.path.exists(cand_path) and os.path.getsize(cand_path) > 50000:
            return {'success': True, 'mediaId': url_hash, 'filePath': cand_path,
                    'fileSize': os.path.getsize(cand_path), 'format': cand_ext}

    outtmpl = os.path.join(CACHE_DIR, f"{base_name}.%(ext)s")

    def find_target_file():
        matches = [
            f for f in glob.glob(os.path.join(CACHE_DIR, f"{base_name}.*"))
            if not f.endswith(('.part', '.temp', '.ytdl', '.aria2', '.json'))
            and os.path.getsize(f) > 50000
        ]
        return max(matches, key=os.path.getctime) if matches else None

    # ── Audio path ───────────────────────────────────────────────────────────────
    if is_audio:
        opts = get_base_ydl_opts()
        opts.update({
            'outtmpl': outtmpl,
            'format': 'bestaudio[ext=m4a]/bestaudio/best',
            'postprocessors': [{'key': 'FFmpegExtractAudio',
                                 'preferredcodec': 'mp3',
                                 'preferredquality': '320'}],
        })
        _try_download(opts, url)
        target_file = find_target_file()
        if not target_file:
            raise Exception("Audio download failed")
        return {'success': True, 'mediaId': url_hash, 'filePath': target_file,
                'fileSize': os.path.getsize(target_file), 'format': os.path.splitext(target_file)[1].lstrip('.')}

    # ── Image path ───────────────────────────────────────────────────────────────
    if is_image_format or any(url.lower().split('?')[0].endswith(ext) for ext in ['.jpg', '.jpeg', '.png', '.webp', '.gif']):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=15) as resp:
                ct = resp.headers.get('Content-Type', '')
                img_ext = 'webp' if 'webp' in ct else ('png' if 'png' in ct else 'jpg')
                img_path = os.path.join(CACHE_DIR, f"{base_name}.{img_ext}")
                with open(img_path, 'wb') as fh:
                    fh.write(resp.read())
                if os.path.getsize(img_path) > 1000:
                    return {'success': True, 'mediaId': url_hash, 'filePath': img_path,
                            'fileSize': os.path.getsize(img_path), 'format': img_ext}
        except Exception:
            pass

    # ── Video path: determine format selector ────────────────────────────────────
    # If user selected a specific height (e.g. "1080", "720", "1080p")
    if format_id and format_id not in ['audio_mp3', 'original_image', 'default', 'best']:
        if format_id.endswith('p') and format_id[:-1].isdigit():
            h = int(format_id[:-1])
        elif format_id.isdigit() and int(format_id) < 10000:
            # Could be a raw yt-dlp format_id (e.g. "137") or height (e.g. "1080")
            h = int(format_id) if int(format_id) <= 4320 else None
            raw_fmt = format_id if (int(format_id) > 4320 or not int(format_id) in [144, 240, 360, 480, 720, 1080, 1440, 2160, 4320]) else None
        else:
            h, raw_fmt = None, format_id

        if format_id.endswith('p') and format_id[:-1].isdigit():
            fmt_selector = (f"bestvideo[height<={h}][ext=mp4]+bestaudio[ext=m4a]"
                            f"/bestvideo[height<={h}]+bestaudio"
                            f"/best[height<={h}]/best")
        else:
            # Numeric format_id from yt-dlp
            fmt_selector = (f"{format_id}+bestaudio[ext=m4a]"
                            f"/{format_id}+bestaudio"
                            f"/bestvideo[height<=1080]+bestaudio/best")
    else:
        # Default: absolute best quality
        fmt_selector = ("bestvideo[ext=mp4]+bestaudio[ext=m4a]"
                        "/bestvideo+bestaudio"
                        "/best")

    # ── Strategy waterfall ───────────────────────────────────────────────────────
    #
    # Cookies are only used when explicitly configured (cookies.txt or
    # YT_DLP_COOKIES_BROWSER). When present, they are applied via a static temp
    # copy so an open browser no longer triggers the "Could not copy Chrome
    # cookie database" lock error.

    cookie_opts = _resolve_cookies()
    base = get_base_ydl_opts()                       # never carries cookies
    base_with_cookies = {**base, **cookie_opts} if cookie_opts else None

    strategies = []

    # ── Strategy 1: tv_embedded + cookies (best quality, only if available) ──
    if base_with_cookies:
        strategies.append({
            **base_with_cookies,
            'format': 'bestvideo+bestaudio/best',
            'merge_output_format': 'mp4',
            'outtmpl': outtmpl,
            'extractor_args': {'youtube': {'player_client': ['tv_embedded']}},
            '_uses_cookies': True,
        })

    # ── Strategy 2: web + Node.js n-challenge solver ─────────────────────────
    strategies.append({
        **base,
        'format': fmt_selector,
        'merge_output_format': 'mp4',
        'outtmpl': outtmpl,
        'extractor_args': {'youtube': {'player_client': ['web']}},
        'js_runtimes': {'node': {}},
    })

    # ── Strategy 3: tv client ─────────────────────────────────────────────────
    strategies.append({
        **base,
        'format': fmt_selector,
        'merge_output_format': 'mp4',
        'outtmpl': outtmpl,
        'extractor_args': {'youtube': {'player_client': ['tv']}},
    })

    # ── Strategy 4: tv_embedded without cookies ──────────────────────────────
    strategies.append({
        **base,
        'format': fmt_selector,
        'merge_output_format': 'mp4',
        'outtmpl': outtmpl,
        'extractor_args': {'youtube': {'player_client': ['tv_embedded']}},
    })

    # ── Strategy 5: Height-capped best ────────────────────────────────────────
    strategies.append({
        **base,
        'format': 'bestvideo[height<=1080]+bestaudio/bestvideo+bestaudio/best',
        'merge_output_format': 'mp4',
        'outtmpl': outtmpl,
    })

    # ── Strategy 6: Last resort – android 'best' ──────────────────────────────
    strategies.append({
        **base,
        'format': 'best',
        'merge_output_format': 'mp4',
        'outtmpl': outtmpl,
        'extractor_args': {'youtube': {'player_client': ['android', 'web']}},
    })

    for i, opts in enumerate(strategies):
        uses_cookies = opts.pop('_uses_cookies', False)
        if uses_cookies and cookie_opts.get('cookiesfrombrowser'):
            # Live browser reading can still hit a lock — retry without cookies.
            success = _try_download_with_cookies(opts, url)
        else:
            success = _try_download(opts, url)
        target_file = find_target_file()
        if success and target_file:
            break

    if not target_file:
        raise Exception(f"All download strategies failed for {url}")

    if not os.path.exists(target_file) or os.path.getsize(target_file) == 0:
        raise Exception(f"Downloaded file is empty or missing: {target_file}")

    final_ext = os.path.splitext(target_file)[1].lstrip('.').lower()
    return {
        'success': True,
        'mediaId': url_hash,
        'filePath': target_file,
        'fileSize': os.path.getsize(target_file),
        'format': final_ext
    }

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print(json.dumps({'success': False, 'error': 'Usage: python video_engine.py <extract|download> <url> [format_id]'}))
        sys.exit(1)

    command = sys.argv[1]
    target_url = sys.argv[2]
    fmt = sys.argv[3] if len(sys.argv) > 3 else None

    try:
        if command == 'extract':
            res = extract_metadata(target_url)
            print(json.dumps(res))
        elif command == 'download':
            res = download_and_prepare_media(target_url, fmt)
            print(json.dumps(res))
        else:
            print(json.dumps({'success': False, 'error': f'Unknown command: {command}'}))
            sys.exit(1)
    except yt_dlp.utils.DownloadError as e:
        print(json.dumps({'success': False, 'error': f"Download failed: {str(e)}"}))
        sys.exit(1)
    except Exception as e:
        print(json.dumps({'success': False, 'error': str(e)}))
        sys.exit(1)
