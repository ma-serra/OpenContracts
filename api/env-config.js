export default function handler(req, res) {
  // Set CORS headers to allow frontend to access this endpoint
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/javascript');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Generate environment configuration from Vercel environment variables
  const envConfig = {
    REACT_APP_APPLICATION_DOMAIN: process.env.OPEN_CONTRACTS_REACT_APP_APPLICATION_DOMAIN || '',
    REACT_APP_APPLICATION_CLIENT_ID: process.env.OPEN_CONTRACTS_REACT_APP_APPLICATION_CLIENT_ID || '',
    REACT_APP_AUDIENCE: process.env.OPEN_CONTRACTS_REACT_APP_AUDIENCE || '',
    REACT_APP_API_ROOT_URL: process.env.OPEN_CONTRACTS_REACT_APP_API_ROOT_URL || 'https://your-backend-domain.com',
    REACT_APP_USE_AUTH0: process.env.OPEN_CONTRACTS_REACT_APP_USE_AUTH0 === 'true',
    REACT_APP_USE_ANALYZERS: process.env.OPEN_CONTRACTS_REACT_APP_USE_ANALYZERS !== 'false',
    REACT_APP_ALLOW_IMPORTS: process.env.OPEN_CONTRACTS_REACT_APP_ALLOW_IMPORTS !== 'false',
  };

  // Return as JavaScript object assignment
  const jsContent = `window._env_ = ${JSON.stringify(envConfig, null, 2)};`;
  
  res.status(200).send(jsContent);
}