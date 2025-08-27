import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="container text-center mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h1 className="display-1 text-muted">404</h1>
          <h2 className="mb-4">Page Not Found</h2>
          <p className="lead mb-4">
            Oops! The page you're looking for doesn't exist.
          </p>
          <Link to="/" className="btn btn-primary">
            Go Back Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
