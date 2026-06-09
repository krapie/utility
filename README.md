# utility

General-purpose developer toolbox — everything runs in the browser, nothing is sent to any server.

**Live:** https://utility.kevinprk.com

## Tools

| Tool | Description |
|---|---|
| **Hash Generator** | MD5, SHA-1, SHA-256, SHA-512 — all client-side |
| **Base64** | Encode/decode text or convert any file to Base64 |
| **Regex Tester** | Live match highlighting, capture group inspection |
| **JSON Prettifier** | Format, validate, and minify JSON with syntax highlighting |
| **YAML ↔ JSON** | Bidirectional YAML/JSON conversion |
| **String Transformer** | camelCase, snake_case, kebab-case, PascalCase, and more |
| **HAR Analyzer** | Inspect Chrome/Firefox HAR files — waterfall, timings, headers |

## Stack

| Layer | Tech |
|---|---|
| Frontend | Vite + React + TypeScript |
| YAML parsing | js-yaml |
| Serving | Nginx (static) |
| Deploy | Docker + Kubernetes (ArgoCD) |
| CI | GitHub Actions |

## Project Structure

```
utility/
├── src/
│   ├── App.tsx             # tab navigation shell
│   ├── index.css           # --kp-* design tokens + all component styles
│   └── components/
│       ├── HashGen.tsx
│       ├── Base64Tool.tsx
│       ├── RegexTester.tsx
│       ├── JsonPrettifier.tsx
│       ├── YamlJson.tsx
│       ├── StringTransformer.tsx
│       └── HarAnalyzer.tsx
├── public/
│   ├── favicon.svg
│   └── manifest.json
├── index.html
├── vite.config.ts
├── nginx.conf
└── Dockerfile
```

## Local Setup

```bash
npm install
npm run dev       # http://localhost:5173
```

Or with Docker:

```bash
docker build -t utility .
docker run -p 8080:80 utility
# open http://localhost:8080
```

## CI/CD

Push to `main` → GitHub Actions builds `krapi0314/utility:<sha>` and pushes to Docker Hub → updates `k8s/utility/deployment.yaml` in [krapie/homeserver](https://github.com/krapie/homeserver) → ArgoCD syncs to the cluster.
