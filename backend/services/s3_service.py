"""
S3 Service module for AWS S3 operations.

This module encapsulates all interactions with AWS S3, providing methods for
generating presigned URLs, listing objects, and deleting objects. It's designed
to be reusable and testable, supporting Phase 3 integration requirements.
"""

import boto3
from botocore.exceptions import ClientError, NoCredentialsError
from datetime import datetime
import uuid
from typing import List, Dict, Optional
from config import settings


class S3Service:
    """
    Service class for AWS S3 operations using boto3.

    This class handles all S3 interactions, including error handling and
    connection management. It's designed for dependency injection in FastAPI
    routers for better testability.
    """

    def __init__(self):
        """
        Initialize S3 client with AWS credentials from settings.

        Raises:
            NoCredentialsError: If AWS credentials are not available.
        """
        try:
            self.client = boto3.client(
                's3',
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_REGION
            )
            self.bucket_name = settings.S3_BUCKET_NAME
        except NoCredentialsError:
            raise NoCredentialsError("AWS credentials not found. Please check your configuration.")

    def generate_upload_url(self, filename: str, content_type: str = "application/octet-stream") -> Dict[str, str]:
        """
        Generate a presigned URL for uploading a file to S3.

        The generated key includes a date-based folder and unique identifier
        to prevent conflicts and provide organization.

        Args:
            filename (str): Original name of the file to upload.
            content_type (str): MIME type of the file. Defaults to generic binary.

        Returns:
            dict: Contains 'upload_url', 'key', and 'expires_in' fields.

        Raises:
            ClientError: If S3 operation fails.
        """
        # Create organized key structure: uploads/YYYY-MM-DD/uuid-filename
        date_folder = datetime.now().strftime('%Y-%m-%d')
        unique_id = uuid.uuid4()
        key = f"uploads/{date_folder}/{unique_id}-{filename}"

        try:
            upload_url = self.client.generate_presigned_url(
                'put_object',
                Params={
                    'Bucket': self.bucket_name,
                    'Key': key,
                    'ContentType': content_type
                },
                ExpiresIn=settings.PRESIGNED_URL_EXPIRE
            )

            return {
                "upload_url": upload_url,
                "key": key,
                "expires_in": settings.PRESIGNED_URL_EXPIRE
            }
        except ClientError as e:
            raise ClientError(f"Failed to generate upload URL: {e}")

    def generate_download_url(self, key: str) -> Dict[str, str]:
        """
        Generate a presigned URL for downloading a file from S3.

        Args:
            key (str): The S3 object key to download.

        Returns:
            dict: Contains 'download_url', 'key', and 'expires_in' fields.

        Raises:
            ClientError: If S3 operation fails or object does not exist.
        """
        try:
            download_url = self.client.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': self.bucket_name,
                    'Key': key
                },
                ExpiresIn=settings.PRESIGNED_URL_EXPIRE
            )

            return {
                "download_url": download_url,
                "key": key,
                "expires_in": settings.PRESIGNED_URL_EXPIRE
            }
        except ClientError as e:
            raise ClientError(f"Failed to generate download URL for key '{key}': {e}")

    def list_objects(self) -> Dict[str, int]:
        """
        List all objects in the configured S3 bucket.

        Returns paginated results with basic metadata for each object.

        Returns:
            dict: Contains 'objects' list and 'count' field.
                  Each object in the list has 'key', 'size', 'last_modified', and 'etag'.

        Raises:
            ClientError: If S3 operation fails.
        """
        try:
            response = self.client.list_objects_v2(Bucket=self.bucket_name)
            objects = []

            if 'Contents' in response:
                for obj in response['Contents']:
                    objects.append({
                        'key': obj['Key'],
                        'size': obj['Size'],
                        'last_modified': obj['LastModified'].isoformat(),
                        'etag': obj['ETag']
                    })

            return {
                "objects": objects,
                "count": len(objects)
            }
        except ClientError as e:
            raise ClientError(f"Failed to list objects in bucket '{self.bucket_name}': {e}")

    def delete_object(self, key: str) -> Dict[str, str]:
        """
        Delete a specific object from the S3 bucket.

        Args:
            key (str): The S3 object key to delete.

        Returns:
            dict: Confirmation with 'message' and 'key' fields.

        Raises:
            ClientError: If S3 operation fails or object does not exist.
        """
        try:
            self.client.delete_object(Bucket=self.bucket_name, Key=key)

            return {
                "message": "Object deleted successfully",
                "key": key
            }
        except ClientError as e:
            raise ClientError(f"Failed to delete object with key '{key}': {e}")

    def get_bucket_location(self) -> str:
        """
        Get the region of the configured S3 bucket.

        This can be used for health checks or debugging.

        Returns:
            str: The region where the bucket is located.

        Raises:
            ClientError: If S3 operation fails.
        """
        try:
            response = self.client.get_bucket_location(Bucket=self.bucket_name)
            # For buckets in us-east-1, 'Location' might be None
            return response.get('LocationConstraint') or 'us-east-1'
        except ClientError as e:
            raise ClientError(f"Failed to get bucket location: {e}")


# Singleton instance for dependency injection (can be replaced with dependency injection container in Phase 3)
s3_service = S3Service()
