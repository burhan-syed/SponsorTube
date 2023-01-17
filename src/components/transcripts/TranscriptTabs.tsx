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
    <TabsPrimitives.Root
      defaultValue="saved"
      orientation="vertical"
      value={tabValue}
      onValueChange={(value) => setTabValue(value)}
      className="outline outline-red-500 sm:grid sm:grid-cols-[2.8rem_1fr] "
    >
      <div className="sm:relative sm:mt-auto sm:h-[25rem] sm:w-[2.8rem]">
        <div className="h-7 origin-top-left sm:pointer-events-none sm:absolute sm:top-0 sm:w-[25rem] sm:rotate-[270deg]">
          <div className="h-full w-full sm:pointer-events-auto sm:-translate-x-full ">
            <TabsList tabsList={tabsList} />
          </div>
        </div>
      </div>
      <div className="sm:min-h-[30rem]">
        {tabsList.map(({ value }) => (
          <TabsPrimitives.Content key={value} value={value}>
            {value === "generated" ? (
              <GeneratedTranscripts
                segment={segment}
                captionsURL={captionsURL}
                setTabValue={setTabValue}
                seekTo={seekTo}
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
  );
};

export default TranscriptTabs;
