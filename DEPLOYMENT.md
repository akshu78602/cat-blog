# Deployment Guide for EKS

## How It Works

The GitHub Actions workflow (`.github/workflows/deploy-eks.yaml`) automatically:

1. **Builds Docker images** for backend and frontend
2. **Pushes to ECR** (Amazon Elastic Container Registry)
3. **Applies Kubernetes manifests** using `kubectl apply -f k8s/`
4. **Creates pods** from the Deployment YAML files
5. **Creates services** for internal networking
6. **Creates ingress** for external access

## Prerequisites

### 1. Create ECR Repositories

Before the first deployment, create ECR repositories:

```bash
aws ecr create-repository --repository-name cat-blog-api --region us-east-1
aws ecr create-repository --repository-name cat-blog-frontend --region us-east-1
```

### 2. Update Workflow Configuration

Edit `.github/workflows/deploy-eks.yaml`:

```yaml
EKS_CLUSTER_NAME: your-actual-cluster-name  # Replace this
```

### 3. Ensure IAM Permissions

Your `ci_cd_role` needs permissions for:
- ECR: `ecr:GetAuthorizationToken`, `ecr:BatchCheckLayerAvailability`, `ecr:GetDownloadUrlForLayer`, `ecr:BatchGetImage`, `ecr:PutImage`, `ecr:InitiateLayerUpload`, `ecr:UploadLayerPart`, `ecr:CompleteLayerUpload`
- EKS: `eks:DescribeCluster`, `eks:ListClusters`
- Kubernetes: Ability to apply manifests (via the EKS cluster's aws-auth ConfigMap)

## Automated Deployment

**The workflow runs automatically when you:**
- Push to `master` branch
- Change files in `backend/`, `site/`, `k8s/`, or `Dockerfile`

**What happens:**
1. GitHub Actions runner starts
2. Authenticates with AWS using your IAM role
3. Builds Docker images
4. Pushes images to ECR
5. Configures `kubectl` to connect to your EKS cluster
6. **Applies the Kubernetes YAML files** → This creates the pods!
7. Waits for pods to be ready
8. Verifies deployment

## Manual Deployment (Alternative)

If you want to deploy manually:

```bash
# 1. Build and push images
cd backend
docker build -t 424851482428.dkr.ecr.us-east-1.amazonaws.com/cat-blog-api:latest .
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 424851482428.dkr.ecr.us-east-1.amazonaws.com
docker push 424851482428.dkr.ecr.us-east-1.amazonaws.com/cat-blog-api:latest

# 2. Update image URLs in k8s files (or use sed)
sed -i '' 's|image: cat-blog-api:latest|image: 424851482428.dkr.ecr.us-east-1.amazonaws.com/cat-blog-api:latest|g' k8s/backend-deployment.yaml

# 3. Apply Kubernetes manifests
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/ingress.yaml
```

## Understanding the Kubernetes Manifests

### `k8s/backend-deployment.yaml`
- Creates a **Deployment** with 2 replicas (pods) running the API
- Creates a **Service** to expose the API internally
- Defines health checks, resource limits, environment variables

### `k8s/frontend-deployment.yaml`
- Creates a **Deployment** with 2 replicas (pods) running nginx
- Creates a **Service** to expose the frontend internally

### `k8s/ingress.yaml`
- Creates an **Ingress** to route external traffic
- Routes `/api/*` to backend service
- Routes `/*` to frontend service

## Verify Deployment

```bash
# Check pods (should see 2 backend + 2 frontend pods)
kubectl get pods

# Check services
kubectl get services

# Check ingress
kubectl get ingress

# View pod logs
kubectl logs -l app=cat-blog-api
kubectl logs -l app=cat-blog-frontend

# Describe a pod for detailed info
kubectl describe pod <pod-name>
```

## Testing the API

```bash
# Port forward to test locally
kubectl port-forward service/cat-blog-api-service 3000:80

# Test health endpoint
curl http://localhost:3000/health

# Test photos endpoint
curl http://localhost:3000/api/photos
```

## Scaling

```bash
# Scale backend pods
kubectl scale deployment cat-blog-api --replicas=3

# Scale frontend pods
kubectl scale deployment cat-blog-frontend --replicas=2
```

## Troubleshooting

```bash
# Check pod status
kubectl get pods -l app=cat-blog-api

# View pod events
kubectl describe pod <pod-name>

# Check service endpoints
kubectl get endpoints cat-blog-api-service

# View deployment status
kubectl rollout status deployment/cat-blog-api

# Check ingress controller
kubectl get pods -n ingress-nginx
```

## Common Issues

1. **Pods not starting**: Check image pull errors, resource limits, or health check failures
2. **Image pull errors**: Ensure ECR repository exists and IAM role has permissions
3. **Ingress not working**: Ensure NGINX Ingress Controller is installed in your cluster
4. **Connection refused**: Check service selectors match pod labels
