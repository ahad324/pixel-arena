

import React from 'react';

interface SpinnerProps {
  className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ className = 'w-12 h-12' }) => (
  <div
    className={`animate-spin rounded-full border-4 border-solid border-blue-500 border-t-transparent ${className}`}
    role="status"
  >
    <span className="sr-only">Loading...</span>
  </div>
);

export default Spinner;