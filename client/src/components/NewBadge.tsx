import React from 'react';

const NewBadge: React.FC = () => {
  return (
    <div
      className="absolute top-4 right-4"
      aria-label="New item"
      role="status"
    >
      <div className="relative animate-in fade-in zoom-in-95 duration-500">
        {/* The glowing ping animation */}
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
        
        {/* The actual badge */}
        <span
          className="relative inline-block px-2 py-1 text-xs font-bold tracking-wider uppercase rounded-full bg-amber-500 text-black/80 shadow-lg shadow-amber-500/20"
        >
          New
        </span>
      </div>
    </div>
  );
};

export default NewBadge;
