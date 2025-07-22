import React from 'react';
import { motion, Variants } from 'framer-motion';
import AnimatedText from '@components/ui/AnimateText';

interface LoaderProps {
  className?: string;
  text?: string;
  containerClassName?: string;
  textClassName?: string;
}

const Loader: React.FC<LoaderProps> = ({ className, text, containerClassName, textClassName }) => {
  const squareVariants: Variants = {
    initial: { opacity: 0.2 },
    animate: (i: number) => ({
      opacity: [0.2, 1, 0.2],
      transition: {
        delay: i * 0.1,
        duration: 1.2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    }),
  };

  const Grid = (
    <div className={`grid grid-cols-3 grid-rows-3 gap-px sm:gap-1 text-primary ${className || 'w-6 h-6'}`} role="status">
      <span className="sr-only">Loading...</span>
      {Array.from({ length: 9 }).map((_, i) => (
        <motion.div
          key={i}
          className="bg-current rounded-sm"
          variants={squareVariants}
          custom={i}
          initial="initial"
          animate="animate"
        />
      ))}
    </div>
  );

  if (text) {
    return (
      <div className={`flex items-center justify-center gap-4 ${containerClassName || ''}`}>
        {Grid}
        <AnimatedText text={text} className={textClassName || 'text-text-secondary text-lg tracking-wider'} el="p" />
      </div>
    );
  }

  return Grid;
};

export default Loader;