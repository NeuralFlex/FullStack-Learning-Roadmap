# 🎨 Media Processing App (MPA)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.11-blue.svg)](https://python.org)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-orange.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org)
[![AWS](https://img.shields.io/badge/AWS-S3%20%7C%20EC2%20%7C%20ECR-orange.svg)](https://aws.amazon.com)

> A comprehensive full-stack media processing application demonstrating modern cloud-native development practices with React, TypeScript, FastAPI, AWS S3, and CI/CD pipelines.

## 📋 Table of Contents

- [🎯 Overview](#-overview)
- [✨ Features](#-features)
- [🏗️ Architecture](#️-architecture)
- [🚀 Quick Start](#-quick-start)
- [🛠️ Development Setup](#️-development-setup)
- [🐳 Docker Development](#-docker-development)
- [🧪 Testing](#-testing)
- [📚 API Documentation](#-api-documentation)
- [☁️ AWS Setup](#-aws-setup)
- [🚀 Deployment](#-deployment)
- [📈 Project Phases](#-project-phases)
- [🏃‍♂️ Running & Testing](#-running--testing)
- [📝 Development Guidelines](#-development-guidelines)
- [🤝 Contributing](#-contributing)
- [📊 Learning Objectives](#-learning-objectives)
- [📄 License](#-license)
- [🙏 Acknowledgments](#-acknowledgments)

## 🎯 Overview

The Media Processing App (MPA) is a comprehensive full-stack application that demonstrates modern web development and cloud deployment practices. It provides a complete media management solution with real-time processing capabilities, featuring:

- **Frontend**: React 18 + TypeScript with modern UI/UX
- **Backend**: FastAPI with comprehensive API design
- **Cloud Storage**: AWS S3 with presigned URL security
- **Processing**: Canvas-based image resizing and compression
- **CI/CD**: Docker containerization and GitHub Actions
- **Deployment**: AWS EC2 with Infrastructure as Code (CDK)

## ✨ Features

### ✅ Completed Features

#### Phase 1: Frontend Processing ✅
- 🎨 Modern responsive React + TypeScript interface
- 📤 Drag-and-drop file upload for images and videos
- 🖼️ Real-time image preview and automatic resizing (canvas-based)
- 🎬 Video preview with native HTML5 video player
- 💾 Local file processing and size comparison
- 🎯 Intuitive user experience with smooth animations

#### Phase 2: Backend API + AWS S3 ✅
- 🚀 FastAPI application with automatic OpenAPI documentation
- 🔗 Secure S3 presigned URL generation for uploads/downloads
- 📋 Complete S3 bucket object management (list, delete)
- 🛡️ CORS-enabled API for frontend integration
- 📊 Health check endpoints with S3 connectivity testing
- ⚡ Comprehensive error handling and validation

#### Phase 3: Integration 🔄
- 🔗 Frontend-Backend API connectivity (ready for Phase 3)
- ☁️ S3 file operations via API (implemented)
- 💾 File upload/download/delete workflow (ready)

#### Phase 4: CI/CD 💻
- 🐳 Docker containerization (frontend + backend)
- 📦 Docker Compose for local development environment
- 🚀 Production-ready container images with health checks
- 🏗️ Multi-stage Docker builds for optimized images

#### Phase 5: Deployment ☁️
- ☁️ AWS EC2 deployment configurations (manual + CDK ready)
- 🏗️ Infrastructure as Code setup (CDK templates)
- 🔒 Security best practices and environment management

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │    │   FastAPI App   │    │     AWS S3      │
│   (Port 5173)   │◄──►│   (Port 8000)   │◄──►│   Bucket        │
│                 │    │                 │    │                 │
│ • Image/Video   │    │ • Presigned URLs│    │ • Media Storage │
│ • Canvas Proc.  │    │ • CRUD Ops      │    │ • Auto Upload   │
│ • Real-time UI  │    │ • Health Checks │    │ • CDN Access    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Docker Compose │
                    │   Local Dev      │
                    │   Environment    │
                    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org))
- **Python** 3.11+ ([Download](https://python.org))
- **Git** ([Download](https://git-scm.com))
- **Docker** & **Docker Compose** (for containerized development)
- **AWS Account** (for S3 operations)

### ⚡ 5-Minute Setup

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd media-processing-app

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your AWS credentials

# 3. Launch with Docker Compose
docker-compose up --build

# 4. Open your browser
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000/docs
```

## 🛠️ Development Setup

### Frontend Setup (React + TypeScript)

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Lint and format code
npm run lint
```

**Development Server**: http://localhost:5173

### Backend Setup (FastAPI + Python)

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run with uvicorn
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**API Documentation**: http://localhost:8000/docs

#### Backend Project Structure
```
backend/
├── main.py                 # FastAPI application entry point
├── config.py               # Configuration management with environment variables
├── services/
│   ├── __init__.py
│   └── s3_service.py       # S3 operations service layer
├── routers/
│   ├── __init__.py
│   └── media.py           # Media API endpoints router
├── requirements.txt        # Python dependencies
├── .env.example           # Environment variables template
└── tests/                 # Backend test suite
```

### AWS S3 Setup

1. **Create S3 Bucket**:
   ```bash
   aws s3 mb s3://media-processing-app-bucket --region us-east-1
   ```

2. **Create IAM User** with S3 permissions:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:GetObject",
           "s3:PutObject",
           "s3:DeleteObject",
           "s3:ListBucket"
         ],
         "Resource": [
           "arn:aws:s3:::media-processing-app-bucket",
           "arn:aws:s3:::media-processing-app-bucket/*"
         ]
       }
     ]
   }
   ```

3. **Configure Credentials** in `.env`:
   ```bash
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_REGION=us-east-1
   S3_BUCKET=media-processing-app-bucket
   ```

## 🐳 Docker Development

### Local Development with Docker Compose

```bash
# Start all services
docker-compose up --build

# Run in background
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild specific service
docker-compose up --build frontend
```

### Individual Service Development

```bash
# Frontend container
cd frontend && docker build -t mpa-frontend .
docker run -p 5173:80 mpa-frontend

# Backend container
cd backend && docker build -t mpa-backend .
docker run -p 8000:8000 --env-file ../.env mpa-backend
```

## 🧪 Testing

### Backend Tests (Python)

```bash
cd backend

# Install test dependencies
pip install -r tests/requirements-test.txt

# Run all tests
pytest tests/ -v

# Run with coverage
pytest tests/ --cov=. --cov-report=html

# Run specific test file
pytest tests/test_main.py -v
```

### Frontend Tests (JavaScript)

```bash
cd frontend

# Install dependencies (already included)
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 📚 API Documentation

The backend API is fully documented using OpenAPI/Swagger:

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | API status and welcome message |
| `POST` | `/media/upload-url` | Generate S3 upload presigned URL |
| `GET` | `/media/download-url/{key}` | Generate S3 download presigned URL for a specific file |
| `GET` | `/media/files` | List all objects in S3 bucket |
| `DELETE` | `/media/files/{key}` | Delete specific object from S3 bucket |
| `GET` | `/health` | Health check with S3 connectivity testing |
| `GET` | `/docs` | Interactive API documentation (Swagger UI) |
| `GET` | `/redoc` | Alternative API documentation |

### API Access

- **Interactive Docs**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

## ☁️ AWS Setup

### S3 Bucket Configuration

```bash
# Create bucket
aws s3 mb s3://media-processing-app-bucket --region us-east-1

# Enable versioning (recommended)
aws s3api put-bucket-versioning \
  --bucket media-processing-app-bucket \
  --versioning-configuration Status=Enabled

# Set public access block (security)
aws s3api put-public-access-block \
  --bucket media-processing-app-bucket \
  --public-access-block-configuration \
  "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
```

### Security Best Practices

- Use IAM roles instead of access keys in production
- Enable bucket encryption (SSE-S3)
- Configure lifecycle policies for cost optimization
- Set up CloudWatch monitoring and alerts
- Use VPC endpoints for enhanced security

## 🚀 Deployment

### Phase 5: EC2 Deployment

#### Manual Deployment (Console)

1. **Launch EC2 Instance**:
   - AMI: Ubuntu 22.04 LTS
   - Instance Type: t3.micro (free tier)
   - Security Group: Allow ports 80, 443, 22

2. **Configure Instance**:
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y

   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo usermod -aG docker ubuntu

   # Install Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/download/v2.18.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

3. **Deploy Application**:
   ```bash
   git clone <your-repo-url>
   cd media-processing-app

   # Configure environment
   cp .env.example .env
   nano .env  # Add your AWS credentials

   # Launch with Docker Compose
   docker-compose up -d --build
   ```

#### Infrastructure as Code (CDK)

The project includes AWS CDK templates for automated deployment:

```bash
# Install CDK
npm install -g aws-cdk

# Bootstrap CDK (one-time)
cdk bootstrap

# Deploy infrastructure
cd cdk
cdk deploy
```

### CI/CD Pipeline (GitHub Actions)

The project includes GitHub Actions workflows for:
- Automated testing on pull requests
- Docker image building and ECR push
- Security scanning and vulnerability checks
- Deployment to staging/production environments

## 📈 Project Phases

### Phase 1: Frontend Processing ✅ (4-6 hours)
- React + TypeScript application with Vite
- Image upload, preview, and canvas-based resizing
- Video upload and preview capabilities
- Modern responsive UI design

### Phase 2: Backend API + AWS S3 ✅ (4-6 hours)
- FastAPI backend with comprehensive S3 integration
- Presigned URL generation for secure uploads/downloads
- Complete CRUD operations for S3 objects
- Health checks and error handling

### Phase 3: Integration (6-8 hours)
- Connect React frontend to FastAPI backend
- Implement S3 file operations through API
- Real-time file management interface
- Error handling and loading states

### Phase 4: CI/CD (4-6 hours)
- Docker containerization for both services
- Docker Compose for local development
- GitHub Actions workflows
- AWS ECR integration

### Phase 5: Deployment (6-8 hours)
- Manual EC2 deployment via AWS Console
- Infrastructure as Code with AWS CDK
- Automated deployment pipelines
- Production optimization and monitoring

**Total Estimated Time**: 24-34 hours
**Current Progress**: ~12/24 hours completed (50%)

## 🏃‍♂️ Running & Testing

### Test the Complete Application

```bash
# Method 1: Docker Compose (Recommended)
docker-compose up --build

# Method 2: Manual Development Setup
# Terminal 1 - Frontend
cd frontend && npm run dev

# Terminal 2 - Backend
cd backend && source venv/bin/activate && uvicorn main:app --reload

# Method 3: Backend Tests
cd backend && pytest tests/ -v
```

### Feature Testing Checklist

- [x] Upload images and verify automatic resizing
- [x] Upload videos and preview playback
- [x] Download processed files
- [x] API endpoints respond correctly
- [x] Health checks pass
- [ ] S3 integration works end-to-end
- [ ] Error handling displays properly
- [ ] Mobile responsiveness works

## 📝 Development Guidelines

### Code Standards

- **Frontend**: Functional components, TypeScript strict mode, React best practices
- **Backend**: Type hints, docstrings, async/await patterns
- **Git**: Conventional commits, atomic changes
- **Security**: Never commit credentials, validate all inputs

### Project Structure

```
media-processing-app/
├── frontend/                 # React TypeScript application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── services/       # API client services
│   │   └── types/          # TypeScript definitions
│   ├── Dockerfile          # Frontend containerization
│   └── package.json        # Frontend dependencies
├── backend/                 # FastAPI application (Phase 2)
│   ├── main.py             # FastAPI application entry point
│   ├── config.py           # Configuration management
│   ├── services/           # Business logic services
│   │   └── s3_service.py   # AWS S3 operations
│   ├── routers/            # API route handlers
│   │   └── media.py        # Media management endpoints
│   ├── requirements.txt    # Python dependencies
│   ├── .env.example        # Environment variables template
│   ├── Dockerfile          # Backend containerization
│   └── tests/              # Backend test suite
├── .env.example            # Global environment template
├── docker-compose.yml      # Multi-service development setup
└── README.md               # Project documentation
```

### Environment Management

- Development: Use `.env` files locally
- Production: Use platform secrets management
- Testing: Use mock services and test fixtures

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Workflow

- Follow the established code style
- Write tests for new features
- Update documentation
- Ensure CI/CD passes
- Get code review approval

## 📊 Learning Objectives

This project demonstrates:

### Technical Skills
- **Frontend Development**: React 18, TypeScript, modern JavaScript
- **Backend Development**: FastAPI, REST APIs, async programming
- **Cloud Services**: AWS S3, IAM, security best practices
- **DevOps**: Docker, containerization, CI/CD pipelines
- **Infrastructure**: Infrastructure as Code, AWS CDK

### Soft Skills
- **Project Management**: Multi-phase development approach
- **Documentation**: Comprehensive setup and API documentation
- **Testing**: Unit and integration testing strategies
- **Code Quality**: Following industry best practices

### AWS Learning Points
- S3 bucket management and lifecycle policies
- Presigned URLs for secure file operations
- IAM roles and permissions
- EC2 instance management
- Container Registry (ECR) and deployment

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Frontend Framework**: React community and Vite team
- **Backend Framework**: FastAPI and the Python async community
- **Cloud Platform**: AWS for providing the infrastructure
- **Open Source**: All the amazing libraries and tools used

---

**Developed with ❤️ using modern web technologies and cloud-native practices**

**GitHub Issues URL**: [Create Issue](https://github.com/your-username/media-processing-app/issues)
**Project Repository**: [View on GitHub](https://github.com/your-username/media-processing-app)

---

*This project serves as a comprehensive demonstration of full-stack development, from concept to production deployment, covering the entire development lifecycle.*
