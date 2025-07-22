
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useCountdown } from '@hooks/useCountdown';
import Logo from "/logo.svg"

interface MaintenancePageProps {
  title: string;
  message: string;
  launchDate: Date;
  onCountdownEnd?: () => void;
  isLaunching?: boolean;
}

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
      staggerChildren: 0.1
    }
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 50,
    filter: "blur(10px)",
    transition: {
      duration: 0.5,
      ease: "easeIn"
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: {
    opacity: 0,
    scale: 0.5,
    transition: { duration: 0.3, ease: "easeIn" }
  }
}

const CountdownUnit: React.FC<{ value: number; label: string; isFinished: boolean; isLaunching: boolean; }> = ({ value, label, isFinished, isLaunching }) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    if (isFinished) {
      let glitchCount = 0;
      const interval = setInterval(() => {
        setDisplayValue(Math.floor(Math.random() * 100));
        glitchCount++;
        if (glitchCount > 15) { // Run glitch effect for ~0.75s
          clearInterval(interval);
          setDisplayValue(0);
        }
      }, 50);
      return () => clearInterval(interval);
    } else {
      setDisplayValue(value);
    }
  }, [isFinished, value]);

  const paddedValue = String(displayValue).padStart(2, '0');

  return (
    <motion.div className="flex flex-col items-center" variants={itemVariants}>
      <div className="relative w-16 h-20 sm:w-20 sm:h-24 md:w-28 md:h-32 bg-surface-100/50 backdrop-blur-sm border border-border rounded-xl flex items-center justify-center overflow-hidden">
        <div className="absolute top-0 bottom-1/2 bg-black/10 w-full" />
        <AnimatePresence mode="popLayout">
          <motion.span
            key={isLaunching ? `exit-${label}` : paddedValue}
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute text-4xl sm:text-5xl md:text-7xl font-black text-text-primary tracking-tighter"
          >
            {isLaunching ? '00' : paddedValue}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="mt-4 text-xs sm:text-sm md:text-base font-bold text-text-secondary uppercase tracking-widest">
        {label}
      </span>
    </motion.div>
  );
};

const MaintenancePage: React.FC<MaintenancePageProps> = ({ title, message, launchDate, onCountdownEnd, isLaunching = false }) => {
  const { days, hours, minutes, seconds, isFinished } = useCountdown(launchDate);

  useEffect(() => {
    if (isFinished && onCountdownEnd) {
      // Delay the trigger slightly to allow the glitch animation to complete.
      const timer = setTimeout(() => onCountdownEnd(), 1500);
      return () => clearTimeout(timer);
    }
  }, [isFinished, onCountdownEnd]);

  return (
    <div className="min-h-screen bg-background text-text-primary flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          animate={{ scale: isLaunching ? 5 : 1, opacity: isLaunching ? 0.5 : 0.1 }}
          transition={{ duration: 1, ease: 'circOut' }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0s' }}
        />
        <motion.div
          animate={{ scale: isLaunching ? 5 : 1, opacity: isLaunching ? 0.5 : 0.1 }}
          transition={{ duration: 1, ease: 'circOut', delay: 0.2 }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}
        />
        <motion.div
          animate={{ scale: isLaunching ? 5 : 1, opacity: isLaunching ? 0.5 : 0.1 }}
          transition={{ duration: 1, ease: 'circOut', delay: 0.1 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}
        />
      </div>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="text-center w-full"
      >
        <motion.div variants={itemVariants} className="inline-flex w-16 h-16 sm:w-20 sm:h-20 overflow-hidden bg-surface-100 border border-border rounded-2xl mb-6">
          <img src={Logo} className="w-full h-full" />
        </motion.div>
        <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter mb-4 text-text-primary">
          {title}
        </motion.h1>
        <motion.p variants={itemVariants} className="text-base sm:text-lg md:text-xl text-text-secondary max-w-sm sm:max-w-md md:max-w-2xl mx-auto mb-12">
          {message}
        </motion.p>

        <motion.div className="flex justify-center items-start gap-2 sm:gap-3 md:gap-5" variants={itemVariants}>
          <CountdownUnit value={days} label="Days" isFinished={isFinished} isLaunching={isLaunching} />
          <motion.span variants={itemVariants} className="text-4xl sm:text-5xl md:text-7xl font-black text-primary/50 pt-6 sm:pt-6 md:pt-7">:</motion.span>
          <CountdownUnit value={hours} label="Hours" isFinished={isFinished} isLaunching={isLaunching} />
          <motion.span variants={itemVariants} className="text-4xl sm:text-5xl md:text-7xl font-black text-primary/50 pt-6 sm:pt-6 md:pt-7">:</motion.span>
          <CountdownUnit value={minutes} label="Minutes" isFinished={isFinished} isLaunching={isLaunching} />
          <motion.span variants={itemVariants} className="text-4xl sm:text-5xl md:text-7xl font-black text-primary/50 pt-6 sm:pt-6 md:pt-7">:</motion.span>
          <CountdownUnit value={seconds} label="Seconds" isFinished={isFinished} isLaunching={isLaunching} />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default MaintenancePage;
