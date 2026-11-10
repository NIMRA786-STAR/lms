import React from 'react';
import { Spinner } from 'react-bootstrap';

interface LoaderProps {
  message?: string;
  fullPage?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ message = 'Loading...', fullPage = false }) => {
  if (fullPage) {
    return (
      <div
        className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-white bg-opacity-75"
        style={{ zIndex: 9999 }}
      >
        <div className="text-center">
          <Spinner animation="border" variant="primary" style={{ width: '4rem', height: '4rem' }}>
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3 text-primary fw-bold">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="loader d-flex flex-column justify-content-center align-items-center py-5">
      <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-3 text-muted">{message}</p>
    </div>
  );
};

export default Loader;