import React, { useEffect, useMemo } from "react";
import { motion, Variants } from "framer-motion";

interface LaunchAnimationProps {
  onComplete: () => void;
}

const animationDuration = 4.5; // seconds
const exitDuration = 0.5;

const LaunchAnimation: React.FC<LaunchAnimationProps> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, (animationDuration + exitDuration) * 1000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const containerVariants: Variants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { duration: 0.5, ease: "linear" },
    },
    exit: {
      scale: 1.5,
      opacity: 0,
      transition: { duration: exitDuration, ease: [0.8, 0, 0.2, 1] },
    },
  };

  // --- 3D Grid ---
  const gridLines = useMemo(() => ({
    horizontal: Array.from({ length: 21 }), // From 0 to 20
    vertical: Array.from({ length: 41 }), // From 0 to 40
  }), []);

  const gridLineVariants: Variants = {
    initial: { scale: 0 },
    animate: (i: number) => ({
      scale: 1,
      transition: {
        duration: 1.5,
        ease: [0.2, 0.8, 0.2, 1],
        delay: 0.5 + i * 0.03,
      },
    }),
  };

  // --- Arena Pillars ---
  const pillars = useMemo(() => Array.from({ length: 12 }).map((_, i) => ({
    x: (Math.random() - 0.5) * 800,
    z: (Math.random() - 0.5) * 800 + 400,
    height: 100 + Math.random() * 300,
    delay: 2 + Math.random() * 0.7,
  })), []);

  const pillarVariants: Variants = {
    initial: { scaleY: 0, opacity: 0 },
    animate: (custom: { delay: number }) => ({
      scaleY: 1,
      opacity: 1,
      transition: {
        duration: 1.2,
        ease: [0.16, 1, 0.3, 1],
        delay: custom.delay,
      },
    }),
  };

  // --- Central Core ---
  const coreVariants: Variants = {
    initial: { scale: 0, opacity: 0 },
    animate: {
      scale: [0, 1, 0.8, 1.2, 1],
      opacity: [0, 1, 1, 1, 1],
      transition: {
        duration: 2.0,
        ease: "easeInOut",
        times: [0, 0.2, 0.5, 0.8, 1],
        delay: 0.2
      }
    }
  };

  const coreGlowVariants: Variants = {
    initial: { opacity: 0, scale: 0 },
    animate: {
      opacity: [0, 0.8, 0.4, 1],
      scale: [0, 3, 2, 8],
      transition: { duration: 3.5, delay: 0.2, ease: "easeOut" }
    }
  };

  // --- SVG Title ---
  const title = "PIXEL ARENA";
  const textContainerVariants = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.6,
        delayChildren: 3.2,
      },
    },
  };
  const textPathVariants: Variants = {
    initial: {
      pathLength: 0,
      opacity: 0,
      filter: "blur(5px)",
    },
    animate: {
      pathLength: 1,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        duration: 1.0,
        ease: "easeInOut",
      },
    },
  };

  return (
    <motion.div
      key="launch-animation"
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background pointer-events-auto overflow-hidden"
      style={{ perspective: "1000px", perspectiveOrigin: "center calc(50% + 15vh)" }}
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* 3D Container for Arena elements */}
      <motion.div
        className="absolute w-full h-full"
        style={{ transformStyle: "preserve-3d", transform: "rotateX(75deg) translateY(15vh)" }}
      >
        {/* The Grid */}
        <motion.div className="absolute inset-0">
          {gridLines.horizontal.map((_, i) => (
            <motion.div
              key={`h-${i}`}
              className="absolute w-full h-px bg-primary/20"
              style={{ top: `${50 + (i - 10) * 5}%` }}
              variants={gridLineVariants}
              custom={i}
              initial="initial"
              animate="animate"
            />
          ))}
          {gridLines.vertical.map((_, i) => (
            <motion.div
              key={`v-${i}`}
              className="absolute h-full w-px bg-primary/20"
              style={{ left: `${50 + (i - 20) * 2.5}%` }}
              variants={gridLineVariants}
              custom={i}
              initial="initial"
              animate="animate"
            />
          ))}
        </motion.div>

        {/* The Pillars */}
        {pillars.map((p, i) => (
          <motion.div key={`pillar-${i}`} className="absolute" style={{
            left: '50%',
            top: '50%',
            width: '30px',
            transformOrigin: 'bottom',
            transform: `translateX(${p.x}px) translateZ(${p.z}px)`,
            height: p.height,
            background: 'linear-gradient(to top, hsl(var(--primary-hsl) / 0), hsl(var(--primary-hsl) / 0.5))'
          }}
            variants={pillarVariants}
            custom={p}
            initial="initial"
            animate="animate"
          />
        ))}

        {/* Central Core */}
        <motion.div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <motion.div className="w-16 h-16 rounded-full bg-accent" style={{ transformStyle: 'preserve-3d' }}
            variants={coreVariants} initial="initial" animate="animate"
          />
          <motion.div className="absolute inset-0 rounded-full bg-accent/30 filter blur-3xl"
            variants={coreGlowVariants} initial="initial" animate="animate"
          />
        </motion.div>

      </motion.div>

      {/* HUD Title */}
      <motion.div
        className="relative z-10 flex items-center justify-center"
        variants={textContainerVariants}
        initial="initial"
        animate="animate"
      >
        <svg
          className="w-auto h-20 sm:h-28 text-text-primary drop-shadow-[0_0_10px_hsl(var(--primary-hsl))]"
          viewBox="0 0 500 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          overflow="visible"
        >
          <title>{title}</title>
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <motion.text
            x="50%"
            y="50%"
            dominantBaseline="middle"
            textAnchor="middle"
            fontSize="32"
            fontWeight="bold"
            letterSpacing="8"
            stroke="hsl(var(--primary-hsl))"
            strokeWidth="0.5"
            fill="transparent"
            style={{ filter: "url(#glow)" }}
          >
            <motion.tspan variants={textPathVariants}>
              PIXEL
            </motion.tspan>
            <motion.tspan dx="80" variants={textPathVariants}>
              ARENA
            </motion.tspan>
          </motion.text>
          <motion.text
            x="50%"
            y="50%"
            dominantBaseline="middle"
            textAnchor="middle"
            fontSize="32"
            fontWeight="bold"
            letterSpacing="8"
            fill="hsl(var(--primary-hsl))"
          >
            <motion.tspan variants={textPathVariants}>
              PIXEL
            </motion.tspan>
            <motion.tspan dx="80" variants={textPathVariants}>
              ARENA
            </motion.tspan>
          </motion.text>
        </svg>
      </motion.div>
    </motion.div>
  );
};

export default LaunchAnimation;
