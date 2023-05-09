import { cn } from "@/utils/cn";
import React, { useEffect, useState } from "react";

const GradientBG = () => {
  const [blurred, setBlurred] = useState(true);
  useEffect(() => {
    let timeout = setTimeout(() => setBlurred(false), 10);

    return () => {
      timeout && clearTimeout(timeout);
    };
  }, []);

  return (
    <div
      className={cn(
        "absolute -z-10 w-full opacity-95 transition-[filter] animate-in fade-in-50 slide-in-from-top-2 duration-500 ",
        blurred ? "blur-lg" : "blur-[1px]"
      )}
    >
      <div className="max-w-screen relative h-[400vh] overflow-hidden md:h-[200vw]">
        <div className=" radial-gradient absolute left-[-200vw] top-[-150vw] h-[400vw] w-[400vw] md:left-[-80vw] md:top-[-80vw] md:h-[200vw] md:w-[200vw] "></div>
      </div>
    </div>
  );
};

export default GradientBG;
