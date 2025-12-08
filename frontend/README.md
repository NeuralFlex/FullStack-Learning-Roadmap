# Frontend - Media Processing App (Phase 1)

A React + TypeScript frontend application for local media processing.

## Features

- **Image Processing**: Load, preview, and resize images using canvas
- **Image Compression**: Compress images using browser-image-compression
- **Video Processing**: Load, preview, and extract thumbnails from videos
- **Video Editing**: Basic trimming with ffmpeg.js (start/end frames)
- **Responsive UI**: Modern interface with drag-and-drop upload

## Tech Stack

- React 19 + TypeScript
- Vite (build tool)
- Tailwind CSS
- FFmpeg.js for video processing
- Browser Image Compression

## Prerequisites

- Node.js 18+
- npm or yarn

## Setup & Run

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:5173 in your browser

## Usage

- **Dashboard**: Overview and main upload area
- **Image Tools**: Resize and compress uploaded images
- **Video Tools**: Trim and preview uploaded videos
- **Settings**: About and configuration

Upload files via drag-and-drop or browse button. Process images/videos locally in the browser.

## Production Build

```bash
npm run build
npm run preview
```

## Notes

This frontend runs independently for local media processing without backend dependencies.
