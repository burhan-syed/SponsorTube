import { cn } from "@/utils/cn";
import React, { useEffect, useRef, useState } from "react";

const HeroBG = () => {
  const containerRef = useRef<HTMLDivElement>(null);
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
        "absolute -z-10 h-full w-full opacity-95 transition-[filter] animate-in fade-in-50 slide-in-from-top-2 duration-500  ",
        blurred ? "blur-3xl" : "blur-[1px]"
      )}
    >
      <div className="relative h-[calc(100%+50vh+10vw)] w-full overflow-hidden ">
        <div
          ref={containerRef}
          className=" radial-gradient bg-center absolute left-0 top-[-60vh] h-[calc(100%+50vh+10vw)] w-full md:top-[-50vh] md:w-[100vw] "
        ></div>
      </div>
    </div>
  );
};

export default HeroBG;
