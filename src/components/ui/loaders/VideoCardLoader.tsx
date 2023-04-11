import clsx from "clsx";
import React from "react";

const VideoCardLoader = ({
  variant = "regular",
}: {
  variant?: "regular" | "compact";
}) => {
  return (
    <div
      className={clsx(
        "relative",
        variant === "regular" ? "" : variant === "compact" && "w-full"
      )}
    >
      <div
        className={clsx(
          "flex items-start gap-2  rounded-lg text-xs text-th-textSecondary ",
          variant === "regular"
            ? "flex-col py-2 sm:flex-row sm:p-2"
            : variant === "compact" && "flex-row p-2 sm:flex-col"
        )}
      >
        <div
          //thumbnail
          className={clsx(
            "skeleton-box relative aspect-video flex-none overflow-hidden",
            variant === "regular"
              ? "w-full sm:w-80 sm:rounded-2xl"
              : variant === "compact" && "w-40 rounded-2xl sm:w-full"
          )}
        ></div>

        <div className="flex w-full  gap-2">
          <div
            //channel pic
            className={clsx(
              " skeleton-box rounded-full",
              variant === "regular"
                ? "mx-2 block h-10 w-10 sm:mx-0 sm:hidden sm:h-6 sm:w-6"
                : variant === "compact" && "hidden h-6 w-6 flex-none sm:block"
            )}
          ></div>
          <div className="w-full flex-col ">
            <div className="">
              <div
                //title, stats
                className={clsx(
                  "flex flex-col gap-0.5  text-base font-semibold text-th-textPrimary",
                  variant === "regular" && "my-0.5 sm:my-1"
                )}
              >
                <div
                  className={clsx(
                    variant === "regular"
                      ? "h-4 w-5/6 sm:h-6 "
                      : variant === "compact" && "h-4 w-11/12 ",
                    "skeleton-box rounded-lg"
                  )}
                ></div>
                <div
                  className={clsx(
                    variant === "regular"
                      ? "my-1 h-3  w-2/3 sm:my-2  sm:w-44"
                      : variant === "compact" && "h-4 w-10/12 ",
                    "skeleton-box rounded-lg"
                  )}
                ></div>
                {variant === "compact" && (
                  <>
                    <div className="skeleton-box h-3 w-1/4 rounded-lg sm:w-1/2"></div>
                  </>
                )}
              </div>
            </div>
            {true && (
              <a className="flex items-center gap-2">
                <div
                  className={clsx(
                    "skeleton-box h-6 w-6 rounded-full",
                    variant === "regular"
                      ? "hidden sm:my-2 sm:block"
                      : variant === "compact" && "hidden"
                  )}
                ></div>
                <span
                  className={clsx(
                    "skeleton-box my-0.5 h-3 rounded-lg",
                    variant === "regular"
                      ? "sm: w-44 sm:w-24"
                      : variant === "compact" && ""
                  )}
                ></span>
              </a>
            )}

            {variant === "regular" && (
              <div className="my-2 hidden flex-col gap-1 pr-2 sm:flex">
                {[...new Array(3)].map((a,i) => (
                  <div
                    key={i}
                    className="skeleton-box h-3 w-full rounded-lg last:w-3/4"
                  ></div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCardLoader;
