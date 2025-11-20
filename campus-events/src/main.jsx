import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './components/context/AuthContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/*  Wrap app in AuthProvider so all components can access user data */}
    <AuthProvider>
      {/* Wrap app in BrowserRouter to enable routing */}
      
        <App />
    </AuthProvider>
  </React.StrictMode>
);
