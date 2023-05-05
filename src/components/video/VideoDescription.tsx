import React, { useState } from "react";
import clsx from "clsx";

import useIsPressed from "@/hooks/useIsPressed";
import TouchResponse from "@/components/ui/common/TouchResponse";

interface VideoDescriptionProps {
  views?: number;
  uploadDate?: string;
  description?: string;
  descriptionRuns?: string[];
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
          "group rounded-lg border border-th-additiveBackground/10 bg-th-generalBackgroundA p-3 text-xs",
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
        {/* <span className="font-semibold">
          {views && (
            <>
              {new Intl.NumberFormat("en-US", {
                notation: "compact",
              }).format(views)}
              {`views `}
            </>
          )}
          {uploadDate}
        </span> */}
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
                {run}
                {i === INITIALDESCRIPTIONRUNS - 1 &&
                  !expandVideoDescription &&
                  descriptionRuns?.length > INITIALDESCRIPTIONRUNS && (
                    <span className="">...</span>
                  )}
              </span>
            </>
          ))}
          {descriptionRuns &&
            descriptionRuns?.length > INITIALDESCRIPTIONRUNS && (
              <>
                {expandVideoDescription ? (
                  <>
                    {descriptionRuns?.slice(4)?.map((run, i) => (
                      <>
                        <span key={i}>{run}</span>
                      </>
                    ))}
                    <br />
                    <button
                      className="mt-4 font-semibold hover:font-bold"
                      onClick={() => {
                        setExpandVideoDescription(false);
                        // containerRef?.current.scrollIntoView({
                        //   behavior: "smooth",
                        //   block: "center",
                        // });
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      Show less
                    </button>
                  </>
                ) : (
                  <button
                    className="font-semibold hover:font-bold"
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
