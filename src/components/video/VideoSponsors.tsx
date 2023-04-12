import { api } from "@/utils/api";
import { AnnotationTags, Sponsors } from "@prisma/client";
import React, { useState } from "react";
import { TAGS } from "@/components/transcripts/edits/TranscriptTags";
import { Button } from "@/components/ui/common/Button";
// import { VideoSponsors } from "@/server/db/sponsors";

type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

const TextPill = ({
  sp,
  type,
  toggleSetSelectedSegment,
}: {
  sp: Partial<Sponsors>; //ArrayElement<VideoSponsors>; //
  type: AnnotationTags;
  toggleSetSelectedSegment(s?: string): void;
}) => {
  const text =
    type === "BRAND"
      ? sp.brand
      : type === "PRODUCT"
      ? sp.product
      : type === "OFFER"
      ? sp.offer
      : type === "CODE"
      ? sp.code
      : type === "URL"
      ? sp.url
      : "";
  if (text) {
    return (
      <Button
        onClick={() => toggleSetSelectedSegment(sp.transcriptDetailsId)}
        variant={"primary"}
        size={"small"}
        className=""
      >
        <div className={"z-10 flex items-center"}>
          <span className="">{`${text}`}</span>
        </div>

        <div
          className="absolute h-full w-full rounded-full backdrop-blur-md"
          style={{ backgroundColor: `${TAGS.get(type)}90` }}
        ></div>
      </Button>
    );
  }
  return <></>;
};

const VideoSponsors = ({ videoId }: { videoId: string }) => {
  const sponsors = api.video.getSponsors.useQuery({ videoId: videoId });
  const [selectedSegment, setSelectedSegment] = useState("");
  const toggleSetSelectedSegment = (s?: string) => {
    s && setSelectedSegment((p) => (p === s ? "" : s));
  };
  //console.log("vod sponsors?", sponsors.data);
  return (
    <div className="flex items-center justify-center rounded-lg border border-th-additiveBackground/10 bg-th-generalBackgroundA p-2">
      {sponsors.isLoading ? (
        <div className="skeleton-box h-10 w-full "></div>
      ) : sponsors.data && sponsors.data.length > 0 ? (
        <>
          <h2 className="hidden py-2 pb-4 text-sm font-bold">
            sponsor information
          </h2>
          <table className="w-full table-fixed text-xs">
            <tbody>
              {Object.values(AnnotationTags).map((type) => (
                <tr
                  className="border-th border-b border-t border-th-additiveBackground/10 font-bold first:border-t-0 last:border-b-0 [&_th]:w-16 [&_th]:pr-2"
                  key={type}
                >
                  <th className="select-none  py-2 text-start font-semibold">
                    <span className="capitalize">{type[0]}</span>
                    <span className="lowercase">{type.slice(1)}s</span>
                  </th>
                  <td className="flex flex-row flex-wrap items-center justify-start gap-2 py-2 pl-2 text-xxs capitalize">
                    {sponsors?.data
                      ?.filter((sp) =>
                        selectedSegment
                          ? sp.transcriptDetailsId === selectedSegment
                          : true
                      )
                      .map((sp, i) => (
                        <TextPill
                          key={`${sp.brand}_${sp.transcriptDetailsId}_${i}`}
                          sp={sp}
                          type={type}
                          toggleSetSelectedSegment={toggleSetSelectedSegment}
                        />
                      ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <span className="text-xs">no sponsor information analyzed</span>
      )}
    </div>
  );
};

export default VideoSponsors;
