# utility

## Local Setup

```bash
# build
docker build -t utility .

# run
docker run -p 8080:80 utility
```

## CI/CD

Push to `main` → GitHub Actions builds and pushes `krapi0314/utility:<sha>` → ArgoCD deploys to k8s.

## URL

https://utility.kevinprk.com
