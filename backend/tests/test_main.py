"""
Backend API Tests for Media Processing App
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import os
import sys

# Add backend directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from main import app

@pytest.fixture
def client():
    """Create test client for FastAPI app"""
    return TestClient(app)

@pytest.fixture
def mock_s3_client():
    """Mock S3 client for testing"""
    with patch('main.get_s3_client') as mock_get_client:
        mock_client = MagicMock()
        mock_get_client.return_value = mock_client
        yield mock_client

class TestHealthEndpoint:
    """Test health check endpoint"""

    def test_health_endpoint_success(self, client, mock_s3_client):
        """Test health endpoint with successful S3 connection"""
        mock_s3_client.list_objects_v2.return_value = {}

        response = client.get("/health")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data
        assert "API is running and S3 connection is working" in data["message"]

    def test_health_endpoint_s3_failure(self, client, mock_s3_client):
        """Test health endpoint when S3 connection fails"""
        from botocore.exceptions import ClientError
        mock_s3_client.list_objects_v2.side_effect = ClientError(
            {"Error": {"Code": "AccessDenied"}}, "ListObjectsV2"
        )

        response = client.get("/health")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "unhealthy"
        assert "S3 connection failed" in data["message"]

class TestPresignedUrls:
    """Test presigned URL generation endpoints"""

    def test_generate_upload_url_success(self, client, mock_s3_client):
        """Test successful upload URL generation"""
        mock_s3_client.generate_presigned_url.return_value = "https://presigned-url.com"

        response = client.post("/generate-upload-url?filename=test.jpg")

        assert response.status_code == 200
        data = response.json()
        assert "upload_url" in data
        assert "key" in data
        assert "expires_in" in data
        assert data["expires_in"] == 3600

    def test_generate_download_url_success(self, client, mock_s3_client):
        """Test successful download URL generation"""
        mock_s3_client.generate_presigned_url.return_value = "https://presigned-url.com"

        response = client.post("/generate-download-url?key=test-key")

        assert response.status_code == 200
        data = response.json()
        assert "download_url" in data
        assert data["key"] == "test-key"

    def test_generate_upload_url_s3_error(self, client, mock_s3_client):
        """Test upload URL generation with S3 error"""
        from botocore.exceptions import ClientError
        mock_s3_client.generate_presigned_url.side_effect = ClientError(
            {"Error": {"Code": "InvalidAccessKeyId"}}, "GeneratePresignedUrl"
        )

        response = client.post("/generate-upload-url?filename=test.jpg")

        assert response.status_code == 500
        data = response.json()
        assert "error" in data

class TestObjectOperations:
    """Test S3 object operations"""

    def test_list_objects_success(self, client, mock_s3_client):
        """Test successful object listing"""
        mock_objects = [
            {
                "Key": "uploads/2024-01-01/test.jpg",
                "Size": 1024,
                "LastModified": MagicMock(__class__=type('datetime', (), {'isoformat': lambda self: '2024-01-01T10:00:00'})()),
                "ETag": '"etag123"'
            }
        ]
        mock_s3_client.list_objects_v2.return_value = {"Contents": mock_objects}

        response = client.get("/list-objects")

        assert response.status_code == 200
        data = response.json()
        assert "objects" in data
        assert "count" in data
        assert len(data["objects"]) == 1
        assert data["objects"][0]["key"] == "uploads/2024-01-01/test.jpg"

    def test_list_objects_empty_bucket(self, client, mock_s3_client):
        """Test object listing when bucket is empty"""
        mock_s3_client.list_objects_v2.return_value = {}

        response = client.get("/list-objects")

        assert response.status_code == 200
        data = response.json()
        assert data["objects"] == []
        assert data["count"] == 0

    def test_delete_object_success(self, client, mock_s3_client):
        """Test successful object deletion"""
        mock_s3_client.delete_object.return_value = {}

        response = client.delete("/delete-object?key=test-key")

        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Object deleted successfully"
        assert data["key"] == "test-key"

    def test_delete_object_s3_error(self, client, mock_s3_client):
        """Test object deletion with S3 error"""
        from botocore.exceptions import ClientError
        mock_s3_client.delete_object.side_effect = ClientError(
            {"Error": {"Code": "NoSuchKey"}}, "DeleteObject"
        )

        response = client.delete("/delete-object?key=nonexistent-key")

        assert response.status_code == 500
        data = response.json()
        assert "error" in data

class TestRootEndpoint:
    """Test root endpoint"""

    def test_root_endpoint(self, client):
        """Test root endpoint returns correct message"""

        response = client.get("/")

        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Media Processing API"
        assert data["status"] == "running"

class TestErrorHandling:
    """Test error handling"""

    def test_404_error(self, client):
        """Test 404 error for non-existent endpoint"""

        response = client.get("/nonexistent")

        assert response.status_code == 404

    def test_invalid_method(self, client):
        """Test invalid HTTP method"""

        response = client.patch("/")

        assert response.status_code == 405
