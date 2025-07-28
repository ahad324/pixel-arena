import React, { useRef } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
  Variants,
} from "framer-motion";
import { GameMode } from "@custom-types/index";
import { GAME_DESCRIPTIONS } from "@constants/index";
import type { GameStatus } from "@constants/index";
import { StatusBadge } from "@components/StatusBadge";

interface GameModeCardProps {
  mode: GameMode;
  icon: React.ReactNode;
  selected: boolean;
  onSelect: () => void;
  status?: GameStatus | null;
}

const cardVariants: Variants = {
  unselected: {
    scale: 1,
    transition: { type: "spring", stiffness: 200, damping: 20 }
  },
  selected: {
    scale: 1.03,
    transition: {
      // "Jelly" effect for the scale property on selection
      scale: { type: "spring", stiffness: 380, damping: 12, mass: 0.8 },
      // A smooth transition for other properties, like resetting rotation
      default: { type: "spring", stiffness: 200, damping: 20 }
    }
  }
};


const GameModeCard: React.FC<GameModeCardProps> = ({
  mode,
  icon,
  selected,
  onSelect,
  status,
}) => {
  const ref = useRef<HTMLButtonElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { stiffness: 150, damping: 20, mass: 1 };
  const mouseXSpring = useSpring(x, springConfig);
  const mouseYSpring = useSpring(y, springConfig);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current || selected) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const mouseX = e.clientX - left;
    const mouseY = e.clientY - top;
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const iconTranslateX = useTransform(mouseXSpring, [-0.5, 0.5], ["-15px", "15px"]);
  const iconTranslateY = useTransform(mouseYSpring, [-0.5, 0.5], ["-15px", "15px"]);
  const titleTranslateX = useTransform(mouseXSpring, [-0.5, 0.5], ["-10px", "10px"]);
  const titleTranslateY = useTransform(mouseYSpring, [-0.5, 0.5], ["-10px", "10px"]);
  const descTranslateX = useTransform(mouseXSpring, [-0.5, 0.5], ["-7px", "7px"]);
  const descTranslateY = useTransform(mouseYSpring, [-0.5, 0.5], ["-7px", "7px"]);
  
  const spotlightX = useTransform(x, (val) => `${(val + 0.5) * 100}%`);
  const spotlightY = useTransform(y, (val) => `${(val + 0.5) * 100}%`);

  const sheenStyle = {
    opacity: selected ? 0 : 1,
    background: `radial-gradient(600px circle at var(--x) var(--y), hsl(var(--primary-hsl) / 0.1), transparent 60%)`,
    '--x': spotlightX,
    '--y': spotlightY,
  };

  return (
    <motion.button
      ref={ref}
      onClick={onSelect}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: 0.98, transition: { type: "spring", stiffness: 400, damping: 17 } }}
      className="relative w-full h-full rounded-3xl bg-gradient-to-br from-surface-200 to-surface-100"
      style={{
        transformStyle: "preserve-3d",
        perspective: "1000px",
        rotateX: selected ? 0 : rotateX,
        rotateY: selected ? 0 : rotateY,
      }}
      initial="unselected"
      animate={selected ? "selected" : "unselected"}
      variants={cardVariants}
    >
        {/* Border & Glow Container */}
        <motion.div
          className="absolute inset-0 rounded-3xl border-2"
          style={{ pointerEvents: "none" }}
          initial="initial"
          animate={selected ? "selected" : "initial"}
          whileHover="hover"
          variants={{
              initial: { 
                boxShadow: 'inset 0 0 0px hsl(var(--surface-200-hsl) / 0)', 
                borderColor: 'hsl(var(--border-hsl) / 0.5)' 
              },
              hover: {
                  borderColor: 'hsl(var(--primary-hsl) / 0.4)',
                  boxShadow: 'inset 0 0 10px hsl(var(--surface-200-hsl) / 0.3), 0 0 20px hsl(var(--primary-hsl) / 0.1)', 
              },
              selected: { 
                  borderColor: 'hsl(var(--primary-hsl) / 1)',
                  boxShadow: '0 5px 20px hsla(var(--primary-hsl), 0.2), inset 0 0 15px hsl(var(--surface-100-hsl) / 0.5)', 
              },
          }}
        />

        {/* Sheen Effect */}
        <motion.div
            className="pointer-events-none absolute inset-0 rounded-3xl"
            style={sheenStyle}
        />

        {/* Content Container */}
        <div
          className="relative w-full h-full p-6 flex flex-col justify-start"
          style={{ transform: "translateZ(40px)", transformStyle: "preserve-3d" }}
        >
          {/* Status Badge */}
          {status && (
              <motion.div 
                  className="absolute top-2 right-2 z-10"
                  style={{ 
                    transform: "translateZ(40px)",
                    translateX: selected ? 0 : iconTranslateX,
                    translateY: selected ? 0 : iconTranslateY,
                   }}
              >
                  <StatusBadge status={status} />
              </motion.div>
          )}

          <div className="flex items-center mb-4">
            <motion.div
              className="text-primary"
              style={{
                translateX: selected ? 0 : iconTranslateX,
                translateY: selected ? 0 : iconTranslateY,
                transform: "translateZ(30px)",
              }}
            >
              {icon}
            </motion.div>
            <motion.h3
              className="text-xl font-bold ml-4 text-text-primary"
              style={{
                translateX: selected ? 0 : titleTranslateX,
                translateY: selected ? 0 : titleTranslateY,
                transform: "translateZ(20px)",
              }}
            >
              {mode}
            </motion.h3>
          </div>
          <motion.p
            className="text-sm text-text-secondary flex-grow leading-relaxed"
            style={{
              translateX: selected ? 0 : descTranslateX,
              translateY: selected ? 0 : descTranslateY,
              transform: "translateZ(10px)",
            }}
          >
            {GAME_DESCRIPTIONS[mode]}
          </motion.p>
        </div>
    </motion.button>
  );
};

export default GameModeCard;