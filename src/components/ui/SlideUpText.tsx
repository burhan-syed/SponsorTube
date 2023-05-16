import React, { useEffect, useRef } from "react";

const SlideUpText = ({
  textLines,
  duration = [1000],
  delay = [300],
  initialDelay = 0,
}: {
  textLines: string[];
  duration?: number[];
  delay?: number[];
  initialDelay?: number;
}) => {
  const elementRefs = useRef<(HTMLSpanElement | null)[]>([]);
  useEffect(() => {
    elementRefs.current.forEach((el, i) => {
      new Promise((res) =>
        setTimeout((r) => {
          if (el) {
            el.style.opacity = "100%";
            el.style.transform = "translate(0%,0%)";
          }
          res(r);
        }, ((delay?.length === elementRefs.current.length ? delay[i] : i * (delay?.[0] ?? 300)) ?? 300) + initialDelay)
      );
    });
  }, []);
  return (
    <>
      {textLines.map((t, i) => (
        <span key={t} className="flex flex-wrap">
          {t.split(" ").map((t2, j) => (
            <span key={t2} className="">
              <span
                key={`${t2}_text`}
                ref={(el) =>
                  (elementRefs.current[i + j + (j === 0 ? i : i + j - 1)] = el)
                }
                className=" block translate-y-full opacity-0 transition-all  "
                style={{
                  animationDuration: `${duration}ms`,
                  transitionDuration: `${duration}ms`,
                }}
              >
                {t2}&nbsp;
              </span>
            </span>
          ))}
        </span>
      ))}
    </>
  );
};

export default SlideUpText;
