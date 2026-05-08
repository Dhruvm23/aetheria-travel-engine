# Deployment Guide: Aetheria to Google Container Registry

This guide outlines the steps to build your container, push it to GCR, and deploy it to Google Cloud Run.

## Prerequisites
- Google Cloud SDK (`gcloud`) installed and authenticated.
- Docker installed and running locally.
- Project ID: `travel-engine-495705`

---

## 1. Build the Docker Image
Build the image locally using the provided `Dockerfile`. We'll tag it directly with the GCR path.

```bash
docker build -t gcr.io/travel-engine-495705/aetheria:latest .
```

## 2. Configure Authentication
Ensure Docker is authorized to push to Google Container Registry.

```bash
gcloud auth configure-docker
```

## 3. Push to GCR
Upload the image to your private registry.

```bash
docker push gcr.io/travel-engine-495705/aetheria:latest
```

## 4. Deploy to Cloud Run
Deploy the pushed image to a scalable, serverless environment.

```bash
gcloud run deploy aetheria \
  --image gcr.io/travel-engine-495705/aetheria:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

---

> [!NOTE]
> **Artifact Registry vs GCR**: Google is transitioning to [Artifact Registry](https://cloud.google.com/artifact-registry). While `gcr.io` still works, it is recommended to use Artifact Registry for new projects. If you'd prefer to use Artifact Registry, let me know and I can update the commands.

> [!IMPORTANT]
> Ensure your `.env` variables are handled. Cloud Run allows you to set environment variables during deployment using the `--set-env-vars` flag or by using Secret Manager.
