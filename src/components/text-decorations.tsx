import { nbColors } from "@/lib/neo-brutalism";
import { motion } from "framer-motion";

export const AnimationLine = ({ color, height = 3 }: { color: keyof typeof nbColors | string; height: number }) => {
  return (
    <motion.span
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 1, duration: 0.4 }}
      className={`absolute -bottom-1 left-0 h-${height} w-full origin-left md:h-${height}`}
      style={{ backgroundColor: color }}
    />
  );
};
