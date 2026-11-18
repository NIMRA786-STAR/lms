import React from 'react';
import { Spinner } from 'react-bootstrap';

interface LoaderProps { message?: string; fullPage?: boolean; }

const Loader: React.FC<LoaderProps> = ({ message = 'Loading...', fullPage = false }) => {
  if (fullPage) {
    return (
      <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
        style={{ zIndex: 9999, background: 'color-mix(in srgb, var(--bg-primary) 80%, transparent)', backdropFilter: 'blur(6px)' }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" style={{ width: '4rem', height: '4rem' }} />
          <p className="mt-3 fw-bold" style={{ color: 'var(--text-primary)' }}>{message}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="d-flex flex-column justify-content-center align-items-center py-5">
      <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }} />
      <p className="mt-3" style={{ color: 'var(--text-muted)' }}>{message}</p>
    </div>
  );
};

export default Loader;