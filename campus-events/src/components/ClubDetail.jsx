import React from 'react';
import { useParams } from 'react-router-dom';

export default function ClubDetail() {
  const { id } = useParams();
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Club Detail: {id}
      </h1>
      <p className="text-gray-600">
        This is a placeholder for a single club's detail page. 
        We will build this out later.
      </p>
    </div>
  );
}
