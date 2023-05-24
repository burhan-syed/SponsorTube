import React, { useEffect, useRef } from "react";
import ScrollComponent from "./ScrollComponent";
import { cn } from "@/utils/cn";

const ScrollTextHeader = ({
  text,
  loading,
  completeAt = 0.5,
  innerContainerSizePercent,
  className,
  innerClassName,
  headerClassName,
  disable,
  children,
}: {
  text: string;
  loading: boolean;
  completeAt?: number;
  innerContainerSizePercent?: number;
  className?: string;
  innerClassName?: string;
  headerClassName?: string;
  disable?: boolean;
  children?: React.ReactElement;
}) => {
  const headerRef = useRef<HTMLHeadingElement>(null);
  const innerDiv = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const calcWidth = () => {
      if (headerRef.current && innerDiv.current && innerContainerSizePercent) {
        const headerSize = headerRef.current.getBoundingClientRect();
        const calcWidth = headerSize.width * innerContainerSizePercent;
        innerDiv.current.style.width =
          window.innerWidth > calcWidth ? `${calcWidth}px` : "100%";
        innerDiv.current.style.opacity = "100%";
      }
    };
    if (innerContainerSizePercent && (!loading || disable)) {
      calcWidth();
      window.addEventListener("resize", calcWidth);
    }
    return () => {
      window.removeEventListener("resize", calcWidth);
    };
  }, [loading, disable]);

  return (
    <>
      <div
        className={cn(
          "absolute left-1/2 w-full max-w-full -translate-x-1/2 overflow-clip ",
          className
        )}
      >
        <div ref={innerDiv} className={cn(innerClassName)}>
          {(!loading || disable) && (
            <ScrollComponent completeAt={completeAt} disable={disable}>
              <h2
                ref={headerRef}
                className={
                  "text-h1 " +
                  cn(
                    " inline font-bold text-th-textPrimary/10",
                    headerClassName
                  )
                }
              >
                {text}
              </h2>
            </ScrollComponent>
          )}
        </div>
        {children}
      </div>
      <div className="pt-[calc(min(12vw,8rem))] sm:pt-[7.4vw] md:pt-[5.6vw] lg:pt-[5.4vw] xl:pt-[4.8vw] 2xl:pt-[calc(min(4.1vw,8.8rem))]"></div>
    </>
  );
};

export default ScrollTextHeader;
