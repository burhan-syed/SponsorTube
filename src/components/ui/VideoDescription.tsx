import React, { useState } from "react";
import clsx from "clsx";

import useIsPressed from "@/hooks/useIsPressed";
import TouchResponse from "./common/TouchResponse";

interface VideoDescriptionProps {
  views?: number;
  uploadDate?: string;
  description?: string;
  descriptionRuns?: {
    text: string;
  }[];
}
const INITIALDESCRIPTIONRUNS = 2;

const VideoDescription = ({
  views,
  uploadDate,
  descriptionRuns,
}: VideoDescriptionProps) => {
  const [expandVideoDescription, setExpandVideoDescription] = useState(false);
  const { containerRef, isPressed } = useIsPressed() as {
    containerRef: React.MutableRefObject<HTMLDivElement>;
    isPressed: boolean;
  };

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className={clsx(
          "rounded-lg bg-th-chipBackground p-3 text-xs ",
          descriptionRuns &&
            descriptionRuns?.length > INITIALDESCRIPTIONRUNS &&
            !expandVideoDescription &&
            "hover:cursor-pointer hover:bg-th-chipBackgroundHover"
        )}
        onClick={() => {
          descriptionRuns &&
            descriptionRuns?.length > INITIALDESCRIPTIONRUNS &&
            !expandVideoDescription &&
            setExpandVideoDescription(true);
        }}
        style={{ whiteSpace: "pre-line" }}
      >
        <span className="font-semibold">
          {views && (
            <>
              {new Intl.NumberFormat("en-US", {
                notation: "compact",
              }).format(views)}
              {`views `}
            </>
          )}
          {uploadDate}
        </span>
        <p>
          {descriptionRuns?.slice(0, INITIALDESCRIPTIONRUNS)?.map((run, i) => (
            <>
              <span
                key={i}
                className={clsx(
                  i === INITIALDESCRIPTIONRUNS - 1 &&
                    !expandVideoDescription &&
                    descriptionRuns?.length > INITIALDESCRIPTIONRUNS &&
                    "relative"
                )}
              >
                {run.text}
                {/* {i === INITIALDESCRIPTIONRUNS - 1 &&
                  !expandVideoDescription &&
                  descriptionRuns?.length > INITIALDESCRIPTIONRUNS && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white"></div>
                  )} */} 
              </span>
            </>
          ))}
          {descriptionRuns && descriptionRuns?.length > INITIALDESCRIPTIONRUNS && (
            <>
              {expandVideoDescription ? (
                <>
                  {descriptionRuns?.slice(4)?.map((run, i) => (
                    <>
                      <span key={i}>{run.text}</span>
                    </>
                  ))}
                  <br />
                  <button
                    className="mt-4 font-semibold"
                    onClick={() => {
                      setExpandVideoDescription(false);
                      containerRef?.current.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                    }}
                  >
                    Show less
                  </button>
                </>
              ) : (
                <button
                  className=" z-10 font-semibold"
                  onClick={() => setExpandVideoDescription(true)}
                >
                  Show more
                </button>
              )}
            </>
          )}
        </p>
      </div>
      <TouchResponse
        className="rounded-lg"
        isPressed={isPressed && !expandVideoDescription}
      />
    </div>
  );
};

export default VideoDescription;
