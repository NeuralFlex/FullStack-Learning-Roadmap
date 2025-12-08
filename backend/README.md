# Backend - Media Processing API (Phase 2)

A FastAPI backend providing secure S3 media storage and retrieval.

## Features

- **S3 Upload**: Generate presigned URLs for secure file uploads to AWS S3
- **S3 Download**: Generate presigned URLs for secure file downloads from S3
- **File Listing**: List all objects in the S3 bucket
- **File Deletion**: Delete specific files from S3 bucket
- **Health Checks**: API and S3 connectivity verification

## Tech Stack

- FastAPI (Python web framework)
- Boto3 (AWS SDK for Python)
- Uvicorn (ASGI server)
- Pydantic (data validation)

## Prerequisites

- Python 3.11+
- AWS account with S3 bucket
- pip

## Setup & Run

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Create virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables (copy from .env.example and edit):
   ```bash
   cp .env.example .env
   # Edit .env with your AWS credentials and S3 bucket details
   ```

5. Run the server:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

6. Open API documentation at http://localhost:8000/docs

## API Endpoints

- `GET /` - API status
- `GET /health` - Health check with S3 connectivity
- `POST /media/upload-url` - Generate upload presigned URL
- `GET /media/download-url/{key}` - Generate download presigned URL
- `GET /media/files` - List S3 bucket objects
- `DELETE /media/files/{key}` - Delete S3 object

## Configuration

Required environment variables:

```bash
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
S3_BUCKET=your-bucket-name
```

## AWS Setup

1. Create an S3 bucket
2. Create an IAM user with S3 permissions for upload/download/list/delete objects
3. Configure bucket access and update .env

## Notes

This backend provides S3 media management APIs and runs independently.
