# Muffin's Cat Blog 🐱

A modern cat blog with a static frontend and REST API backend, designed to run on AWS EKS.

## Architecture

- **Frontend**: Static HTML/CSS/JS site served via S3/CloudFront (fast, cost-effective)
- **Backend**: Node.js/Express REST API running on EKS (scalable, dynamic)
- **Infrastructure**: 
  - Static site: AWS S3 + CloudFront
  - API: Kubernetes (EKS) with Deployment, Service, and Ingress
- **CI/CD**: GitHub Actions for automated builds and deployments

## Project Structure

```
cat-blog/
├── site/              # Static frontend files (deployed to S3)
├── backend/           # Node.js API server (deployed to EKS)
│   └── Dockerfile     # Backend container
└── k8s/               # Kubernetes manifests (backend only)
```

## Features

### Frontend
- Beautiful, responsive cat blog UI
- Photo gallery with lightbox
- Real-time integration with backend API

### Backend API
- RESTful API endpoints
- Photo management
- Like functionality
- Comments system
- Visitor analytics
- Health check endpoint

## API Endpoints

- `GET /health` - Health check
- `GET /api/photos` - Get all photos
- `GET /api/photos/:id` - Get photo by ID
- `POST /api/photos/:id/like` - Like a photo
- `GET /api/photos/:id/comments` - Get comments for a photo
- `POST /api/photos/:id/comments` - Add a comment
- `GET /api/analytics/visitors` - Get visitor count
- `GET /api/analytics/summary` - Get analytics summary

## Local Development

### Backend

```bash
cd backend
npm install
npm run dev  # Runs on http://localhost:3000
```

### Frontend

Open `site/index.html` in a browser or use a local server:

```bash
cd site
python3 -m http.server 8000
```

## Docker Build

### Backend

```bash
cd backend
docker build -t cat-blog-api:latest .
```

**Note**: Frontend is deployed directly to S3 (no Docker needed for static site)

## Kubernetes Deployment

### Prerequisites

- EKS cluster configured
- kubectl configured to access your cluster
- Docker images pushed to your container registry

### Deploy

```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/ingress.yaml

# Check status
kubectl get pods
kubectl get services
kubectl get ingress
```

### Update Ingress

Edit `k8s/ingress.yaml` to set your domain name, then:

```bash
kubectl apply -f k8s/ingress.yaml
```

## Interview-Ready Features

This project demonstrates:

✅ **Microservices Architecture** - Separate frontend and backend services  
✅ **Containerization** - Docker images for both services  
✅ **Kubernetes Deployment** - Full K8s manifests with health checks  
✅ **REST API Design** - Well-structured API endpoints  
✅ **CI/CD Integration** - GitHub Actions workflows  
✅ **Scalability** - Multiple replicas, resource limits  
✅ **Monitoring** - Health checks and readiness probes  
✅ **Best Practices** - Proper error handling, CORS, security headers  

## Next Steps (Production Enhancements)

- Add database (PostgreSQL/DynamoDB) for persistent storage
- Add authentication/authorization
- Implement rate limiting
- Add logging and monitoring (CloudWatch, Prometheus)
- Set up SSL/TLS certificates
- Add CDN for static assets
- Implement caching strategies

