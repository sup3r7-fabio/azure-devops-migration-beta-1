import React from 'react';

const NotFoundPage: React.FC = () => {
  return (
    <div style={{ padding: 32 }}>
      <h2>404 - Not Found</h2>
      <p>The page you are looking for does not exist.</p>
      <a href="/">Go Home</a>
    </div>
  );
};

export default NotFoundPage;
