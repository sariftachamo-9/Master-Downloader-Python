#!/usr/bin/env python3
"""
Universal Social Media Downloader (Max Quality Edition)
Supports: YouTube, Instagram, TikTok, Facebook, Twitter/X, Reddit, Vimeo, Twitch, and 1000+ sites
Downloads maximum quality available: 4K / 1080p 60fps Video, 320kbps MP3 Audio, and Full-Res Images
Based on yt-dlp - https://github.com/yt-dlp/yt-dlp
"""

import os
import glob
import urllib.request
import yt_dlp

# ============ Configuration ============
DOWNLOAD_DIR = "./downloads"          # Default download directory
QUALITY = "best"                      # Video quality: best, 4k, 1080p, 720p, audio, image
MAX_DOWNLOADS = 10                    # Max number of items in a batch
# ======================================


def progress_hook(d):
    """Progress callback for downloads."""
    if d.get("status") == "downloading":
        percent = d.get("_percent_str", "0%").strip()
        speed = d.get("_speed_str", "N/A").strip()
        eta = d.get("_eta_str", "N/A").strip()
        print(f"\r  Progress: {percent} | Speed: {speed} | ETA: {eta}", end="", flush=True)
    elif d.get("status") == "finished":
        print("\n  ✅ Download finished, processing...")


def get_ydl_options(output_dir=None, quality=None, custom_name=None, audio_only=False, browser_cookies=None):
    """
    Build yt-dlp options dictionary with maximum quality preservation.
    """
    if output_dir is None:
        output_dir = DOWNLOAD_DIR

    os.makedirs(output_dir, exist_ok=True)

    if custom_name:
        filename_template = f"{custom_name}.%(ext)s"
    else:
        filename_template = "%(title)s_%(upload_date)s.%(ext)s"

    selected_quality = quality if quality else QUALITY

    ydl_opts = {
        "outtmpl": os.path.join(output_dir, filename_template),
        "progress_hooks": [progress_hook],
        "quiet": False,
        "no_warnings": True,
        "js_runtimes": {"nodejs": {}},
        "extractor_args": {
            "youtube": {
                "player_client": ["tv_embedded", "web_creator", "web", "ios", "android"]
            }
        },
        "http_headers": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Accept-Language": "en-US,en;q=0.9",
        }
    }

    if browser_cookies:
        ydl_opts["cookiesfrombrowser"] = (browser_cookies,)

    if audio_only or selected_quality.lower() in ["audio", "mp3", "bestaudio"]:
        ydl_opts["format"] = "bestaudio/best"
        ydl_opts["postprocessors"] = [{
            "key": "FFmpegExtractAudio",
            "preferredcodec": "mp3",
            "preferredquality": "320",
        }]
    else:
        ydl_opts["merge_output_format"] = "mp4"

        # Quality target
        if selected_quality.endswith("p") and selected_quality[:-1].isdigit():
            height = selected_quality[:-1]
            ydl_opts["format"] = f"bestvideo[height<={height}]+bestaudio/best[height<={height}]/best"
        elif selected_quality.lower() in ["4k", "2160p"]:
            ydl_opts["format"] = "bestvideo[height<=2160]+bestaudio/best[height<=2160]/best"
        elif selected_quality.lower() in ["1080p", "fhd"]:
            ydl_opts["format"] = "bestvideo[height<=1080]+bestaudio/best[height<=1080]/best"
        else:
            # Absolute best quality (4K/8K, 60fps) + best audio
            ydl_opts["format"] = "bestvideo+bestaudio/best"

    return ydl_opts, output_dir


def download_media(url, output_dir=None, quality=None, custom_name=None, audio_only=False, browser_cookies=None):
    """
    Download media (video/audio/image) with highest possible fidelity.

    Parameters:
        url: media link to download
        output_dir: output directory (default: DOWNLOAD_DIR)
        quality: quality setting (default: 'best', or '4k', '1080p', '720p', 'audio')
        custom_name: custom filename without extension
        audio_only: if True, converts and extracts highest bitrate MP3
        browser_cookies: browser name for private cookies ('chrome', 'firefox', 'edge')
    Returns:
        (success: bool, filepath: str, error: str)
    """
    ydl_opts, target_dir = get_ydl_options(
        output_dir=output_dir,
        quality=quality,
        custom_name=custom_name,
        audio_only=audio_only,
        browser_cookies=browser_cookies
    )

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            print(f"\n📥 Parsing: {url}")
            info = ydl.extract_info(url, download=False)
            if info:
                if 'entries' in info and info['entries']:
                    info = info['entries'][0]
                title = info.get("title", "Unknown Title")
                duration = info.get("duration", 0)
                uploader = info.get("uploader", "Unknown Author")
                ext = info.get("ext", "mp4")
                print(f"📹 Title: {title}")
                print(f"👤 Author: {uploader}")
                if duration:
                    print(f"⏱️  Duration: {duration} seconds")
                print(f"📂 Downloading highest quality available...")

            ydl.download([url])

            pattern = os.path.join(target_dir, "*")
            files = glob.glob(pattern)
            latest_file = max(files, key=os.path.getctime) if files else None

            print(f"\n✅ Download complete: {latest_file}")
            return True, latest_file, None

    except yt_dlp.utils.DownloadError as e:
        # Fallback for direct image downloads
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=15) as resp:
                content_type = resp.headers.get('Content-Type', '')
                if 'image' in content_type:
                    ext = 'jpg'
                    if 'png' in content_type: ext = 'png'
                    elif 'webp' in content_type: ext = 'webp'
                    filename = f"{custom_name or 'image'}.{ext}"
                    filepath = os.path.join(target_dir, filename)
                    with open(filepath, 'wb') as f:
                        f.write(resp.read())
                    print(f"\n✅ Image download complete: {filepath}")
                    return True, filepath, None
        except Exception:
            pass

        error_msg = f"Download failed: {str(e)}"
        print(f"\n❌ {error_msg}")
        return False, None, error_msg
    except Exception as e:
        error_msg = f"Unexpected error: {str(e)}"
        print(f"\n❌ {error_msg}")
        return False, None, error_msg


