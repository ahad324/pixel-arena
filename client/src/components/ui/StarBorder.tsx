import React, { useEffect, useState } from "react";

type StarBorderProps<T extends React.ElementType> =
  React.ComponentPropsWithoutRef<T> & {
    as?: T;
    className?: string;
    children?: React.ReactNode;
    color?: string; // e.g., "var(--primary-hsl)"
    speed?: React.CSSProperties["animationDuration"];
    thickness?: number;
  };

const StarBorder = <T extends React.ElementType = "button">({
  as,
  className = "",
  color = "var(--primary)",
  speed = "6s",
  thickness = 1,
  children,
  ...rest
}: StarBorderProps<T>) => {
  const Component = as || "button";
  const [resolvedColor, setResolvedColor] = useState(color);

  useEffect(() => {
    if (color.startsWith("var(")) {
      const cssVarName = color.match(/--[^)]+/)?.[0];
      if (cssVarName) {
        const styles = getComputedStyle(document.documentElement);
        const value = styles.getPropertyValue(cssVarName).trim();
        setResolvedColor(`hsl(${value})`);
      }
    } else {
      setResolvedColor(color);
    }
  }, [color]);

  return (
    <Component
      className={`relative inline-block overflow-hidden rounded-[16px] ${className}`}
      {...(rest as any)}
      style={{
        padding: `${thickness}px 0`,
        ...(rest as any).style,
      }}
    >
      {/* Bottom star trail */}
      <div
        className="absolute w-[200%] h-[30%] opacity-70 bottom-[-6px] right-[-150%] rounded-full animate-star-movement-bottom z-0"
        style={{
          background: `radial-gradient(circle, ${resolvedColor}, transparent 12%)`,
          animationDuration: speed,
        }}
      ></div>

      {/* Top star trail */}
      <div
        className="absolute w-[200%] h-[30%] opacity-70 top-[-6px] left-[-150%] rounded-full animate-star-movement-top z-0"
        style={{
          background: `radial-gradient(circle, ${resolvedColor}, transparent 12%)`,
          animationDuration: speed,
        }}
      ></div>

      {/* Main content */}
      <div className="relative z-1 bg-surface-100/90 border border-primary/50 text-secondary text-center text-sm py-2 px-4 rounded-[16px] backdrop-blur-md shadow-md hover:shadow-lg transition-all duration-300">
        {children}
      </div>
    </Component>
  );
};

export default StarBorder;
