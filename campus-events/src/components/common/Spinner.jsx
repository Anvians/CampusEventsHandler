import React from 'react';

export default function Spinner() {
  return (
    <div style={containerStyle}>
      <div style={spinnerStyle}></div>
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

const containerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '3rem', 
};

const spinnerStyle = {
  width: '3rem', 
  height: '3rem',
  borderRadius: '50%',
  borderBottom: '4px solid #4f46e5', 
  animation: 'spin 1s linear infinite',
};
