
import React, { useEffect, useMemo, useState } from "react";
import {
  motion,
  Variants,
  useMotionValue,
  useTransform,
  AnimatePresence,
} from "framer-motion";

interface LaunchAnimationProps {
  onComplete: () => void;
}

const animationDuration = 6.5; // Total duration in seconds
const exitDuration = 1.0;

const LaunchAnimation: React.FC<LaunchAnimationProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState(0);

  const mouseX = useMotionValue(Infinity);
  const mouseY = useMotionValue(Infinity);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      mouseX.set(event.clientX);
      mouseY.set(event.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);

    const phaseTimer1 = setTimeout(() => setPhase(1), 1500); // Trigger genesis
    const phaseTimer2 = setTimeout(() => setPhase(2), 5500); // Trigger exit
    const completionTimer = setTimeout(
      () => onComplete(),
      (animationDuration + exitDuration) * 1000
    );

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(phaseTimer1);
      clearTimeout(phaseTimer2);
      clearTimeout(completionTimer);
    };
  }, [onComplete, mouseX, mouseY]);

  const containerVariants: Variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5 } },
    exit: {
      opacity: 0,
      transition: { duration: exitDuration, ease: [0.8, 0, 0.2, 1] },
    },
  };

  const holographicRotateX = useTransform(mouseY, [0, window.innerHeight], [15, -15]);
  const holographicRotateY = useTransform(mouseX, [0, window.innerWidth], [-15, 15]);

  return (
    <motion.div
      key="launch-animation"
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background pointer-events-auto overflow-hidden"
      style={{ perspective: "1200px" }}
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <AnimatePresence>
        {phase < 2 && (
          <motion.div
            exit={{ opacity: 0, scale: 0, transition: { duration: exitDuration } }}
            className="w-full h-full"
          >
            {/* Phase 0: Static and Genesis Spark */}
            <AnimatePresence>
              {phase === 0 && <StaticBackground />}
            </AnimatePresence>
            <GenesisSpark mouseX={mouseX} mouseY={mouseY} phase={phase} />

            {/* Phase 1: Arena Construction */}
            {phase >= 1 && (
              <ArenaView phase={phase} />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* HUD Title */}
      <motion.div
        className="relative z-10"
        style={{
          rotateX: holographicRotateX,
          rotateY: holographicRotateY,
          transformStyle: "preserve-3d",
        }}

      >
        <AnimatePresence>
          {phase === 1 && <HolographicTitle />}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

// --- Sub-components for clarity ---

const StaticBackground = () => (
  <motion.div
    className="absolute inset-0 opacity-20"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 800'%3E%3Cg fill='none' stroke='%23FFFFFF' stroke-width='1'%3E%3Cpath d='M0 0L800 800'/%3E%3Cpath d='M800 0L0 800'/%3E%3C/g%3E%3C/svg%3E")`,
      backgroundRepeat: 'repeat',
    }}
    initial={{ opacity: 0 }}
    animate={{ opacity: 0.1, transition: { duration: 1 } }}
    exit={{ opacity: 0, transition: { duration: 0.5 } }}
  />
);

const GenesisSpark = ({ mouseX, mouseY, phase }: any) => {
  const hasMoved = useMotionValue(false);
  useEffect(() => {
    const unsubscribe = mouseX.onChange((v: number) => {
      if (v !== Infinity) hasMoved.set(true);
    });
    return unsubscribe;
  }, [mouseX, hasMoved]);

  const sparkX = useTransform(mouseX, [0, window.innerWidth], [-window.innerWidth / 2, window.innerWidth / 2], { clamp: false });
  const sparkY = useTransform(mouseY, [0, window.innerHeight], [-window.innerHeight / 2, window.innerHeight / 2], { clamp: false });

  return (
    <motion.div
      className="absolute left-1/2 top-1/2 z-50"
      style={{ x: hasMoved.get() ? sparkX : 0, y: hasMoved.get() ? sparkY : 0, }}
    >
      <motion.div
        className="w-4 h-4 rounded-full bg-primary shadow-[0_0_20px_5px_hsl(var(--primary-hsl))]"
        animate={{
          scale: phase === 0 ? [1, 1.5, 1] : [1, 200],
          opacity: phase === 0 ? 1 : 0,
        }}
        transition={{
          scale: {
            duration: phase === 0 ? 2 : 1,
            repeat: phase === 0 ? Infinity : 0,
            ease: phase === 0 ? 'easeInOut' : [0.8, 0, 0.2, 1],
          },
        }}
      />
    </motion.div>
  );
};

const ArenaView = ({  }: { phase: number }) => {
  const gridLines = useMemo(() => ({
    horizontal: Array.from({ length: 41 }),
    vertical: Array.from({ length: 81 }),
  }), []);

  const crystals = useMemo(() => Array.from({ length: 16 }).map((_,) => ({
    x: (Math.random() - 0.5) * 1200,
    z: (Math.random()) * 800 + 200,
    h: 50 + Math.random() * 200,
    delay: Math.random() * 1.5,
    clip: `polygon(50% 0, 100% 100%, 0 100%)`,
    color: Math.random() > 0.5 ? 'var(--accent-hsl)' : 'var(--accent-secondary-hsl)',
  })), []);

  return (
    <motion.div
      className="absolute w-full h-full"
      style={{ transformStyle: "preserve-3d", transform: "rotateX(75deg) translateY(20vh)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 1, delay: 0.2 } }}
    >
      {/* Grid */}
      {gridLines.horizontal.map((_, i) => (
        <motion.div
          key={`h-${i}`}
          className="absolute w-full h-px bg-primary/20"
          style={{ top: `${50 + (i - 20) * 2.5}%` }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1, transition: { duration: 1.5, delay: i * 0.02, ease: [0.2, 0.8, 0.2, 1] } }}
        />
      ))}
      {gridLines.vertical.map((_, i) => (
        <motion.div
          key={`v-${i}`}
          className="absolute h-full w-px bg-primary/20"
          style={{ left: `${50 + (i - 40) * 1.25}%` }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1, transition: { duration: 1.5, delay: i * 0.01, ease: [0.2, 0.8, 0.2, 1] } }}
        />
      ))}

      {/* Crystals */}
      {crystals.map((c, i) => (
        <motion.div key={`c-${i}`} className="absolute" style={{
          left: '50%',
          top: '50%',
          width: `${c.h / 3}px`,
          height: `${c.h}px`,
          transformOrigin: 'bottom',
          transform: `translateX(${c.x}px) translateZ(${c.z}px)`,
        }}>
          <motion.div className="w-full h-full" style={{
            background: `linear-gradient(to top, transparent 0%, hsla(${c.color} / 0.6) 100%)`,
            clipPath: c.clip
          }}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1, transition: { duration: 1.2, delay: 0.5 + c.delay, ease: [0.16, 1, 0.3, 1] } }}
          />
        </motion.div>
      ))}

      {/* Central Core */}
      <motion.div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <motion.div
          className="w-16 h-16 rounded-full bg-primary shadow-[0_0_40px_10px_hsl(var(--primary-hsl))]"
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [0, 1.2, 1],
            opacity: 1,
            transition: { duration: 1.5, ease: "anticipate", delay: 0.8 }
          }}
        />
      </motion.div>

    </motion.div>
  );
};

