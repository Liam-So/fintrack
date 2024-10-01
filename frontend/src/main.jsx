import React from 'react';
import { createRoot } from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import App from './App';
import './index.css';

const root = createRoot(document.getElementById('root'));

const domain = import.meta.env.VITE_AUTH_DOMAIN
const clientId = import.meta.env.VITE_CLIENT_ID
const callbackUrl = 'http://localhost:5173/callback'

root.render(
<Auth0Provider
    domain={domain}
    clientId={clientId}
    authorizationParams={{
      redirect_uri: callbackUrl
    }}
  >
    <App />
  </Auth0Provider>,
);