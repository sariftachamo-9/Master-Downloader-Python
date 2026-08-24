import sys
import os
import shutil
from PyQt5.QtWidgets import *
from PyQt5.QtCore import *
from PyQt5.QtGui import *
import yt_dlp

# ================== Download Worker ==================
class DownloadWorker(QThread):
    log_signal = pyqtSignal(str)
    progress_signal = pyqtSignal(int)
    finished_signal = pyqtSignal(bool, str)

    def __init__(self, url, quality, output_dir, ffmpeg_path, use_merge):
        super().__init__()
        self.url = url
        self.quality = quality
        self.output_dir = output_dir
        self.ffmpeg_path = ffmpeg_path
        self.use_merge = use_merge

    def run(self):
        try:
            if not os.path.exists(self.output_dir):
                os.makedirs(self.output_dir)

            # Determine format string
            if self.use_merge:
                format_map = {
                    "Best (Auto 8K/4K)": "bestvideo+bestaudio/best",
                    "1080p": "bestvideo[height<=1080]+bestaudio/best[height<=1080]",
                    "720p": "bestvideo[height<=720]+bestaudio/best[height<=720]",
                    "480p": "bestvideo[height<=480]+bestaudio/best[height<=480]",
                    "Audio Only (MP3)": "bestaudio/best",
                }
                format_string = format_map.get(self.quality, "bestvideo+bestaudio/best")
            else:
                # Single-file fallback (no merge required)
                format_string = "best"

            ydl_opts = {
                'format': format_string,
                'outtmpl': os.path.join(self.output_dir, '%(title)s.%(ext)s'),
                'merge_output_format': 'mp4',
                'ffmpeg_location': self.ffmpeg_path if self.use_merge else None,
                'progress_hooks': [self.progress_hook],
                'quiet': False,               # Show some output for debugging
                'verbose': True,              # Helpful for diagnosing issues
                'no_warnings': False,
                # Extractor args for YouTube SABR and TikTok
                'extractor_args': {
                    'youtube': {'player_client': ['tv_embedded']},
                    # Uncomment the line below if TikTok still fails after updating yt-dlp
                    # 'tiktok': {'device_id': ['YOUR_DEVICE_ID']},
                },
            }

            # Audio Only post-processor
            if self.quality == "Audio Only (MP3)":
                if not self.use_merge:
                    self.log_signal.emit("⚠️ FFmpeg required for audio extraction.")
                    self.finished_signal.emit(False, "FFmpeg required for audio extraction.")
                    return
                ydl_opts['postprocessors'] = [{
                    'key': 'FFmpegExtractAudio',
                    'preferredcodec': 'mp3',
                    'preferredquality': '320',
                }]

            self.log_signal.emit(f"🔍 Parsing: {self.url}")
            
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                ydl.download([self.url])
            
            # Find the downloaded file (latest in directory)
            files = [f for f in os.listdir(self.output_dir) if os.path.isfile(os.path.join(self.output_dir, f))]
            latest_file = max(files, key=lambda f: os.path.getctime(os.path.join(self.output_dir, f))) if files else None
            
            if latest_file:
                self.finished_signal.emit(True, os.path.join(self.output_dir, latest_file))
            else:
                self.finished_signal.emit(False, "File not found after download.")

        except Exception as e:
            self.finished_signal.emit(False, str(e))

    def progress_hook(self, d):
        if d['status'] == 'downloading':
            percent = d.get('_percent_str', '0%').strip('%')
            try:
                progress = int(float(percent))
                self.progress_signal.emit(progress)
                self.log_signal.emit(f"⬇️ Downloading... {percent}%")
            except:
                pass
        elif d['status'] == 'finished':
            self.log_signal.emit("✅ Processing complete!")