const HolographicTitle = () => {
  const GlitchText = ({ children }: { children: string }) => (
    <div className="relative" style={{ filter: "drop-shadow(0 0 10px hsl(var(--primary-hsl) / 0.8))" }}>
      <span className="absolute inset-0 opacity-80" style={{ color: "hsl(var(--accent-secondary-hsl))", textShadow: "-2px 0 currentColor", clipPath: "inset(50% 0 0 0)" }} aria-hidden="true">{children}</span>
      <span className="absolute inset-0 opacity-80" style={{ color: "hsl(var(--accent-hsl))", textShadow: "2px 0 currentColor", clipPath: "inset(0 0 50% 0)" }} aria-hidden="true">{children}</span>
      {children}
    </div>
  )

  return (
    <motion.div
      className="text-5xl sm:text-7xl font-bold tracking-[0.3em] text-text-primary text-center"
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{
        opacity: [0, 1, 0.8, 1],
        y: 0,
        scale: 1,
        transition: { duration: 1, ease: 'easeOut', delay: 1.5 }
      }}
      exit={{ opacity: 0, scale: 0.5, filter: "blur(10px)", transition: { duration: 0.5 } }}
    >
      <div className="flex flex-col items-center justify-center space-y-2">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0, transition: { delay: 1.8, duration: 1 } }}>
          <GlitchText>PIXEL</GlitchText>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0, transition: { delay: 2.0, duration: 1 } }}>
          <GlitchText>ARENA</GlitchText>
        </motion.div>
      </div>
    </motion.div>
  )
}


export default LaunchAnimation;
