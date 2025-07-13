

import { useState, useEffect } from 'react';

export const useDeviceDetection = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Using `matchMedia('(pointer: coarse)')` is a more robust way to detect
    // touch-first devices (like phones and tablets) vs. devices where a fine
    // pointer (like a mouse or trackpad) is the primary input, even if they
    // have a touchscreen (like many modern laptops).
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    setIsMobile(isCoarsePointer);
    
    // The pointer type doesn't typically change on resize, so a one-time check is sufficient.
  }, []);

  return { isMobile };
};