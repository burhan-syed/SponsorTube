import React, { useEffect, useState } from "react";
import * as TabsPrimitives from "@radix-ui/react-tabs";
import SavedTranscripts from "./SavedTranscripts";

import type { Segment } from "sponsorblock-api";
import GeneratedTranscripts from "./GeneratedTranscripts";
import { trpc } from "@/utils/trpc";
import { useSession } from "next-auth/react";
import TabsList from "../ui/common/tabs/TabsList";
import { Button } from "../ui/common/Button";
import { BsPlay } from "react-icons/bs";
import { secondsToHMS } from "@/utils";
const TranscriptTabs = ({
  segment,
  captionsURL,
  seekTo,
}: {
  segment: Segment;
  captionsURL: string;
  seekTo(start: number, end: number): void;
}) => {
  //load these prior to tab focus
  const savedTranscriptAnnotations = trpc.transcript.get.useQuery(
    {
      segmentUUID: segment.UUID,
      mode: "score",
    },
    {
      enabled: !!segment.UUID,
    }
  );

  const [transcriptTimes, setTranscriptTimes] = useState<{
    start: number;
    end: number;
  }>();
  const [tabValue, setTabValue] = useState<string>("");
  const { data: sessionData } = useSession();

  useEffect(() => {
    if (
      savedTranscriptAnnotations.isFetched &&
      (savedTranscriptAnnotations?.data?.length ?? 0 > 0) &&
      !tabValue
    ) {
      setTabValue("saved");
    } else if (savedTranscriptAnnotations.isFetched && !tabValue) {
      setTabValue("generated");
    }
    if (
      (savedTranscriptAnnotations?.data?.length ?? 0 > 0) &&
      typeof savedTranscriptAnnotations.data?.[0]?.startTime === "number" &&
      typeof savedTranscriptAnnotations.data?.[0]?.endTime === "number"
    ) {
      setTranscriptTimes({
        start: savedTranscriptAnnotations.data?.[0]?.startTime,
        end: savedTranscriptAnnotations.data?.[0]?.endTime,
      });
    }
    return () => {
      //
    };
  }, [
    savedTranscriptAnnotations.isFetched,
    savedTranscriptAnnotations.data,
    tabValue,
  ]);

  if (savedTranscriptAnnotations.isInitialLoading || !tabValue) {
    return (
      <div className="h-10 w-full animate-pulse bg-th-additiveBackground bg-opacity-5">
        loading...
      </div>
    );
  }
  type tabValues = "saved" | "user" | "generated";
  const tabsList = [
    { value: "saved" },
    { value: "user", disabled: !sessionData },
    { value: "generated" },
  ] as { value: tabValues; disabled?: boolean }[];

  return (
    <>
      {transcriptTimes?.start && transcriptTimes.end && (
        <div className="flex items-center gap-2">
          <Button
            className="h-9 w-9"
            onClick={() =>
              seekTo(
                transcriptTimes.start as number,
                transcriptTimes.end as number
              )
            }
          >
            <BsPlay />
          </Button>
          <span className="text-th-textSecondary text-xs">
            {secondsToHMS(transcriptTimes.start)} - 
            {secondsToHMS(transcriptTimes.end)}
          </span>
        </div>
      )}
      <TabsPrimitives.Root
        defaultValue="saved"
        orientation="vertical"
        value={tabValue}
        onValueChange={(value) => setTabValue(value)}
        className="grid grid-cols-[2.8rem_1fr] gap-2 outline outline-red-500 "
      >
        <div className="relative mt-auto h-[25rem] w-[2.8rem]">
          <div className="pointer-events-none absolute top-0 h-7 w-[25rem] origin-top-left rotate-[270deg]">
            <div className="pointer-events-auto h-full w-full -translate-x-full ">
              <TabsList tabsList={tabsList} />
            </div>
          </div>
        </div>

        <div className="">
          {tabsList.map(({ value }) => (
            <TabsPrimitives.Content
              key={value}
              value={value}
              className=" hidden flex-col border border-orange-400 data-[state=active]:flex data-[state=active]:min-h-[30rem]"
            >
              {value === "generated" ? (
                <GeneratedTranscripts
                  segment={segment}
                  captionsURL={captionsURL}
                  setTabValue={setTabValue}
                  seekTo={seekTo}
                  setTranscriptTimes={setTranscriptTimes}
                />
              ) : (
                <SavedTranscripts
                  segmentUUID={segment.UUID}
                  setTabValue={setTabValue}
                  seekTo={seekTo}
                  userPosts={value === "user"}
                />
              )}
            </TabsPrimitives.Content>
          ))}
        </div>
      </TabsPrimitives.Root>
    </>
  );
};

export default TranscriptTabs;
