import clsx from "clsx";
import React, { useEffect, useState } from "react";

const RouteChangeLoader = ({ routeIsLoading }: { routeIsLoading: boolean }) => {
  const [progress, setProgress] = useState(25);
  useEffect(() => {
    let timeout: any;
    let timeout2: any;
    if (routeIsLoading) {
      setProgress(25);
      timeout2 = setTimeout(() => {
        setProgress(75);
      }, 1000);
    } else {
      timeout2 && clearTimeout(timeout2);
      setProgress(100);
      timeout = setTimeout(() => {
        setProgress(0);
      }, 2000);
    }
    return () => {
      timeout && clearTimeout(timeout);
      timeout2 && clearTimeout(timeout2);
    };
  }, [routeIsLoading]);

  return (
    <div
      className={
        "pointer-events-none fixed top-0 left-0 z-[9999] h-0.5 w-full bg-transparent"
      }
    >
      <div
        className={clsx(
          "h-full w-full bg-red-500 ",
          "ease-[cubic-bezier(0.65, 0, 0.35, 1)] transition-transform",
          progress === 0
            ? "duration-[0ms]"
            : progress <= 25
            ? "duration-[500ms]"
            : progress <= 75
            ? "duration-[2000ms]"
            : "duration-[200ms]"
        )}
        style={{ transform: `translateX(-${100 - progress}%)` }}
      ></div>
    </div>
  );
};

export default RouteChangeLoader;
