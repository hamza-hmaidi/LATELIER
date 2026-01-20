# Continuous Deployment Architecture

## Overview
This document describes the Continuous Deployment (CD) architecture implemented for this project.  
The objective is to automatically build, package, and deploy the API in a **reproducible, secure, and cloud-ready** manner using modern DevOps practices.

The pipeline is defined in:
```
.github/workflows/main.yml
```

and relies on **GitHub Actions**, **Docker**, **Amazon ECR**, and **Amazon EC2**.

---

## Global Architecture

GitHub (push on main)  
→ GitHub Actions (CI/CD pipeline)  
→ Docker image build  
→ Push image to Amazon ECR  
→ Deploy container on Amazon EC2  
→ API exposed via EC2 Security Group

This approach ensures:
- deterministic builds
- environment parity (local = prod)
- fast rollback and redeploy
- minimal operational complexity

---

## GitHub Actions – CI/CD Pipeline

### Trigger
The pipeline is triggered automatically on:
- push to the `main` branch

This guarantees that **each validated change is deployable**.

---

### Pipeline Steps (main.yml)

1. **Checkout repository**
   - Retrieves the source code.

2. **Configure AWS credentials**
   - Uses GitHub Secrets to inject:
     - AWS access key
     - AWS secret key
     - AWS region
   - No credentials are stored in the repository.

3. **Login to Amazon ECR**
   - Authenticates Docker with ECR.

4. **Build Docker image**
   - Builds a production-ready image using the `Dockerfile`.
   - Application is compiled (`dist/`) before runtime execution.

5. **Push image to ECR**
   - Image is tagged and pushed to the private ECR repository.

6. **Deploy to EC2**
   - EC2 pulls the latest image from ECR.
   - Existing container is stopped and replaced.
   - Application restarts with the new version.

This pipeline follows a **build once, deploy everywhere** philosophy.

---

## Docker Architecture

### Why Docker
- Ensures identical runtime across environments
- Simplifies deployment and rollback
- Removes dependency on host configuration

### Docker Image
- Based on a lightweight Node.js runtime
- Uses compiled `dist/` code
- Exposes the application port explicitly

This keeps the image:
- small
- fast to pull
- production-ready

---

## Amazon ECR (Elastic Container Registry)

- Acts as a **private Docker registry**
- Stores versioned application images
- Integrated natively with AWS IAM

Benefits:
- secure image storage
- access controlled via IAM roles
- no public exposure of images

---

## Amazon EC2 – Runtime Environment

- Hosts the Docker container
- Pulls images directly from ECR
- Runs the API as a long-lived service

EC2 was chosen for:
- simplicity
- full control over networking
- suitability for a technical test scope

---

## Security Groups

Security Groups act as **network firewalls**:

- Allow inbound traffic only on:
  - application port
- Restrict unnecessary inbound access
- Outbound traffic allowed for:
  - ECR image pull
  - external API access if needed

This minimizes the attack surface.

---

## IAM Roles & Permissions

### IAM Role for EC2
- Attached directly to the EC2 instance
- Grants:
  - read access to Amazon ECR
- No credentials stored on the server

### GitHub Actions IAM User
- Limited permissions:
  - push images to ECR
- Credentials stored securely in GitHub Secrets

This follows the **principle of least privilege**.

---

## Why This Architecture Is Production-Oriented

- Fully automated deployment
- Secure credential handling
- Containerized runtime
- Clear separation of concerns:
  - CI/CD
  - registry
  - compute
  - network security

Even for a simple API, this setup reflects **real-world backend deployment standards**.

---

## Possible Improvements

With more time, this architecture could be extended with:
- Blue/green or rolling deployments
- Load balancer (ALB)
- HTTPS termination
- Auto-scaling group
- Infrastructure as Code (Terraform)

---

## Conclusion

This CD pipeline ensures that:
- each commit is traceable
- deployments are reproducible
- infrastructure remains simple and secure

It provides a solid and scalable foundation while remaining perfectly adapted to the scope of this technical test.
