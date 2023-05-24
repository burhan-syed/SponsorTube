import React, { useCallback, useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";

import { cn } from "@/utils/cn";
import MotionScrollDiv from "./MotionScrollDiv";

const ScrollComponent = ({
  children,
  direction = [1, 0], //todo: support [x,y] scrolling
  completeAt = 0.5, //end offset animation should end
  disable,
}: {
  children: React.ReactElement;
  direction?: [number, number];
  completeAt?: number;
  disable?: boolean;
}) => {
  const translateRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>();
  const { ref: inViewRef, inView } = useInView();
  const setRefs = useCallback(
    (node: HTMLDivElement) => {
      containerRef.current = node;
      inViewRef(node);
    },
    [inViewRef]
  );

  const [translateXStart, setTranslateXStart] = useState<number>();
  const [endOverride, setEndOverride] = useState<number>(() => completeAt);

  useEffect(() => {
    const onResize = () => {
      let start = window.scrollY;
      let containerWidth = containerRef.current?.clientWidth ?? 0;
      let translateWidth = translateRef.current?.clientWidth ?? 0;
      let translateHeight = translateRef.current?.clientHeight ?? 0;
      let translateBox = translateRef.current?.getBoundingClientRect();
      let yPos = (translateBox?.top ?? 0) + window.scrollY;
      let totalWindowScroll = document.documentElement.scrollHeight;
      let scrollWindowHeight = window.innerHeight;
      let minoffset = Math.max(
        0,
        (scrollWindowHeight - (totalWindowScroll - yPos - translateHeight)) /
          scrollWindowHeight
      );
      //console.log("offset?", minoffset, endOverride, completeAt)
      //assure final position reached before end of screen
      if (minoffset > endOverride) {
        setEndOverride(minoffset);
      }

      let translateXStart = (containerWidth / translateWidth) * 100 - 100;
      setTranslateXStart(containerWidth - translateWidth);
    };
    onResize();

    if (inView) {
      window.addEventListener("resize", onResize);
      if (containerRef.current) {
        containerRef.current.style.opacity = "100%";
      }
    }
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [inView]);

  return (
    <div
      ref={setRefs}
      className="h-full w-full overflow-visible transition-[opacity] duration-500"
      style={{ whiteSpace: "nowrap", opacity: "0%" }}
    >
      <MotionScrollDiv
        key={`${endOverride}_${translateXStart}`} //resetting scroll offsets
        translateXStart={translateXStart}
        endOverride={endOverride}
        translateRef={translateRef}
      >
        {children}
      </MotionScrollDiv>
    </div>
  );
};

export default ScrollComponent;
