import sys
import os
import json
import hashlib
import glob
import urllib.request
import yt_dlp

CACHE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'media_cache')
os.makedirs(CACHE_DIR, exist_ok=True)

COOKIES_BROWSER = os.environ.get('YT_DLP_COOKIES_BROWSER', '').strip() or None

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
        'js_runtimes': {'node': {}},
        'remote_components': ['ejs:github'],
        'http_headers': {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
        }
    }
    if COOKIES_BROWSER:
        opts['cookiesfrombrowser'] = (COOKIES_BROWSER,)
    return opts

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
        is_direct_image = raw_ext in ['jpg', 'jpeg', 'png', 'webp', 'gif']
        has_video_formats = any(f.get('vcodec') != 'none' for f in info.get('formats', []))
        
        if gallery_items:
            media_type = 'gallery'
        elif is_direct_image or (not has_video_formats and not duration):
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

def download_and_prepare_media(url, format_id=None):
    url_hash = get_url_hash(url)
    
    is_audio = format_id == 'audio_mp3'
    base_name = f"{url_hash}_{format_id or 'default'}"
    
    # Check if a cached file already exists for this exact request
    for cand_ext in (['mp3'] if is_audio else ['mp4', 'mkv', 'jpg', 'jpeg', 'png', 'webp']):
        cand_path = os.path.join(CACHE_DIR, f"{base_name}.{cand_ext}")
        if os.path.exists(cand_path) and os.path.getsize(cand_path) > 1000:
            return {
                'success': True,
                'mediaId': url_hash,
                'filePath': cand_path,
                'fileSize': os.path.getsize(cand_path),
                'format': cand_ext
            }

    ydl_opts = get_base_ydl_opts()
    ydl_opts['outtmpl'] = os.path.join(CACHE_DIR, f"{base_name}.%(ext)s")

    if is_audio:
        ydl_opts['format'] = 'bestaudio/best'
        ydl_opts['postprocessors'] = [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '320',
        }]
    else:
        # For video: Download the absolute highest quality video stream (any codec including 4K VP9/AV1) + highest quality audio stream
        # Then let FFmpeg merge them into a pristine MP4 container WITHOUT lossy re-encoding!
        ydl_opts['merge_output_format'] = 'mp4'

        if format_id and format_id not in ['audio_mp3', 'original_image', 'default', 'best']:
            if format_id.endswith('p') and format_id[:-1].isdigit():
                h = format_id[:-1]
                ydl_opts['format'] = f"bestvideo[height<={h}]+bestaudio/best[height<={h}]/best"
            else:
                ydl_opts['format'] = f"{format_id}+bestaudio/best"
        else:
            # Maximum quality selector
            ydl_opts['format'] = 'bestvideo+bestaudio/best'

    target_file = None

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            if 'entries' in info and info['entries']:
                info = info['entries'][0]

        # Locate downloaded output file in CACHE_DIR
        pattern = os.path.join(CACHE_DIR, f"{base_name}.*")
        matches = glob.glob(pattern)
        if matches:
            target_file = max(matches, key=os.path.getctime)

    except Exception as ydl_err:
        # Fallback for direct image downloads if yt-dlp reports not a video/unsupported
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
            with urllib.request.urlopen(req, timeout=15) as resp:
                content_type = resp.headers.get('Content-Type', '')
                img_ext = 'jpg'
                if 'png' in content_type: img_ext = 'png'
                elif 'webp' in content_type: img_ext = 'webp'
                
                img_path = os.path.join(CACHE_DIR, f"{base_name}.{img_ext}")
                with open(img_path, 'wb') as f:
                    f.write(resp.read())
                target_file = img_path
        except Exception:
            raise ydl_err

    if not target_file or not os.path.exists(target_file) or os.path.getsize(target_file) == 0:
        raise Exception(f"Failed to generate media file for {url}")

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
