"""
Phase 2 Configuration Settings

Environment-based configuration for Phase 2 S3 operations.
"""
import os
from typing import Optional

# API Settings
API_TITLE: str = "Media Processing API - Phase 2"
API_DESCRIPTION: str = "Backend API for secure S3 media operations"
API_VERSION: str = "2.0.0"

# AWS S3 Settings
AWS_ACCESS_KEY_ID: Optional[str] = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY: Optional[str] = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION: str = os.getenv("AWS_REGION", "us-east-1")
S3_BUCKET: Optional[str] = os.getenv("S3_BUCKET")

# Validate required AWS settings
if not all([AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET]):
    raise ValueError("AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and S3_BUCKET must be set")
