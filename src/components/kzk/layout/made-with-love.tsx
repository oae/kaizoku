"use client";

import { motion } from "framer-motion";
import { Heart } from "lucide-react";

export function MadeWithLove(): JSX.Element {
  const hearth = (
    <motion.div
      animate={{
        scale: [1.0, 1.25, 1.0, 1.25, 1.0, 1.0],
      }}
      transition={{
        duration: 1,
        ease: "easeInOut",
        times: [0, 0.2, 0.5, 0.6, 0.8, 1],
        repeat: Infinity,
        repeatType: "loop",
        repeatDelay: 0.5,
      }}
    >
      <Heart fill="red" color="red" size={20} />
    </motion.div>
  );

  return (
    <div style={{ display: "inline-flex", height: "26px", lineHeight: "26px" }}>
      {hearth}
    </div>
  );
}
