import { useEffect, useState } from "react";

const useWindowScroll = () => {
  const [scrollPosition, setScrollPosition] = useState<number>();
  useEffect(() => {
    const handleSroll = () => {
      //console.log('setscroll?', window.scrollY)
      setScrollPosition(window.scrollY);
    };
    window.addEventListener("scroll", handleSroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleSroll);
    };
  }, []);
  return scrollPosition;
};

export default useWindowScroll;
