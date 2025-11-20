import React from 'react';
import { useParams } from 'react-router-dom';

export default function ClubDetail() {
  const { id } = useParams();
  
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Club Detail: {id}</h1>
      <p style={styles.text}>
        This is a placeholder for a single club's detail page. 
        We will build this out later.
      </p>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '64rem', 
    margin: '0 auto',
    padding: '2rem 1rem',
  },
  title: {
    fontSize: '1.875rem', 
    fontWeight: '700', 
    color: '#1F2937', 
    marginBottom: '1.5rem', 
  },
  text: {
    color: '#4B5563',
  },
};
