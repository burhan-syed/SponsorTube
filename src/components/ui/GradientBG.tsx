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
        blurred ? "blur-3xl" : "blur-xl"
      )}
    >
      <div className="max-w-screen relative h-[400vh] overflow-hidden md:h-[200vw]">
        <div className=" radial-gradient absolute left-[-60vw] top-[-200vw] h-[500vw] w-[500vw] -rotate-90 md:left-[-40vw] md:top-[-20vw] md:h-[200vw] md:w-[200vw] md:rotate-0 "></div>
      </div>
    </div>
  );
};

export default GradientBG;
