import React from 'react';

const FullPageSpinner = () => (
  <div style={containerStyle}>
    <div style={spinnerStyle}></div>
  </div>
);

export default FullPageSpinner;

const containerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
};

const spinnerStyle = {
  width: '4rem',          
  height: '4rem',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
};

