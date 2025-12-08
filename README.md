# FullStack-Learning-Roadmap

A full-stack media processing application with React frontend and FastAPI backend for local and cloud media management.

## Features

- **Frontend**: Local image/video processing, compression, resizing, trimming
- **Backend**: AWS S3 integration for secure cloud storage and retrieval
- **Integration**: Upload processed media to cloud storage

## Prerequisites

- Node.js 18+
- Python 3.11+
- AWS account with S3 bucket (for cloud storage features)

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fullstack-learning-roadmap
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**

   **Backend**:
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your AWS credentials:
   # - AWS_ACCESS_KEY_ID
   # - AWS_SECRET_ACCESS_KEY
   # - AWS_REGION
   # - S3_BUCKET_NAME
   ```

   **Frontend**:
   ```bash
   cd ../frontend
   cp .env.example .env
   # VITE_API_BASE_URL is already configured for localhost:8000
   ```

4. **Start the backend (Terminal 1)**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

5. **Start the frontend (Terminal 2)**
   ```bash
   cd frontend
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - API Docs: http://localhost:8000/docs

## Development Scripts

```bash
# Install all dependencies
npm run install:all

# Start frontend dev server
npm run dev

# Build frontend
npm run build

# Lint code
npm run lint
```

## Architecture

- **Frontend**: React 19 + TypeScript + Vite for local media processing
- **Backend**: FastAPI + Boto3 for AWS S3 cloud storage operations
- **Storage**: Local file processing + AWS S3 for cloud storage