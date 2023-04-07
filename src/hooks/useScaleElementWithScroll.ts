import { useEffect, useRef } from "react";
import useWindowScroll from "./useWindowScroll";

const useScaleElementWithScroll = ({
  min,
  max,
  initialHeight,
  initialWidth,
  enabled = true,
}: {
  initialHeight?: number;
  initialWidth?: number;
  min?: number;
  max?: number;
  enabled: boolean;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const windowScroll = useWindowScroll();

  useEffect(() => {
    if (
      initialHeight &&
      windowScroll &&
      containerRef.current &&
      min &&
      max &&
      enabled
    ) {
      //setCHeight(Math.min(Math.max(height - windowScroll, 300), height));
      containerRef.current.style.aspectRatio = `${initialWidth} / ${Math.min(
        Math.max(initialHeight - windowScroll, min),
        max
      )}`;
    }
  }, [windowScroll]);

  return containerRef;
};

export default useScaleElementWithScroll;
