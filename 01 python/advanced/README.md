# Master Downloader

A social media video downloader with a polished static web interface and a functional Python desktop application. Download supported media in several quality levels, save files to a chosen folder, and optionally extract audio as MP3.

## Screenshots / Demo

- Open the static web interface: [index.html](index.html)
- Run the Python desktop application for real downloads: [part2.py](part2.py)

The web interface is completely static. Its download flow is a visual demo and does not connect to a server. The Python application performs the actual downloads.

## Features

- Download media from YouTube, Instagram, TikTok, Facebook, Twitter/X, and Reddit when supported by `yt-dlp`.
- Quality options for best available, 8K/4K, 1080p, 720p, and 480p where available.
- Audio-only MP3 extraction.
- Clipboard paste support in the desktop application and static web demo.
- Choose a destination folder from the desktop application.
- Progress bar and activity log during downloads.
- Automatic FFmpeg detection.
- Single-file fallback when FFmpeg is unavailable.
- Responsive static web interface.
- Light/dark theme toggle in the web interface.
- No web backend, database, account, or signup required.

## Tech Stack

- **Python 3**
- **PyQt5** for the desktop interface
- **yt-dlp** for media extraction and downloading
- **FFmpeg** for merging video/audio streams and MP3 conversion
- **HTML, CSS, and vanilla JavaScript** for the static web interface

## Project Architecture

The project has two independent entry points:

1. `index.html` provides a client-only presentation and interaction demo.
2. `part2.py` provides the functional PyQt5 desktop application.
3. `DownloadWorker` runs downloads in a `QThread` so the desktop interface remains responsive.
4. `yt-dlp` handles extraction, format selection, download progress, and post-processing.

## Installation

### 1. Clone or download the project

Place the project files in a local folder.

### 2. Create a virtual environment

On Windows PowerShell:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

If PowerShell blocks script activation, run the commands from Command Prompt instead:

```bat
.venv\Scripts\activate.bat
```

### 3. Install Python dependencies

```powershell
python -m pip install --upgrade pip
pip install PyQt5 yt-dlp
```

### 4. Install FFmpeg (recommended)

FFmpeg is required for:

- Combining separate video and audio streams
- Highest-quality merged downloads
- Audio-only MP3 conversion

Install FFmpeg and make sure `ffmpeg.exe` is either:

- Available on your system `PATH`, or
- Placed beside `part2.py`

The application also looks for a bundled `ffmpeg.exe` when packaged as an executable.

## Configuration

No configuration file is required.

The desktop application uses:

- The selected URL from the input field
- The selected quality option
- The selected destination folder
- An optional FFmpeg installation discovered automatically

The web theme preference is stored locally in the browser using `localStorage` under `master-downloader-theme`.

## Usage

### Static web interface

Open [index.html](index.html) directly in a browser. The page works without a server and demonstrates:

- URL entry and validation
- Clipboard paste feedback
- Quality selection
- Simulated download progress
- Light/dark theme switching

The static page does not download files.

### Functional desktop application

Run:

```powershell
python part2.py
```

Then:

1. Paste a supported media URL.
2. Select the desired quality.
3. Choose a destination folder.
4. Click **Download Now**.
5. Monitor progress and logs in the application window.

## Folder Structure

```text
advanced/
├── index.html       # Static web interface and demo interactions
├── part2.py         # Functional PyQt5 downloader application
├── skills-lock.json # Local skill metadata
├── README.md        # Project documentation
└── Downloads/       # Default output folder, created when needed
```

`Downloads/` is created by the Python application if it does not already exist. It may not exist in a fresh checkout.

## Security Features

- Downloads are initiated locally by the Python application.
- No project backend or remote upload service is used.
- URLs are passed to `yt-dlp` rather than executed as shell commands.
- The web interface does not request account credentials or store submitted URLs remotely.
- Destination folders are selected through the native desktop folder picker.

Only download content that you are authorized to save, and follow the terms and copyright rules of each platform.

## Testing

No automated test suite is currently included.

Recommended manual checks:

```powershell
python -m py_compile part2.py
```

Also verify the static page by opening [index.html](index.html) in a browser and testing the theme toggle, empty URL validation, and demo progress flow.

## Future Improvements

- Add automated unit tests for format selection and FFmpeg detection.
- Add a `requirements.txt` file for reproducible dependency installation.
- Add download cancellation and queue management.
- Improve error messages for platform-specific extraction failures.
- Add packaging instructions for a standalone Windows executable.
- Add a real local bridge between the web interface and the Python downloader if needed.

## License

No license has been specified for this project. All rights remain with the project author until a license is added.

## Author / Contact

**Sarif Tachamo**

Project credit: `developed by sarif tachamo`