def download_batch(urls, output_dir=None, quality=None, audio_only=False):
    """Download multiple URLs in batch."""
    success_count = 0
    fail_count = 0

    batch_list = urls[:MAX_DOWNLOADS]
    for i, url in enumerate(batch_list, 1):
        print(f"\n{'='*50}")
        print(f"[{i}/{len(batch_list)}] {url}")
        success, filepath, error = download_media(url, output_dir=output_dir, quality=quality, audio_only=audio_only)
        if success:
            success_count += 1
        else:
            fail_count += 1

    print(f"\n{'='*50}")
    print(f"📊 Batch complete: {success_count} succeeded, {fail_count} failed")
    return success_count, fail_count


def is_supported_url(url):
    """Basic check if URL is likely supported by yt-dlp."""
    supported_domains = [
        "youtube.com", "youtu.be",
        "instagram.com",
        "tiktok.com",
        "facebook.com", "fb.watch", "fb.com",
        "twitter.com", "x.com",
        "reddit.com",
        "vimeo.com",
        "twitch.tv",
        "dailymotion.com",
        "bilibili.com",
        "pinterest.com",
    ]
    return any(domain in url.lower() for domain in supported_domains)


def main():
    """Interactive CLI main program."""
    print("=" * 60)
    print("🌐  Universal Social Media Downloader (Max Quality)")
    print("   Supports: YouTube, Instagram, TikTok, Facebook, Twitter/X, Reddit, ...")
    print("   Powered by yt-dlp & FFmpeg (4K / 1080p / MP3 / Full-Res Images)")
    print("=" * 60)

    while True:
        print("\nChoose an option:")
        print("  1. Download video/media (Highest Quality / 4K / 1080p)")
        print("  2. Download audio only (320 kbps MP3)")
        print("  3. Batch download (multiple links)")
        print("  4. Change download directory")
        print("  5. Exit")

        choice = input("\nEnter option (1-5): ").strip()

        if choice == "1":
            url = input("Enter media link: ").strip()
            if not url:
                print("⚠️  Link cannot be empty")
                continue
            if not is_supported_url(url):
                print(f"⚠️  This link domain is not in the common list: {url}")
                confirm = input("Continue anyway with yt-dlp? (y/n): ").strip().lower()
                if confirm != "y":
                    continue

            custom_name = input("Custom filename (leave blank for default): ").strip() or None
            quality = input(f"Quality (best, 4k, 1080p, 720p, default: {QUALITY}): ").strip() or QUALITY
            download_media(url, custom_name=custom_name, quality=quality)

        elif choice == "2":
            url = input("Enter media link for MP3: ").strip()
            if not url:
                print("⚠️  Link cannot be empty")
                continue
            custom_name = input("Custom filename (leave blank for default): ").strip() or None
            download_media(url, custom_name=custom_name, audio_only=True)

        elif choice == "3":
            print("Enter multiple links (one per line, empty line to finish):")
            urls = []
            while True:
                line = input().strip()
                if not line:
                    break
                urls.append(line)

            if not urls:
                print("⚠️  No links entered")
                continue

            print(f"\nYou entered {len(urls)} links, will download up to {MAX_DOWNLOADS}")
            quality = input(f"Quality (best, 4k, 1080p, 720p, audio, default: {QUALITY}): ").strip() or QUALITY
            download_batch(urls, quality=quality)

        elif choice == "4":
            global DOWNLOAD_DIR
            new_dir = input(f"Current directory: {DOWNLOAD_DIR}\nNew directory path: ").strip()
            if new_dir:
                DOWNLOAD_DIR = new_dir
                print(f"✅ Download directory updated to: {DOWNLOAD_DIR}")

        elif choice == "5":
            print("👋 Goodbye!")
            break

        else:
            print("❌ Invalid option, please try again")


if __name__ == "__main__":
    main()
