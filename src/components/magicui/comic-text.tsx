"use client";
import { motion } from "motion/react";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

type ComicTextProps = {
  children: string;
  className?: string;
  style?: CSSProperties;
  fontSize?: number;
};

export function ComicText({
  children,
  className,
  style,
  fontSize = 5,
}: ComicTextProps) {
  if (typeof children !== "string") {
    throw new Error("children must be a string");
  }

  // const dotColor = "#EF4444";
  // const backgroundColor = "#FACC15";

  // const dotColor = "var(--accent)";
  const backgroundColor = "var(--primary)";

  return (
    <motion.div
      className={cn("select-none", className)}
      style={{
        // fontSize: `${fontSize}rem`,
        fontSize: `clamp(2rem, 5vw, ${fontSize}rem)`,
        fontFamily: "'Bangers', 'Comic Sans MS', 'Impact', sans-serif",
        fontWeight: "900",
        WebkitTextStroke: `${fontSize * 0.35}px #ffffff`, // Thick black outline
        transform: "skewX(-10deg)",
        textTransform: "uppercase",
        filter: `
          drop-shadow(5px 5px 0px var(--destructive))
          drop-shadow(3px 3px 0px var(--accent)
        `,
        backgroundColor: backgroundColor,
        // backgroundImage: `radial-gradient(circle at 1px 1px, ${dotColor} 1px, transparent 0)`,
        backgroundSize: "8px 8px",
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        ...style,
      }}
      initial={{ opacity: 0, scale: 0.8, rotate: -2 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{
        duration: 0.6,
        ease: [0.175, 0.885, 0.32, 1.275],
        type: "spring",
      }}
    >
      {children}
    </motion.div>
  );
}