# ================== Main Window ==================
class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Social Media Downloader (YouTube, TikTok, IG, FB)")
        self.setFixedSize(720, 580)

        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        layout = QVBoxLayout(central_widget)
        layout.setSpacing(15)

        # Title
        title = QLabel("🌐 Social Media Video Downloader")
        title.setStyleSheet("font-size: 20px; font-weight: bold; color: #2c3e50;")
        title.setAlignment(Qt.AlignCenter)
        layout.addWidget(title)

        subtitle = QLabel("YouTube • Instagram • TikTok • Facebook • Twitter • Reddit")
        subtitle.setStyleSheet("color: #7f8c8d; font-size: 12px;")
        subtitle.setAlignment(Qt.AlignCenter)
        layout.addWidget(subtitle)

        # URL Input
        url_layout = QHBoxLayout()
        url_label = QLabel("🔗 Video URL:")
        self.url_input = QLineEdit()
        self.url_input.setPlaceholderText("Paste your link here...")
        paste_btn = QPushButton("📋 Paste")
        paste_btn.clicked.connect(self.paste_from_clipboard)
        url_layout.addWidget(url_label)
        url_layout.addWidget(self.url_input)
        url_layout.addWidget(paste_btn)
        layout.addLayout(url_layout)

        # Options
        options_layout = QHBoxLayout()
        quality_label = QLabel("Quality:")
        self.quality_combo = QComboBox()
        self.quality_combo.addItems([
            "Best (Auto 8K/4K)",
            "1080p",
            "720p",
            "480p",
            "Audio Only (MP3)"
        ])
        folder_label = QLabel("Save to:")
        self.folder_display = QLineEdit()
        self.folder_display.setReadOnly(True)
        self.folder_display.setText(os.path.join(os.getcwd(), "Downloads"))
        browse_btn = QPushButton("📂 Browse")
        browse_btn.clicked.connect(self.browse_folder)

        options_layout.addWidget(quality_label)
        options_layout.addWidget(self.quality_combo)
        options_layout.addSpacing(20)
        options_layout.addWidget(folder_label)
        options_layout.addWidget(self.folder_display)
        options_layout.addWidget(browse_btn)
        layout.addLayout(options_layout)

        # Download Button
        self.download_btn = QPushButton("⬇️ Download Now")
        self.download_btn.setStyleSheet("""
            QPushButton {
                background-color: #3498db;
                color: white;
                font-size: 16px;
                font-weight: bold;
                padding: 12px;
                border-radius: 8px;
            }
            QPushButton:hover { background-color: #2980b9; }
            QPushButton:disabled { background-color: #bdc3c7; }
        """)
        self.download_btn.clicked.connect(self.start_download)
        layout.addWidget(self.download_btn)

        # Progress Bar
        self.progress_bar = QProgressBar()
        self.progress_bar.setValue(0)
        layout.addWidget(self.progress_bar)

        # Log
        log_label = QLabel("📝 Log:")
        layout.addWidget(log_label)
        self.log_text = QTextEdit()
        self.log_text.setReadOnly(True)
        self.log_text.setStyleSheet("background-color: #f8f9fa; font-family: Consolas; font-size: 11px;")
        self.log_text.setMinimumHeight(180)
        layout.addWidget(self.log_text)

        # Status Bar
        self.status_bar = QStatusBar()
        self.setStatusBar(self.status_bar)
        self.status_bar.showMessage("Ready")

        self.worker = None
        self.downloading = False

    def paste_from_clipboard(self):
        clipboard = QApplication.clipboard()
        text = clipboard.text()
        if text:
            self.url_input.setText(text)

    def browse_folder(self):
        folder = QFileDialog.getExistingDirectory(self, "Select Download Folder")
        if folder:
            self.folder_display.setText(folder)

    def start_download(self):
        url = self.url_input.text().strip()
        if not url:
            QMessageBox.warning(self, "Error", "Please paste a valid URL.")
            return

        if self.downloading:
            return

        # ---------- FFmpeg Detection ----------
        if getattr(sys, 'frozen', False):
            base_path = sys._MEIPASS
        else:
            base_path = os.path.dirname(os.path.abspath(__file__))

        ffmpeg_path = os.path.join(base_path, "ffmpeg.exe")
        if not os.path.exists(ffmpeg_path):
            ffmpeg_path = shutil.which("ffmpeg")

        ffmpeg_available = ffmpeg_path is not None and os.path.exists(ffmpeg_path)

        quality = self.quality_combo.currentText()
        use_merge = ffmpeg_available

        # Audio Only always requires FFmpeg
        if quality == "Audio Only (MP3)" and not ffmpeg_available:
            QMessageBox.critical(
                self,
                "FFmpeg Required",
                "Audio extraction requires FFmpeg.\n\n"
                "Please download ffmpeg.exe from:\n"
                "https://www.gyan.dev/ffmpeg/builds/\n"
                "and place it in the same folder as this program."
            )
            return

        # If no FFmpeg and high quality selected, ask for fallback
        if not ffmpeg_available and quality in ["Best (Auto 8K/4K)", "1080p"]:
            reply = QMessageBox.question(
                self,
                "FFmpeg Not Found",
                "FFmpeg is required for the highest quality (4K/8K/1080p with merge).\n\n"
                "Without FFmpeg, I can download the best single-file quality (usually 720p).\n\n"
                "Continue with single-file quality?",
                QMessageBox.Yes | QMessageBox.No
            )
            if reply == QMessageBox.No:
                return
            use_merge = False
            self.log_text.append("ℹ️ FFmpeg not found. Using single-file format (no merge required).")
        elif not ffmpeg_available:
            use_merge = False
            self.log_text.append("ℹ️ FFmpeg not found. Using single-file format (no merge required).")
        else:
            self.log_text.append("✅ FFmpeg found! Downloading highest quality with merge.")

        # ---------- Start Download ----------
        self.downloading = True
        self.download_btn.setEnabled(False)
        self.download_btn.setText("⏳ Downloading...")
        self.progress_bar.setValue(0)
        self.log_text.clear()

        output_dir = self.folder_display.text()

        self.worker = DownloadWorker(url, quality, output_dir, ffmpeg_path, use_merge)
        self.worker.log_signal.connect(self.append_log)
        self.worker.progress_signal.connect(self.update_progress)
        self.worker.finished_signal.connect(self.download_finished)
        self.worker.start()

    def append_log(self, message):
        self.log_text.append(message)
        cursor = self.log_text.textCursor()
        cursor.movePosition(QTextCursor.End)
        self.log_text.setTextCursor(cursor)

    def update_progress(self, value):
        self.progress_bar.setValue(value)

    def download_finished(self, success, message):
        self.downloading = False
        self.download_btn.setEnabled(True)
        self.download_btn.setText("⬇️ Download Now")
        self.progress_bar.setValue(100 if success else 0)

        if success:
            self.status_bar.showMessage(f"✅ Done! {message}")
            QMessageBox.information(self, "Success", f"Download complete!\n\n📂 {message}")
            reply = QMessageBox.question(self, "Open Folder", "Open folder?",
                                         QMessageBox.Yes | QMessageBox.No)
            if reply == QMessageBox.Yes:
                os.startfile(os.path.dirname(message))
        else:
            self.status_bar.showMessage(f"❌ Failed: {message}")
            QMessageBox.critical(self, "Download Failed", f"Error:\n\n{message}")


# ================== Run ==================
if __name__ == "__main__":
    app = QApplication(sys.argv)
    app.setStyle("Fusion")
    window = MainWindow()
    window.show()
    sys.exit(app.exec_())