import React, { useEffect, useRef, useState } from "react";

const useIsPressed = () => {
  const containerRef = useRef<HTMLDivElement>();
  const [isPressed, setIsPressed] = useState(false);
  useEffect(() => {
    const onMouseDown = () => setIsPressed(true);
    containerRef?.current?.addEventListener("mousedown", onMouseDown);

    return () => {
      containerRef?.current?.removeEventListener("mousedown", onMouseDown);
    };
  }, [containerRef]);

  useEffect(() => {
    const onMouseUp = () => setIsPressed(false);
    if (isPressed) {
      window.addEventListener("mouseup", onMouseUp);
    }

    return () => {
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isPressed]);

  return { containerRef, isPressed };
};

export default useIsPressed;
