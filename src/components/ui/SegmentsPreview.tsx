import useSponsorBlock from "@/hooks/useSponsorBlock";
import { trpc } from "@/utils/trpc";
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
    videoID: inView ? videoId : "",
  });
  const sponsors = trpc.video.getSponsors.useQuery(
    { videoId: videoId },
    { enabled: inView }
  );
  if (segments.isLoading || savedSegments.isLoading || sponsors.isLoading) {
    return (
      <div ref={ref}>
        <>
          {JSON.stringify({
            se: segments.isLoading,
            sa: savedSegments.isLoading,
            spo: sponsors.isLoading,
          })}
        </>
        <CgSpinnerTwoAlt className="mt-1 h-3 w-3 flex-none animate-spin sm:my-1" />
      </div>
    );
  }
  if (sponsors.data && sponsors.data?.length > 0) {
    return (
      <div ref={ref} className={className}>
        {sponsors.data?.map((sp) => (
          <div
            className="rounded-full border border-th-additiveBackground/5 px-2 py-0.5"
            key={sp.id}
            style={{ backgroundColor: `${TAGS.get("BRAND")}80` }}
          >
            {sp.brand}
          </div>
        ))}
      </div>
    );
  }
  return (
    <div ref={ref} className={clsx("", className)}>
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
