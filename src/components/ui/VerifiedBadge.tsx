import clsx from "clsx";
import React from "react";
import { BiCheck } from "react-icons/bi";
import { IoIosMusicalNote } from "react-icons/io";
import ToolTip from "./common/Tooltip";
const VerifiedBadge = ({
  className,
  artist,
}: {
  className?: string;
  artist?: boolean;
}) => {
  return (
    <ToolTip text={`Verified ${artist ? "Artist" : "Channel"}`} tooltipOptions={{side:"top", sideOffset: 10}}>
      <span
        className={clsx(
          className,
          artist
            ? "text-th-textSecondary"
            : "bg-th-textSecondary text-th-baseBackground",
          "flex flex-none items-center justify-center rounded-full "
        )}
      >
        {artist ? <IoIosMusicalNote /> : <BiCheck />}
      </span>
    </ToolTip>
  );
};

export default VerifiedBadge;
