import sys
import json
import yt_dlp

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

def extract_media(url):
    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
        'skip_download': True,
        'extract_flat': False,
    }
    
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=False)
        
        # If info is a playlist or multi-item entry
        if 'entries' in info and info['entries']:
            info = info['entries'][0]

        title = info.get('title') or "video"
        thumbnail = info.get('thumbnail') or ""
        duration = info.get('duration') or 0
        extractor = info.get('extractor_key', '').lower()
        
        # Determine best direct playable/downloadable url
        download_url = info.get('url')
        size_bytes = info.get('filesize') or info.get('filesize_approx') or 0
        
        formats_list = []
        if 'formats' in info and info['formats']:
            # Find best progressive mp4 or direct video url if top-level url is missing
            progressive_mp4s = [
                f for f in info['formats'] 
                if f.get('vcodec') != 'none' and f.get('acodec') != 'none' and f.get('url')
            ]
            
            if not download_url and progressive_mp4s:
                best_prog = progressive_mp4s[-1]
                download_url = best_prog.get('url')
                size_bytes = best_prog.get('filesize') or best_prog.get('filesize_approx') or size_bytes
            
            for f in info['formats']:
                if f.get('url') and (f.get('vcodec') != 'none' or f.get('acodec') != 'none'):
                    f_size = f.get('filesize') or f.get('filesize_approx') or 0
                    height = f.get('height') or ''
                    note = f.get('format_note') or ''
                    label = f"{height}p {note}".strip() if height else (f.get('format_id') or 'Standard')
                    formats_list.append({
                        'formatId': f.get('format_id'),
                        'ext': f.get('ext'),
                        'resolution': f.get('resolution') or (f"{f.get('width')}x{f.get('height')}" if f.get('height') else 'Audio only'),
                        'label': label,
                        'url': f.get('url'),
                        'hasVideo': f.get('vcodec') != 'none',
                        'hasAudio': f.get('acodec') != 'none',
                        'sizeFormatted': format_size(f_size)
                    })

        # Fallback if download_url is still empty
        if not download_url and formats_list:
            download_url = formats_list[-1]['url']

        return {
            'success': True,
            'title': title,
            'downloadUrl': download_url,
            'thumbnail': thumbnail,
            'duration': format_duration(duration),
            'durationSeconds': duration,
            'sizeBytes': size_bytes,
            'formattedSize': format_size(size_bytes),
            'extractor': extractor,
            'sourceUrl': url,
            'formats': formats_list[:10]  # Return top 10 relevant formats
        }

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'success': False, 'error': 'No URL provided'}))
        sys.exit(1)
        
    url = sys.argv[1]
    try:
        data = extract_media(url)
        print(json.dumps(data))
    except Exception as e:
        print(json.dumps({'success': False, 'error': str(e)}))
        sys.exit(1)
