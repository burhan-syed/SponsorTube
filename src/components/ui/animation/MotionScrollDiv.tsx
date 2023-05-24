import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/utils/cn";

const MotionScrollDiv = ({
  translateRef,
  endOverride,
  translateXStart=0,
  children,
}: {
  translateRef: any;
  endOverride: number;
  translateXStart?: number;
  children: React.ReactElement;
}) => {
  const { scrollYProgress } = useScroll({
    target: translateRef,
    offset: ["0 1", `1 ${endOverride}`], //["start end", "end start"]
  });
  const x = useTransform(scrollYProgress, [0, 1], [translateXStart, 0]);
  return (
    <motion.div
      ref={translateRef}
      style={{ x, transition: "all 1s cubic-bezier(0.165,0.84,0.44,1)" }}
      className={cn("inline-block")}
    >
      {children}
    </motion.div>
  );
};

export default MotionScrollDiv;
