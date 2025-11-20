import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function ErrorMessage({ message }) {
  return (
    <div style={containerStyle} role="alert">
      <div style={flexStyle}>
        <div style={iconWrapperStyle}>
          <AlertTriangle style={iconStyle} />
        </div>
        <div>
          <p style={titleStyle}>Error</p>
          <p>{message}</p>
        </div>
      </div>
    </div>
  );
}

const containerStyle = {
  backgroundColor: '#fee2e2', 
  borderLeft: '4px solid #ef4444', 
  color: '#b91c1c', 
  padding: '1rem',
  borderRadius: '0.5rem',
};

const flexStyle = {
  display: 'flex',
};

const iconWrapperStyle = {
  paddingTop: '0.25rem',
  marginRight: '1rem',
};

const iconStyle = {
  width: '24px',
  height: '24px',
  color: '#ef4444', 
};

const titleStyle = {
  fontWeight: 'bold',
  marginBottom: '0.25rem',
};
