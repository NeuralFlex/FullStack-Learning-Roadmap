"""
Configuration module for the Media Processing API.

This module handles loading environment variables and provides centralized
configuration for the application, ensuring production readiness and Phase 3 compatibility.
"""

import os
from typing import Optional
from dotenv import load_dotenv

# Load environment variables from .env file if present
load_dotenv()


class Settings:
    """
    Centralized settings configuration using environment variables.

    This class defines all configuration parameters with sensible defaults
    and validates required values for AWS integration.
    """

    # AWS Configuration
    AWS_ACCESS_KEY_ID: Optional[str] = os.getenv("AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY: Optional[str] = os.getenv("AWS_SECRET_ACCESS_KEY")
    AWS_REGION: str = os.getenv("AWS_REGION", "us-east-1")
    S3_BUCKET_NAME: str = os.getenv("S3_BUCKET_NAME", "media-processing-app-bucket")

    # API Configuration
    API_TITLE: str = "Media Processing API"
    API_DESCRIPTION: str = "API for uploading, downloading, and managing media files on AWS S3"
    API_VERSION: str = "1.0.0"

    # CORS Configuration (can be updated for Phase 3 frontend integration)
    CORS_ORIGINS: list = ["http://localhost:5173"]  # Vite dev server, add production URL in Phase 3

    # Presigned URL Configuration
    PRESIGNED_URL_EXPIRE: int = 3600  # 1 hour in seconds

    def __init__(self):
        """
        Initialize settings and validate required configuration.

        Raises:
            ValueError: If required AWS credentials are not provided.
        """
        # Validate required AWS settings
        if not self.AWS_ACCESS_KEY_ID or not self.AWS_SECRET_ACCESS_KEY:
            raise ValueError(
                "AWS credentials not found. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables."
            )

        if not self.S3_BUCKET_NAME:
            raise ValueError("S3_BUCKET_NAME environment variable is required.")


# Global settings instance
settings = Settings()
