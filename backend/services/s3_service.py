"""
Phase 2: S3 Service for AWS Operations

Handles all AWS S3 operations using presigned URLs for secure file access.
"""

import boto3
from botocore.exceptions import ClientError
from config import AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, S3_BUCKET
from datetime import datetime

# Global S3 client
s3_client = boto3.client(
    's3',
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name=AWS_REGION
)


class S3Service:
    """Service class for S3 operations."""

    def generate_upload_url(self, filename: str, content_type: str = "application/octet-stream"):
        """
        Generate a presigned URL for uploading a file to S3.

        Args:
            filename: Name of the file
            content_type: MIME type

        Returns:
            dict: Upload URL with metadata
        """
        try:
            key = f"uploads/{filename}"
            presigned_url = s3_client.generate_presigned_url(
                'put_object',
                Params={
                    'Bucket': S3_BUCKET,
                    'Key': key,
                    'ContentType': content_type
                },
                ExpiresIn=3600  # 1 hour
            )
            return {
                'upload_url': presigned_url,
                'key': key,
                'expires_in': 3600
            }
        except ClientError as e:
            raise Exception(f"S3 upload URL generation failed: {str(e)}")

    def generate_download_url(self, key: str):
        """
        Generate a presigned URL for downloading a file from S3.

        Args:
            key: S3 object key

        Returns:
            dict: Download URL with metadata
        """
        try:
            presigned_url = s3_client.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': S3_BUCKET,
                    'Key': key
                },
                ExpiresIn=3600  # 1 hour
            )
            return {
                'download_url': presigned_url,
                'key': key,
                'expires_in': 3600
            }
        except ClientError as e:
            raise Exception(f"S3 download URL generation failed: {str(e)}")

    def list_objects(self):
        """
        List all objects in the S3 bucket.

        Returns:
            dict: List of objects with metadata
        """
        try:
            response = s3_client.list_objects_v2(Bucket=S3_BUCKET)

            if 'Contents' not in response:
                return {
                    'objects': [],
                    'count': 0
                }

            objects = []
            for obj in response['Contents']:
                objects.append({
                    'key': obj['Key'],
                    'size': obj['Size'],
                    'last_modified': obj['LastModified'].isoformat(),
                    'etag': obj['ETag']
                })

            return {
                'objects': objects,
                'count': len(objects)
            }
        except ClientError as e:
            raise Exception(f"S3 list objects failed: {str(e)}")

    def delete_object(self, key: str):
        """
        Delete an object from the S3 bucket.

        Args:
            key: S3 object key to delete

        Returns:
            dict: Deletion confirmation
        """
        try:
            s3_client.delete_object(Bucket=S3_BUCKET, Key=key)
            return {
                'message': 'Object deleted successfully',
                'key': key
            }
        except ClientError as e:
            raise Exception(f"S3 delete object failed: {str(e)}")

    def get_bucket_location(self):
        """
        Get the region/location of the S3 bucket.

        Returns:
            str: Bucket region
        """
        try:
            response = s3_client.get_bucket_location(Bucket=S3_BUCKET)
            return response.get('LocationConstraint', 'us-east-1')
        except ClientError:
            return "unknown"


# Singleton instance
s3_service = S3Service()
