import { cn } from "@/utils/cn";
import React, { useEffect, useRef, useState } from "react";

const HeroBG = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [blurred, setBlurred] = useState(true);
  useEffect(() => {
    let timeout = setTimeout(() => setBlurred(false), 10);
    const onScroll = () => {
      if (containerRef.current) {
        const scrollY = window.scrollY;
        const innerHeight = window.innerHeight;
        const innerWidth = window.innerWidth;
        const mobile = innerWidth < 768;
        //poor performance
        // const max = mobile ? 800 : 200;
        // const min = mobile ? 200 : 100;
        // const scaled = ((max - min) / (innerHeight)) * scrollY;
        // containerRef.current.style.height = `${Math.min(min + scaled, max)}vh`;
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => {
      timeout && clearTimeout(timeout);
      window.removeEventListener("scroll", onScroll);
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
