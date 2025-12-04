"""
Phase 2: Backend API for AWS S3 Media Operations

This FastAPI application provides endpoints for secure S3 file operations
using presigned URLs. This is a standalone Phase 2 implementation.
"""

from fastapi import FastAPI, HTTPException
from datetime import datetime
from routers.media import router as media_router

# Initialize FastAPI with Phase 2 configuration
app = FastAPI(
    title="Media Processing API - Phase 2",
    description="Backend API for S3 media operations using presigned URLs",
    version="2.0.0"
)

# Include the media router for S3 operations
app.include_router(media_router)


@app.get("/")
async def root():
    """
    API root endpoint providing basic information.
    """
    return {
        "message": "Media Processing API - Phase 2",
        "status": "running",
        "phase": "Phase 2: Backend S3 API"
    }


@app.get("/health")
async def health_check():
    """
    Health check endpoint.
    """
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "phase": "Phase 2"
    }


# Global error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return {
        "error": exc.detail,
        "status_code": exc.status_code
    }


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    return {
        "error": f"An unexpected error occurred: {str(exc)}",
        "status_code": 500
    }
