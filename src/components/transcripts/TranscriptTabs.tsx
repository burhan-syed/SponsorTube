import React, { useEffect, useState } from "react";
import * as TabsPrimitives from "@radix-ui/react-tabs";
import SavedTranscripts from "./SavedTranscripts";

import type { Segment } from "sponsorblock-api";
import GeneratedTranscripts from "./GeneratedTranscripts";
import { api } from "@/utils/api";
import { useSession } from "next-auth/react";
import TabsList from "../ui/common/tabs/TabsList";
import TranscriptLoader from "../ui/loaders/transcripts/TranscriptLoader";
import useTranscriptQuery from "@/hooks/useTranscriptQuery";

type tabValues = "saved" | "user" | "generated";

const TranscriptTabs = ({
  videoID,
  segment,
  captionsURL,
  seekTo,
}: {
  videoID: string;
  segment: Segment;
  captionsURL: string;
  seekTo(start: number, end: number): void;
}) => {
  const { data: sessionData, status } = useSession();
  const { savedTranscriptAnnotations } = useTranscriptQuery({
    segmentUUID: segment.UUID,
  });

  const [isNavDisabled, setIsNavDisabled] = useState(false);
  const [tabValue, setTabValue] = useState<string>("");
  const [tabsList, setTabList] = useState<
    { value: tabValues; disabled?: boolean; label?: string }[]
  >(() => [{ value: "generated", label: "auto" }]);
  useEffect(() => {
    if (status === "authenticated") {
      setTabList((tl) => {
        if (!tl.some((tab) => tab.value === "user")) {
          return [...tl, { value: "user" }];
        }
        return tl;
      });
    }
  }, [status]);

  // const tabsList = [
  //   { value: "saved" },
  //   { value: "user", disabled: !sessionData },
  //   { value: "generated" },
  // ] as { value: tabValues; disabled?: boolean }[];

  useEffect(() => {
    if (
      savedTranscriptAnnotations.isFetched &&
      (savedTranscriptAnnotations?.data?.length ?? 0 > 0) &&
      !tabValue
    ) {
      setTabList((tl) => {
        if (!tl.some((tab) => tab.value === "saved")) {
          return [...tl, { value: "saved", label: "Top" }];
        }
        return tl;
      });
      !tabValue && setTabValue("saved");
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

  if (savedTranscriptAnnotations.isInitialLoading || status === "loading") {
    return (
      <div className="flex min-h-[30rem] flex-col rounded-lg border border-th-additiveBackground/10 bg-th-generalBackgroundA">
        <TranscriptLoader />
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
                <TabsList
                  disabled={
                    isNavDisabled ||
                    savedTranscriptAnnotations.isInitialLoading ||
                    !tabValue
                  }
                  tabsList={tabsList}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-t-th-textSecondary sm:order-1 sm:border-r sm:border-t-0 sm:border-r-th-textSecondary">
          {savedTranscriptAnnotations.isInitialLoading || !tabValue ? (
            <div className="flex min-h-[30rem] flex-col">
              <TranscriptLoader />
            </div>
          ) : (
            <>
              {tabsList.map(({ value }) => (
                <TabsPrimitives.Content
                  key={value}
                  value={value}
                  className=" hidden flex-col data-[state=active]:flex data-[state=active]:min-h-[30rem]"
                >
                  {value === "generated" ? (
                    <GeneratedTranscripts
                      segment={segment}
                      videoID={videoID}
                      captionsURL={captionsURL}
                      setTabValue={setTabValue}
                      setIsNavDisabled={setIsNavDisabled}
                      isNavDisabled={isNavDisabled}
                      seekTo={seekTo}
                    />
                  ) : (
                    <SavedTranscripts
                      segment={segment}
                      videoID={videoID}
                      setTabValue={setTabValue}
                      setIsNavDisabled={setIsNavDisabled}
                      seekTo={seekTo}
                      userPosts={value === "user"}
                    />
                  )}
                </TabsPrimitives.Content>
              ))}
            </>
          )}
        </div>
      </TabsPrimitives.Root>
    </>
  );
};

export default TranscriptTabs;
