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
      <div className="bg-gray-500 h-10 w-full animate-pulse">loading...</div>
    );
  }

  return (
    <TabsPrimitives.Root
      defaultValue="saved"
      orientation="vertical"
      value={tabValue}
      onValueChange={(value) => setTabValue(value)}
      className=""
    >
      <TabsList
        tabsList={[
          { value: "saved" },
          { value: "user", disabled: !sessionData },
          { value: "generated" },
        ]}
      />
      <TabsPrimitives.Content value="saved">
        <SavedTranscripts
          segmentUUID={segment.UUID}
          setTabValue={setTabValue}
          seekTo={seekTo}
        />
      </TabsPrimitives.Content>
      <TabsPrimitives.Content value="user">
        <SavedTranscripts
          segmentUUID={segment.UUID}
          userPosts={true}
          setTabValue={setTabValue}
          seekTo={seekTo}
        />
      </TabsPrimitives.Content>
      <TabsPrimitives.Content value="generated">
        <GeneratedTranscripts
          segment={segment}
          captionsURL={captionsURL}
          setTabValue={setTabValue}
          seekTo={seekTo}
        />
      </TabsPrimitives.Content>
    </TabsPrimitives.Root>
  );
};

export default TranscriptTabs;
