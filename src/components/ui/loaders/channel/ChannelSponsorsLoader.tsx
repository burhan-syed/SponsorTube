import clsx from "clsx";
import React from "react";
import { Button } from "@/components/ui/common/Button";

const ChannelSponsorsLoader = ({
  noneFound = false,
}: {
  noneFound?: boolean;
}) => {
  return (
    <div className={clsx("rounded-3xl ring-1 ring-th-chipBackground ")}>
      <div
        className={clsx(
          noneFound ? "rounded-3xl" : "skeleton-box rounded-t-3xl ",
          "relative flex h-10 w-full items-center justify-center bg-th-chipBackground "
        )}
      >
        <span className="text-base text-th-textSecondary">
          {noneFound ? "no sponsors found" : "sponsors loading"}
        </span>
      </div>
      {!noneFound && (
        <div className={"relative"}>
          <ul
            className={clsx(
              "flex flex-row flex-wrap items-center justify-center gap-x-2 gap-y-1 py-2  transition-all duration-200 ease-in-out md:px-1 "
            )}
          >
            {[...new Array(3)].map((s, i) => (
              <li key={i}>
                <div className="skeleton-box h-7 w-20 rounded-full"></div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ChannelSponsorsLoader;
