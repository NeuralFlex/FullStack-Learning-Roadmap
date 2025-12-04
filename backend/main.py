"""
Main FastAPI application entry point.

This module initializes the FastAPI app with all necessary middleware,
routers, and error handlers. It integrates the modular components built
for Phase 2 and ensures readiness for Phase 3 frontend integration.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

from config import settings
from routers.media import router as media_router
from services.s3_service import s3_service

# Initialize FastAPI with configuration
app = FastAPI(
    title=settings.API_TITLE,
    description=settings.API_DESCRIPTION,
    version=settings.API_VERSION
)

# CORS middleware for Phase 3 integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include modular routers
app.include_router(media_router)  # Handles /media/* endpoints


@app.get("/")
async def root():
    """
    Root endpoint providing basic API information.

    Returns:
        dict: API status and basic information.
    """
    return {
        "message": "Media Processing API",
        "status": "running",
        "version": settings.API_VERSION
    }


@app.get("/health")
async def health_check():
    """
    Health check endpoint to verify the API and S3 connectivity.

    This endpoint performs basic connectivity tests to ensure the service
    is operational and ready for Phase 3 integration.

    Returns:
        dict: Health status with S3 connectivity information.
    """
    try:
        # Test S3 connectivity
        bucket_location = s3_service.get_bucket_location()

        return {
            "status": "healthy",
            "message": "API is running and S3 connection is working",
            "bucket_region": bucket_location,
            "timestamp": datetime.now().isoformat()
        }

    except Exception as e:
        return {
            "status": "unhealthy",
            "message": f"S3 connection failed: {str(e)}",
            "timestamp": datetime.now().isoformat()
        }


# Global error handlers for production readiness
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """
    Global handler for HTTP exceptions.
    """
    return {
        "error": exc.detail,
        "status_code": exc.status_code
    }


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """
    Global handler for unexpected exceptions.
    Provides generic error responses while logging details internally.
    """
    return {
        "error": f"An unexpected error occurred: {str(exc)}",
        "status_code": 500
    }
