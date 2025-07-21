import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCountdown } from '@hooks/useCountdown';
import Logo from "/logo.svg"

interface MaintenancePageProps {
  title: string;
  message: string;
  launchDate: Date;
}

const CountdownUnit: React.FC<{ value: number; label: string }> = ({ value, label }) => {
  const paddedValue = String(value).padStart(2, '0');
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-16 h-20 sm:w-20 sm:h-24 md:w-28 md:h-32 bg-surface-100/50 backdrop-blur-sm border border-border rounded-xl flex items-center justify-center overflow-hidden">
        <div className="absolute top-0 bottom-1/2 bg-black/10 w-full" />
        <AnimatePresence mode="popLayout">
          <motion.span
            key={paddedValue}
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute text-4xl sm:text-5xl md:text-7xl font-black text-text-primary tracking-tighter"
          >
            {paddedValue}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="mt-4 text-xs sm:text-sm md:text-base font-bold text-text-secondary uppercase tracking-widest">
        {label}
      </span>
    </div>
  );
};

const MaintenancePage: React.FC<MaintenancePageProps> = ({ title, message, launchDate }) => {
  const { days, hours, minutes, seconds } = useCountdown(launchDate);

  return (
    <div className="min-h-screen bg-background text-text-primary flex items-center justify-center p-4 relative overflow-hidden">
      {/* Aurora background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center w-full"
      >
        <div className="inline-flex w-16 h-16 sm:w-20 sm:h-20 overflow-hidden bg-surface-100 border border-border rounded-2xl mb-6">
          <img src={Logo} className="w-full h-full" />
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter mb-4 text-text-primary">
          {title}
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-text-secondary max-w-sm sm:max-w-md md:max-w-2xl mx-auto mb-12">
          {message}
        </p>

        <div className="flex justify-center items-start gap-2 sm:gap-3 md:gap-5">
          <CountdownUnit value={days} label="Days" />
          <span className="text-4xl sm:text-5xl md:text-7xl font-black text-primary/50 pt-6 sm:pt-6 md:pt-7">:</span>
          <CountdownUnit value={hours} label="Hours" />
          <span className="text-4xl sm:text-5xl md:text-7xl font-black text-primary/50 pt-6 sm:pt-6 md:pt-7">:</span>
          <CountdownUnit value={minutes} label="Minutes" />
          <span className="text-4xl sm:text-5xl md:text-7xl font-black text-primary/50 pt-6 sm:pt-6 md:pt-7">:</span>
          <CountdownUnit value={seconds} label="Seconds" />
        </div>
      </motion.div>
    </div>
  );
};

export default MaintenancePage;