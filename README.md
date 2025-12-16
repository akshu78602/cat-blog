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
- Beautiful, responsive cat blog UI with dark theme
- Interactive photo gallery with lightbox viewer
- **Like buttons** - Click to like photos, see like counts in real-time
- Real-time integration with backend API
- Keyboard navigation (arrow keys, escape) in lightbox
- Mobile-responsive design

### Backend API
- RESTful API endpoints
- Photo management
- **Like functionality** - Increment and track photo likes
- Health check endpoint

## API Endpoints

- `GET /health` - Health check
- `GET /api/photos` - Get all photos with like counts
- `GET /api/photos/:id` - Get photo by ID
- `POST /api/photos/:id/like` - Like a photo (increments like count)

## Local Development

### Backend

```bash
cd backend
npm install
npm run dev  # Runs on http://localhost:3000
```

### Frontend

**Important**: The frontend needs to be served via HTTP (not file://) to work with the API due to CORS.

```bash
# Terminal 1: Start backend
cd backend
npm install
npm start  # Runs on http://localhost:3000

# Terminal 2: Start frontend server
cd site
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

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

## Data Storage

**Current Status**: Data is stored **in-memory** (not persistent)
- ✅ Works for development and testing
- ❌ Data is lost when the server restarts
- ⚠️ For production, integrate with your database (handled in separate Terraform repo)

**What's stored in memory:**
- Photo likes count
- Photo metadata

## Next Steps (Production Enhancements)

- ⚠️ **Database Integration**: Connect to PostgreSQL database (handled in separate Terraform repo)
- Add authentication/authorization
- Implement rate limiting
- Add logging and monitoring (CloudWatch, Prometheus)
- Set up SSL/TLS certificates
- Add CDN for static assets
- Implement caching strategies

