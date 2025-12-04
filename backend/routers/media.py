"""
Phase 2: Media Router for S3 Operations

Provides secure presigned URL endpoints for S3 media operations.
"""

from fastapi import APIRouter, HTTPException
from botocore.exceptions import ClientError
from services.s3_service import s3_service

# Create the router
router = APIRouter(
    prefix="/media",
    tags=["media"],
    responses={404: {"description": "Not found"}},
)


@router.post("/upload-url")
async def generate_upload_url(filename: str, content_type: str = "application/octet-stream"):
    """
    Generate a presigned URL for uploading a file to S3.

    Args:
        filename: Name of the file to upload
        content_type: MIME type (defaults to binary)

    Returns:
        dict: Upload URL and metadata
    """
    try:
        result = s3_service.generate_upload_url(filename, content_type)
        return result
    except ClientError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate upload URL: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {str(e)}"
        )


@router.get("/download-url/{key:path}")
async def generate_download_url(key: str):
    """
    Generate a presigned URL for downloading a file from S3.

    Args:
        key: S3 object key

    Returns:
        dict: Download URL and metadata
    """
    if not key:
        raise HTTPException(status_code=400, detail="Key is required")

    try:
        result = s3_service.generate_download_url(key)
        return result
    except ClientError as e:
        raise HTTPException(
            status_code=404 if "NoSuchKey" in str(e) else 500,
            detail=f"Failed to generate download URL: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {str(e)}"
        )


@router.get("/files")
async def list_files():
    """
    List all files in the S3 bucket.

    Returns:
        dict: List of files with metadata
    """
    try:
        result = s3_service.list_objects()
        return result
    except ClientError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to list objects: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {str(e)}"
        )


@router.delete("/files/{key:path}")
async def delete_file(key: str):
    """
    Delete a specific file from the S3 bucket.

    Args:
        key: S3 object key to delete

    Returns:
        dict: Deletion confirmation
    """
    if not key:
        raise HTTPException(status_code=400, detail="Key is required")

    try:
        result = s3_service.delete_object(key)
        return result
    except ClientError as e:
        raise HTTPException(
            status_code=404 if "NoSuchKey" in str(e) else 500,
            detail=f"Failed to delete object: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {str(e)}"
        )
