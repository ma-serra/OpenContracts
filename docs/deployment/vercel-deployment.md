# Deploying OpenContracts to Vercel

This guide explains how to deploy the OpenContracts frontend to Vercel. Note that this deployment approach separates the frontend from the backend services.

## Overview

OpenContracts is a full-stack application with:
- **Frontend**: React/TypeScript SPA (can be deployed to Vercel)
- **Backend**: Django API with PostgreSQL, Redis, Celery workers (needs separate hosting)

## Prerequisites

1. **Vercel account** - Sign up at [vercel.com](https://vercel.com)
2. **Backend deployment** - The Django backend must be deployed separately (see [Backend Deployment Options](#backend-deployment-options))

## Frontend Deployment to Vercel

### Option 1: Deploy via Vercel Dashboard

1. **Connect Repository**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your OpenContracts repository
   - Select the repository and click "Import"

2. **Configure Build Settings**
   - Framework Preset: `Vite`
   - Root Directory: `./` (leave blank for repository root)
   - Build Command: `cd frontend && yarn install && yarn build`
   - Output Directory: `frontend/dist`
   - Install Command: `cd frontend && yarn install`

3. **Set Environment Variables**
   In the Vercel project settings, add these environment variables:
   ```bash
   OPEN_CONTRACTS_REACT_APP_API_ROOT_URL=https://your-backend-url.com
   OPEN_CONTRACTS_REACT_APP_USE_AUTH0=false
   OPEN_CONTRACTS_REACT_APP_USE_ANALYZERS=true
   OPEN_CONTRACTS_REACT_APP_ALLOW_IMPORTS=true
   # Add Auth0 variables if using Auth0:
   # OPEN_CONTRACTS_REACT_APP_APPLICATION_DOMAIN=your-auth0-domain.auth0.com
   # OPEN_CONTRACTS_REACT_APP_APPLICATION_CLIENT_ID=your-auth0-client-id
   # OPEN_CONTRACTS_REACT_APP_AUDIENCE=https://your-api-audience
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your frontend

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from Repository Root**
   ```bash
   cd /path/to/OpenContracts
   vercel --prod
   ```

4. **Follow the prompts and configure as needed**

## Backend Deployment Options

The OpenContracts backend requires several services and cannot run on Vercel. Consider these alternatives:

### Recommended Platforms for Full Backend

1. **Railway** - Easy Docker deployment
   - Deploy the full Docker Compose stack
   - Supports PostgreSQL, Redis, and multi-container apps
   - [Deploy to Railway](https://railway.app)

2. **Render** - Docker and database support
   - Good for Docker Compose deployments
   - Managed PostgreSQL and Redis available
   - [Deploy to Render](https://render.com)

3. **DigitalOcean App Platform** - Container support
   - Deploy Docker containers with managed databases
   - [Deploy to DigitalOcean](https://www.digitalocean.com/products/app-platform)

4. **AWS/GCP/Azure** - Full control
   - Use ECS, Cloud Run, or Container Instances
   - Managed database services (RDS, Cloud SQL, etc.)

### Quick Backend Setup with Railway

1. **Connect your repository to Railway**
2. **Use the existing `production.yml` Docker Compose file**
3. **Set environment variables in Railway dashboard**
4. **Deploy the full stack**

## Environment Configuration

The frontend uses a dynamic environment system that works with Vercel:

1. **Runtime Configuration** - Environment variables are injected at runtime via `/env-config.js`
2. **Vercel Function** - The `api/env-config.js` serverless function generates this configuration
3. **Environment Priority** - Vercel environment variables override defaults

### Required Environment Variables

```bash
# Backend API URL (REQUIRED)
OPEN_CONTRACTS_REACT_APP_API_ROOT_URL=https://your-backend-domain.com

# Feature flags
OPEN_CONTRACTS_REACT_APP_USE_AUTH0=false
OPEN_CONTRACTS_REACT_APP_USE_ANALYZERS=true
OPEN_CONTRACTS_REACT_APP_ALLOW_IMPORTS=true

# Auth0 settings (if using Auth0)
OPEN_CONTRACTS_REACT_APP_APPLICATION_DOMAIN=your-domain.auth0.com
OPEN_CONTRACTS_REACT_APP_APPLICATION_CLIENT_ID=your-client-id
OPEN_CONTRACTS_REACT_APP_AUDIENCE=https://your-api
```

## CORS Configuration

Make sure your backend allows requests from your Vercel domain:

```python
# In your Django settings
CORS_ALLOWED_ORIGINS = [
    "https://your-vercel-app.vercel.app",
    "https://your-custom-domain.com",
]
```

## Custom Domain (Optional)

1. **In Vercel Dashboard**:
   - Go to your project settings
   - Click "Domains"
   - Add your custom domain
   - Follow DNS configuration instructions

2. **Update Backend CORS**:
   - Add your custom domain to `CORS_ALLOWED_ORIGINS`
   - Redeploy your backend

## Troubleshooting

### Common Issues

1. **API Connection Errors**
   - Verify `OPEN_CONTRACTS_REACT_APP_API_ROOT_URL` is correct
   - Check CORS settings on backend
   - Ensure backend is deployed and accessible

2. **Build Failures**
   - Check that build commands are correct in Vercel settings
   - Verify Node.js version compatibility
   - Check for missing dependencies

3. **Environment Variables Not Loading**
   - Verify variables are set in Vercel project settings
   - Check that variable names start with `OPEN_CONTRACTS_`
   - Redeploy after adding new variables

### Testing the Deployment

1. **Check Environment Config**
   - Visit `https://your-app.vercel.app/env-config.js`
   - Verify configuration values are correct

2. **Test Frontend**
   - Open the deployed app
   - Check browser console for API connection errors
   - Verify features work as expected

## Development vs Production

- **Development**: Uses `local.yml` Docker Compose with all services
- **Production**: Frontend on Vercel + Backend on separate platform
- **Benefits**: Better performance, scalability, and cost optimization

## Next Steps

1. Deploy your frontend to Vercel using this guide
2. Deploy your backend to a Docker-compatible platform
3. Configure environment variables and CORS
4. Test the full application end-to-end
5. Set up monitoring and analytics as needed

For more information, see the [main documentation](docs/configuration/choose-and-configure-docker-stack.md).