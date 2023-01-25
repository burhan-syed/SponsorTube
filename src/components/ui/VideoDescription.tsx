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
          "rounded-lg border border-th-additiveBackground/10 bg-th-generalBackgroundA p-3 text-xs group",
          descriptionRuns &&
            descriptionRuns?.length > INITIALDESCRIPTIONRUNS &&
            !expandVideoDescription &&
            "hover:cursor-pointer hover:bg-th-chipBackground"
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
        <p className="">
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
                {i === INITIALDESCRIPTIONRUNS - 1 &&
                  !expandVideoDescription &&
                  descriptionRuns?.length > INITIALDESCRIPTIONRUNS && (
                    <span className="">...</span>
                  )}
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
                    className="mt-4 font-bold hover:font-extrabold"
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
                  className="font-bold hover:font-extrabold"
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
