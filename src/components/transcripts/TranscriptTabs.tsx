import React from "react";
import * as Tabs from "@radix-ui/react-tabs";
import SavedTranscripts from "./SavedTranscripts";

import type { Segment } from "sponsorblock-api";
import GeneratedTranscripts from "./GeneratedTranscripts";
const TranscriptTabs = ({
  segment,
  captionsURL,
}: {
  segment: Segment;
  captionsURL: string;
}) => {
  return (
    <Tabs.Root defaultValue="tab1" orientation="vertical">
      <Tabs.List aria-label="tabs example">
        <Tabs.Trigger value="tab1">saved</Tabs.Trigger>
        <Tabs.Trigger value="tab2">user</Tabs.Trigger>
        <Tabs.Trigger value="tab3">generated</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="tab1">
        <SavedTranscripts segmentUUID={segment.UUID} />
      </Tabs.Content>
      <Tabs.Content value="tab2">
        <SavedTranscripts segmentUUID={segment.UUID} userPosts={true} />
      </Tabs.Content>
      <Tabs.Content value="tab3">
        <GeneratedTranscripts segment={segment} captionsURL={captionsURL} />
      </Tabs.Content>
    </Tabs.Root>
  );
};

export default TranscriptTabs;
