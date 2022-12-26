import React, { useEffect, useRef, useState } from "react";

interface useIsPressedProps {
  delay?: boolean;
}

const useIsPressed = ({ delay = true }: useIsPressedProps = {}) => {
  const containerRef = useRef<HTMLDivElement>() as any; //React.MutableRefObject<HTMLDivElement | HTMLButtonElement>;
  const timeoutRef = useRef<NodeJS.Timeout>();
  const [isPressed, setIsPressed] = useState(false);
  useEffect(() => {
    const onMouseDown = () => {
      if (timeoutRef.current && delay) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = undefined;
      }
      setIsPressed(true);
    };
    containerRef?.current?.addEventListener("mousedown", onMouseDown);
    containerRef?.current?.addEventListener("touchstart", onMouseDown);

    return () => {
      containerRef?.current?.removeEventListener("mousedown", onMouseDown);
      containerRef?.current?.removeEventListener("touchstart", onMouseDown);
    };
  }, [containerRef, delay]);

  useEffect(() => {
    const onMouseUp = () => {
      // timeout for style change even with quick taps
      if (delay) {
        timeoutRef.current = setTimeout(() => {
          setIsPressed(false);
        }, 100);
      }
    };
    if (isPressed) {
      window.addEventListener("mouseup", onMouseUp);
      window.addEventListener("touchend", onMouseUp);
      window.addEventListener("touchcancel", onMouseUp);
      window.addEventListener("contextmenu", onMouseUp);
    }

    return () => {
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchend", onMouseUp);
      window.removeEventListener("touchcancel", onMouseUp);
      window.removeEventListener("contextmenu", onMouseUp);
    };
  }, [isPressed, delay]);

  return { containerRef, isPressed };
};

export default useIsPressed;
