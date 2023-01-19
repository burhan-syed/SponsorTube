import React, { useEffect, useState } from "react";
import * as TabsPrimitives from "@radix-ui/react-tabs";
import SavedTranscripts from "./SavedTranscripts";

import type { Segment } from "sponsorblock-api";
import GeneratedTranscripts from "./GeneratedTranscripts";
import { trpc } from "@/utils/trpc";
import { useSession } from "next-auth/react";
import TabsList from "../ui/common/tabs/TabsList";
const TranscriptTabs = ({
  segment,
  captionsURL,
  seekTo,
}: {
  segment: Segment;
  captionsURL: string;
  seekTo(start: number, end: number): void;
}) => {
  const { data: sessionData } = useSession();

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
  const [isNavDisabled, setIsNavDisabled] = useState(false); 
  const [tabValue, setTabValue] = useState<string>("");
  type tabValues = "saved" | "user" | "generated";
  const tabsList = [
    { value: "saved" },
    { value: "user", disabled: !sessionData },
    { value: "generated" },
  ] as { value: tabValues; disabled?: boolean }[];

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

  return (
    <>
      <TabsPrimitives.Root
        defaultValue="saved"
        orientation="vertical"
        value={tabValue}
        onValueChange={(value) => setTabValue(value)}
        className="rounded-lg border border-th-additiveBackground/10 bg-th-generalBackgroundA sm:grid sm:grid-cols-[1fr_3.2rem]"
      >
        <div className="rounded-lg bg-th-baseBackground sm:order-2">
          <div className="relative sm:h-[25rem] sm:w-8">
            <div className="sm:pointer-events-none sm:absolute sm:top-0 sm:h-8 sm:w-[25rem] sm:origin-top-left sm:rotate-90">
              <div className="pointer-events-auto  sm:h-full sm:w-full sm:-translate-y-full ">
                <TabsList disabled={isNavDisabled} tabsList={tabsList} />
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-t-th-textSecondary sm:order-1 sm:border-t-0 sm:border-r sm:border-r-th-textSecondary">
          {tabsList.map(({ value }) => (
            <TabsPrimitives.Content
              key={value}
              value={value}
              className=" hidden flex-col data-[state=active]:flex data-[state=active]:min-h-[30rem]"
            >
              {value === "generated" ? (
                <GeneratedTranscripts
                  segment={segment}
                  captionsURL={captionsURL}
                  setTabValue={setTabValue}
                  setIsNavDisabled={setIsNavDisabled}
                  isNavDisabled={isNavDisabled}
                  seekTo={seekTo}
                />
              ) : (
                <SavedTranscripts
                  segmentUUID={segment.UUID}
                  setTabValue={setTabValue}
                  setIsNavDisabled={setIsNavDisabled}
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
