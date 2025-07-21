
import React from 'react';

interface SpinnerProps {
  className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ className = 'w-6 h-6' }) => (
  <div
    className={`animate-spin rounded-full border-2 border-text-secondary/50 border-t-primary ${className}`}
    role="status"
  >
    <span className="sr-only">Loading...</span>
  </div>
);

export default Spinner;
