import React, { useEffect, useState } from "react";

const useIsMobileWindow = () => {
  const [isMobile, setIsMobile] = useState<boolean>();
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 640) {
        setIsMobile(false);
      } else {
        setIsMobile(true);
      }
    };
    handleResize(); 
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return isMobile;
};

export default useIsMobileWindow;
