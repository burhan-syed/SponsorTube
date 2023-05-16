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
    let containerWidth = containerRef.current?.clientWidth ?? 0;
    let translateWidth = translateRef.current?.clientWidth ?? 0;
    let translateHeight = translateRef.current?.clientHeight ?? 0;

    let yPos =
      (translateRef.current?.getBoundingClientRect().top ?? 0) + window.scrollY;
    let fromBottom = start >= yPos;

    let translateXStart = (containerWidth / translateWidth) * 100 - 100;

    let totalWindowScroll = document.documentElement.scrollHeight;
    let scrollWindowHeight = window.innerHeight;

    let endAtScrollY = fromBottom
      ? yPos - scrollWindowHeight * (1 - completeAt)
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

    const onResize = () => {
      start = window.scrollY;
      containerWidth = containerRef.current?.clientWidth ?? 0;
      translateWidth = translateRef.current?.clientWidth ?? 0;
      translateHeight = translateRef.current?.clientHeight ?? 0;

      yPos =
        (translateRef.current?.getBoundingClientRect().top ?? 0) +
        window.scrollY;
      fromBottom = start >= yPos;

      translateXStart = (containerWidth / translateWidth) * 100 - 100;

      totalWindowScroll = document.documentElement.scrollHeight;
      scrollWindowHeight = window.innerHeight;

      endAtScrollY = fromBottom
        ? yPos - scrollWindowHeight * (1 - completeAt)
        : Math.min(
            yPos + translateHeight - scrollWindowHeight * completeAt,
            totalWindowScroll - scrollWindowHeight
          );
      onScroll();
    };

    if (inView) {
      window.addEventListener("scroll", onScroll);
      window.addEventListener("resize", onResize);
      if (translateRef.current) {
        translateRef.current.style.opacity = "100%";
      }
    } else if (translateRef.current) {
      translateRef.current.style.transform = `translate(${translateXStart}%,0%)`;
    }
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [inView]);

  return (
    <div
      ref={setRefs}
      className="h-full w-full overflow-visible"
      style={{ whiteSpace: "nowrap" }}
    >
      <div
        ref={translateRef}
        style={{ opacity: "0" }}
        className="inline-block transition-[opacity] duration-500"
      >
        {children}
      </div>
    </div>
  );
};

export default ScrollComponent;
