# Universal File Converter

## Project Overview
A simple, clean web application to convert images to other image formats, images to PDF, and PDF to images.

## How to Run

### Prerequisites
1. **Python 3.7+** installed.
2. **Poppler** installed (Required for PDF to Image conversion).
   - **Windows**: Download binary from [github.com/oschwartz10612/poppler-windows/releases](https://github.com/oschwartz10612/poppler-windows/releases), extract, and add the `bin` folder to your System PATH.
   - **Mac**: `brew install poppler`
   - **Linux**: `sudo apt-get install poppler-utils`

### Steps
1. **Install Dependencies**:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Run Backend Server**:
   ```bash
   cd backend
   uvicorn main:app --reload
   ```
   The server will start at `http://127.0.0.1:8000`.

3. **Run Frontend**:
   - Open `frontend/index.html` in your browser.
   - Or serve it using a simple HTTP server:
     ```bash
     cd frontend
     python -m http.server 5500
     ```
     Then open `http://localhost:5500`.

## Usage
1. Drag and drop a file or click to browse.
2. Select the target format from the dropdown.
3. Click "Convert Now".
4. The converted file will automatically download.

## Features
- **Image -> Image**: Supports JPG, PNG, WEBP, BMP, GIF, TIFF.
- **Image -> PDF**: Convert any supported image to PDF.
- **PDF -> Image**: Convert PDF pages to JPG or PNG.
