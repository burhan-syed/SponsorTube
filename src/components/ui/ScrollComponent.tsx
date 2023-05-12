import React, { useCallback, useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
const ScrollComponent = ({
  children,
  direction = [1, 0], //todo: support [x,y] scrolling
  completeAt = 0.5, //height% on window animation should end
}: {
  children: React.ReactElement;
  direction?: [number, number];
  completeAt?: number;
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
  useEffect(() => {
    let start = window.scrollY;
    const containerWidth = containerRef.current?.clientWidth ?? 0;
    const translateWidth = translateRef.current?.clientWidth ?? 0;
    const translateHeight = translateRef.current?.clientHeight ?? 0;

    const yPos =
      (translateRef.current?.getBoundingClientRect().top ?? 0) + window.scrollY;
    const fromBottom = start >= yPos;

    const translateXStart = (containerWidth / translateWidth) * 100 - 100;

    const totalWindowScroll = document.documentElement.scrollHeight;
    const scrollWindowHeight = window.innerHeight;

    const endAtScrollY = fromBottom
      ? yPos - scrollWindowHeight * (1-completeAt)
      : Math.min(
          yPos + translateHeight - scrollWindowHeight * completeAt,
          totalWindowScroll - scrollWindowHeight
        );

    const onScroll = () => {
      const translatePercent =
        (fromBottom ? 0 : 1) +
        (fromBottom ? 1 : -1) *
          Math.min(
            1,
            Math.max(0, (window.scrollY - start) / (endAtScrollY - start))
          );
      const translate = translateXStart * translatePercent;
      if (translateRef.current) {
        translateRef.current.style.transform = `translate(${translate}%,0%)`;
      }
    };
    if (inView) {
      window.addEventListener("scroll", onScroll);
    } else if (translateRef.current) {
      translateRef.current.style.transform = `translate(${translateXStart}%,0%)`;
    }
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [inView]);

  return (
    <div ref={setRefs} className="h-full w-full">
      <div
        ref={translateRef}
        style={{ willChange: "transform" }}
        className="inline-block"
      >
        {children}
      </div>
    </div>
  );
};

export default ScrollComponent;
