"""
Media router for handling S3 file operations.

This router groups all endpoints related to media file management on AWS S3,
providing a clean separation of concerns and preparing for Phase 3 integration
where the frontend will consume these endpoints.
"""

from fastapi import APIRouter, HTTPException, Depends
from botocore.exceptions import ClientError
from pydantic import BaseModel
from typing import List, Dict
from datetime import datetime
from services.s3_service import s3_service

# Create the router
router = APIRouter(
    prefix="/media",
    tags=["media"],
    responses={404: {"description": "Not found"}},
)


# Pydantic models for request/response schemas
class UploadURLRequest(BaseModel):
    """
    Request model for generating presigned upload URL.

    Attributes:
        filename (str): Name of the file to upload.
        content_type (str): MIME type of the file. Defaults to binary.
    """
    filename: str
    content_type: str = "application/octet-stream"


class UploadURLResponse(BaseModel):
    """
    Response model for presigned upload URL.

    Attributes:
        upload_url (str): The presigned URL for uploading.
        key (str): The S3 key where file will be uploaded.
        expires_in (int): Time in seconds until URL expires.
    """
    upload_url: str
    key: str
    expires_in: int


class DownloadURLResponse(BaseModel):
    """
    Response model for presigned download URL.

    Attributes:
        download_url (str): The presigned URL for downloading.
        key (str): The S3 key of the file.
        expires_in (int): Time in seconds until URL expires.
    """
    download_url: str
    key: str
    expires_in: int


class FileInfo(BaseModel):
    """
    Model representing file information from S3.

    Attributes:
        key (str): S3 key of the file.
        size (int): Size in bytes.
        last_modified (str): ISO 8601 timestamp.
        etag (str): S3 ETag for version control.
    """
    key: str
    size: int
    last_modified: str
    etag: str


class ListObjectsResponse(BaseModel):
    """
    Response model for listing objects in bucket.

    Attributes:
        objects (List[FileInfo]): List of files with metadata.
        count (int): Number of objects.
    """
    objects: List[FileInfo]
    count: int


class DeleteResponse(BaseModel):
    """
    Response model for delete object operation.

    Attributes:
        message (str): Success message.
        key (str): The key of the deleted object.
    """
    message: str
    key: str


# Dependency function for S3 service (can be expanded for testing)
def get_s3_service():
    """
    Dependency injection for S3 service.

    Returns:
        S3Service: The singleton S3 service instance.
    """
    return s3_service


@router.post("/upload-url", response_model=UploadURLResponse)
async def generate_upload_url(
    request: UploadURLRequest,
    s3_svc = Depends(get_s3_service)
):
    """
    Generate a presigned URL for uploading a file to S3.

    This endpoint creates a secure, time-limited URL that allows direct
    uploads to S3 without exposing AWS credentials to the client.

    Args:
        request (UploadURLRequest): Filename and content type.
        s3_svc: Injected S3 service instance.

    Returns:
        UploadURLResponse: Presigned upload URL with metadata.

    Raises:
        HTTPException: For AWS errors or invalid requests.
    """
    try:
        result = s3_svc.generate_upload_url(request.filename, request.content_type)
        return UploadURLResponse(**result)
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


@router.get("/download-url/{key:path}", response_model=DownloadURLResponse)
async def generate_download_url(
    key: str,
    s3_svc = Depends(get_s3_service)
):
    """
    Generate a presigned URL for downloading a file from S3.

    Args:
        key (str): S3 object key (supports paths with slashes).
        s3_svc: Injected S3 service instance.

    Returns:
        DownloadURLResponse: Presigned download URL with metadata.

    Raises:
        HTTPException: For AWS errors or invalid requests.
    """
    if not key:
        raise HTTPException(status_code=400, detail="Key is required")

    try:
        result = s3_svc.generate_download_url(key)
        return DownloadURLResponse(**result)
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


@router.get("/files", response_model=ListObjectsResponse)
async def list_files(s3_svc = Depends(get_s3_service)):
    """
    List all files in the configured S3 bucket.

    Returns a list of all objects with their metadata. Note: This implementation
    returns the first 1000 objects; pagination can be added in Phase 3 if needed.

    Args:
        s3_svc: Injected S3 service instance.

    Returns:
        ListObjectsResponse: List of files with count.

    Raises:
        HTTPException: For AWS errors.
    """
    try:
        result = s3_svc.list_objects()
        return ListObjectsResponse(**result)
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


@router.delete("/files/{key:path}", response_model=DeleteResponse)
async def delete_file(
    key: str,
    s3_svc = Depends(get_s3_service)
):
    """
    Delete a specific file from the S3 bucket.

    Args:
        key (str): S3 object key to delete (supports paths with slashes).
        s3_svc: Injected S3 service instance.

    Returns:
        DeleteResponse: Confirmation of deletion.

    Raises:
        HTTPException: For AWS errors or invalid requests.
    """
    if not key:
        raise HTTPException(status_code=400, detail="Key is required")

    try:
        result = s3_svc.delete_object(key)
        return DeleteResponse(**result)
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
