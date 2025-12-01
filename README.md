# 🐱 LittleCat Blog — Architecture & Deployment Overview

**LittleCat** is a lightweight, containerized static website built to showcase Muffin the cat 🐈.
The project demonstrates a clean end-to-end deployment pipeline using **Docker → ECR → EKS → ALB**, wrapped with modern AWS infrastructure best practices.

🌐 **Live Site:** [https://littlecat.net](https://littlecat.net)

---

## 🚀 What This Project Demonstrates

This project is intentionally simple on the frontend but powerful in the backend.
It shows how a fully functional website can be deployed using production-grade cloud architecture.

---

## 🏗️ Architecture Summary

### **Frontend**

* Pure **HTML / CSS / JS** static site
* Served by **Nginx** inside a minimal **nginx:alpine** container
* Configured for:

  * Fast static asset delivery
  * Custom error pages
  * Auto-indexing disabled
  * Clean folder structure

---

## 🐳 Containerization

The application is packaged using a very small footprint:

```dockerfile
FROM nginx:alpine
COPY site/ /usr/share/nginx/html
```

✔ Keeps the image under ~7MB
✔ Secure, minimal attack surface
✔ Works perfectly for static hosting

---

## ☸️ Kubernetes (EKS) Deployment

The Docker image is pushed to **Amazon ECR**, then deployed to an **Amazon EKS** cluster using:

* **Deployment** (replica management)
* **Service** (cluster networking)
* **Ingress** (ALB integration)
* **ConfigMap** (Nginx configs if needed later)

### Kubernetes Features Used

* Rolling deployments
* Liveness / readiness probes
* Pod autoscaling-ready structure
* Managed nodes in multiple AZs (HA setup)

---

## 🌐 AWS Infrastructure

### Components used:

* **Amazon ECR** → container registry
* **Amazon EKS** → Kubernetes control plane
* **AWS ALB Ingress Controller** → exposes the site via HTTP/HTTPS
* **Amazon Route53** → DNS routing for `littlecat.net`
* **AWS ACM** → TLS certificate for HTTPS
* **VPC with isolated subnets** → secure deployment
* **IAM roles & OIDC for GitHub Actions** → secure Terraform pipeline

---

## 🔧 CI/CD (GitHub Actions + Terraform)

### GitHub Actions automates:

* Terraform plan + apply
* ECR image builds (optional)
* IAM OIDC role usage (secure, no static secrets)
* Controlled QA → Prod deployments with approval

### Terraform manages:

* ECR repository
* IAM roles & OIDC trust
* S3 backend for state
* (Optional) EKS add-ons, networking, etc.

---

## 🧩 Why This Project Is Useful

This project is extremely valuable as a **portfolio demo** because it shows your ability to:

### ✔ Build containerized applications

### ✔ Deploy workloads into Kubernetes (EKS)

### ✔ Use AWS networking and Route53

### ✔ Implement ALB ingress + ACM TLS

### ✔ Set up secure CI/CD using GitHub Actions

### ✔ Use Terraform modules & remote state

### ✔ Understand real production patterns

Even though the website itself is simple, the **cloud engineering behind it is production ready**.
