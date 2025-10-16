# Quick Vercel Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ma-serra/OpenContracts&project-name=opencontracts&repository-name=OpenContracts)

## One-Click Deploy to Vercel

Click the button above to deploy the OpenContracts frontend to Vercel automatically.

## Required Environment Variables

After deployment, configure these environment variables in your Vercel project settings:

```bash
OPEN_CONTRACTS_REACT_APP_API_ROOT_URL=https://your-backend-url.com
OPEN_CONTRACTS_REACT_APP_USE_AUTH0=false
OPEN_CONTRACTS_REACT_APP_USE_ANALYZERS=true
OPEN_CONTRACTS_REACT_APP_ALLOW_IMPORTS=true
```

## Backend Required

⚠️ **Important**: This deploys only the frontend. You need to deploy the backend separately:

- **Recommended**: Use [Railway](https://railway.app) or [Render](https://render.com) with Docker
- **Alternative**: Any platform supporting Docker Compose (AWS, GCP, Azure)

## Full Documentation

See [Vercel Deployment Guide](docs/deployment/vercel-deployment.md) for complete instructions.