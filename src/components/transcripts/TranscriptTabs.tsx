import React, { Suspense, useEffect, useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import SavedTranscripts from "./SavedTranscripts";

import type { Segment } from "sponsorblock-api";
import GeneratedTranscripts from "./GeneratedTranscripts";
import { trpc } from "@/utils/trpc";
const TranscriptTabs = ({
  segment,
  captionsURL,
}: {
  segment: Segment;
  captionsURL: string;
}) => {
  //load these prior to tab focus
  const savedTranscriptAnnotations = trpc.transcript.get.useQuery(
    {
      segmentUUID: segment.UUID,
      userPosts: false,
    },
    {
      enabled: !!segment.UUID,
    }
  );

  const [tabValue, setTabValue] = useState<string>("");

  useEffect(() => {
    console.log(
      savedTranscriptAnnotations.isFetched,
      savedTranscriptAnnotations?.data?.length ?? 0 > 0
    );
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

  if (
    savedTranscriptAnnotations.isInitialLoading ||
    !tabValue
  ) {
    return (
      <div className="h-10 w-full animate-pulse bg-gray-500">loading...</div>
    );
  }

  return (
    <Tabs.Root
      defaultValue="saved"
      orientation="vertical"
      value={tabValue}
      onValueChange={(value) => setTabValue(value)}
    >
      <Tabs.List aria-label="tabs example">
        <Tabs.Trigger
          className="hover:bg-green-200 data-[state=active]:bg-blue-300"
          value="saved"
        >
          saved
        </Tabs.Trigger>
        <Tabs.Trigger
          className="hover:bg-green-200 data-[state=active]:bg-blue-300"
          value="user"
        >
          user
        </Tabs.Trigger>
        <Tabs.Trigger
          className="hover:bg-green-200 data-[state=active]:bg-blue-300"
          value="generated"
        >
          generated
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="saved">
        <SavedTranscripts
          segmentUUID={segment.UUID}
          setTabValue={setTabValue}
        />
      </Tabs.Content>
      <Tabs.Content value="user">
        <SavedTranscripts
          segmentUUID={segment.UUID}
          userPosts={true}
          setTabValue={setTabValue}
        />
      </Tabs.Content>
      <Tabs.Content value="generated">
        <GeneratedTranscripts
          segment={segment}
          captionsURL={captionsURL}
          setTabValue={setTabValue}
        />
      </Tabs.Content>
    </Tabs.Root>
  );
};

export default TranscriptTabs;
