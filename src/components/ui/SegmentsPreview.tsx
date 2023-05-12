import useSponsorBlock from "@/hooks/useSponsorBlock";
import { api } from "@/utils/api";
import clsx from "clsx";
import React from "react";
import { CgSpinnerTwoAlt } from "react-icons/cg";
import { useInView } from "react-intersection-observer";
import { TAGS } from "../transcripts/edits/TranscriptTags";

const SegmentsPreview = ({
  videoId,
  className,
}: {
  videoId: string;
  className?: string;
}) => {
  const { ref, inView } = useInView();
  const { segments, savedSegments } = useSponsorBlock({
    videoID: videoId,
    enabled: inView
  });
  const sponsors = api.video.getSponsors.useQuery(
    { videoId: videoId },
    { enabled: inView, refetchOnWindowFocus: true }
  );
  if (
    segments.isLoading ||
    savedSegments.isLoading ||
    sponsors.isLoading ||
    sponsors.isRefetching
  ) {
    return (
      <div ref={ref} className={clsx(className)}>
        {/* <>
          {JSON.stringify({
            se: segments.isLoading,
            sa: savedSegments.isLoading,
            spo: sponsors.isLoading,
          })}
        </> */}
        <CgSpinnerTwoAlt className="h-3 w-3 flex-none animate-spin" />
      </div>
    );
  }
  if (sponsors.data && sponsors.data?.length > 0) {
    return (
      <div ref={ref} className={className}>
        {[...new Set(sponsors.data?.map((sp) => sp.brand))].map((sp, i) => (
          <div
            className="rounded-full border border-th-additiveBackground/5 px-2 py-0.5"
            key={sp + `${i}`}
            style={{ backgroundColor: `${TAGS.get("BRAND")}80` }}
          >
            {sp}
          </div>
        ))}
      </div>
    );
  }
  return (
    <div ref={ref} className={clsx(className)}>
      {segments.data ? (
        <span>
          {segments.data.length} sponsor segment
          {segments.data.length === 1 ? "" : "s"}
        </span>
      ) : savedSegments.data ? (
        <span>
          {savedSegments.data.length} sponsor segments
          {savedSegments.data.length === 1 ? "" : "s"}
        </span>
      ) : (
        "something went wrong"
      )}
    </div>
  );
};

export default SegmentsPreview;
