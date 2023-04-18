import { api } from "@/utils/api";
import { AnnotationTags, Sponsors } from "@prisma/client";
import React, { useState } from "react";
import { TAGS } from "@/components/transcripts/edits/TranscriptTags";
import { Button } from "@/components/ui/common/Button";
import clsx from "clsx";
import { CgSpinnerTwoAlt } from "react-icons/cg";
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
        size={"adaptive"}
        className="px-4 py-1 sm:py-0.5"
      >
        <div className={"z-10 flex flex-wrap items-center sm:text-xs"}>
          {text}
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
  const videoStatusQuery = api.video.getVideoStatus.useQuery(
    { videoId },
    {
      enabled: !!videoId,
    }
  );
  const [selectedSegment, setSelectedSegment] = useState("");
  const toggleSetSelectedSegment = (s?: string) => {
    s && setSelectedSegment((p) => (p === s ? "" : s));
  };
  //console.log("vod sponsors?", sponsors.data);
  const sponsorsLoading = sponsors.isLoading;
  return (
    <div
      className={clsx(
        "relative flex items-center justify-center rounded-lg border border-th-additiveBackground/10 bg-th-generalBackgroundA",
        !sponsorsLoading && "p-3"
      )}
    >
      {sponsors.isRefetching && (
        <div
          className={
            "absolute z-10 " +
            (sponsors.data && sponsors.data.length > 0
              ? " right-2 top-2"
              : " right-3 top-1/2 -translate-y-1/2 ")
          }
        >
          <CgSpinnerTwoAlt className="h-3 w-3 animate-spin " />
        </div>
      )}
      {sponsorsLoading ? (
        <div className="skeleton-box  w-full p-3  text-xs">
          <span className="mr-auto select-none text-xs text-transparent">
            sponsors loading..
          </span>
        </div>
      ) : sponsors.data && sponsors.data.length > 0 ? (
        <>
          <h2 className="hidden text-sm font-bold">sponsor information</h2>
          <table className="w-full table-fixed text-xs">
            <tbody>
              {Object.values(AnnotationTags)
                .filter((type) =>
                  sponsors.data.some((s) => {
                    const adapted =
                      type.toLowerCase() as Lowercase<AnnotationTags>;
                    return sponsors.data.some((s) => s?.[adapted]);
                  })
                )
                .map((type) => (
                  <tr
                    className="border-th border-b border-t border-th-additiveBackground/10  font-bold first:border-t-0 last:border-b-0 [&_th]:w-16 [&_th]:pr-2"
                    key={type}
                  >
                    <th className="select-none  py-2 text-start font-semibold sm:text-sm">
                      <span className="capitalize">{type[0]}</span>
                      <span className="lowercase">{type.slice(1)}s</span>
                    </th>
                    <td className="flex min-h-[4rem] flex-row flex-wrap items-center justify-start gap-2 py-2 pl-2 text-xxs capitalize">
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
        <p className="mr-auto text-xs">
          no sponsor information found
          {videoStatusQuery.data?.status === "completed" ||
          videoStatusQuery.data?.status === "error" ? (
            <>
              <br />
              previous automatic annotations were unable to parse sponsors
            </>
          ) : !videoStatusQuery.data?.status ? (
            <>
              <br />
              no previous automatic annotations applied
            </>
          ) : (
            <></>
          )}
        </p>
      )}
    </div>
  );
};

export default VideoSponsors;
