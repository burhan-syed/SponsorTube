import React, { useEffect, useState } from "react";
import clsx from "clsx";
import { api } from "@/utils/api";
import type { ProcessQueue } from "@prisma/client";

import { BiBrain, BiChevronDown, BiRefresh } from "react-icons/bi";
import { BsInfo } from "react-icons/bs";
import { useWindowWidth } from "@react-hook/window-size/throttled";
import useMonitorChannel from "@/hooks/useMonitorChannel";
import Dropdown from "@/components/ui/common/Dropdown";
import ToolTip from "@/components/ui/common/Tooltip";
import { Button } from "@/components/ui/common/Button";
import ChannelStats from "./ChannelStatsWrapper/ChannelStats";
import useGlobalStore from "@/store/useGlobalStore";
import { CustomError } from "@/server/common/errors";
import useIsMobileWindow from "@/hooks/useIsMobileWindow";

const ChannelProcessButtonChildren = ({
  isopen,
  isLoading,
}: {
  isopen?: boolean;
  isLoading: boolean;
}) => {
  return (
    <div className="flex w-full items-center justify-center rounded-full bg-th-chipBackground">
      <div className="flex flex-none select-none items-center gap-2 px-4 py-2 ">
        <span className="md:hidden">Process Channel Sponsors</span>
        <span className="hidden md:block">Process Sponsors</span>

        <>
          {isLoading ? (
            <div className="animate-spin">
              <BiRefresh className="h-5 w-5 flex-none -scale-x-100  " />
            </div>
          ) : (
            <BiChevronDown
              className={clsx(
                "h-5 w-5 flex-none transition-transform ease-in-out",
                isopen ? "rotate-180" : ""
              )}
            />
          )}
        </>
      </div>
    </div>
  );
};

const ChannelStatusToolTip = ({
  channelId,
  isError,
  isLoading,
  data,
  processChannelLoading,
}: {
  channelId: string;
  isError: boolean;
  isLoading: boolean;
  processChannelLoading: boolean;
  data?: ProcessQueue;
}) => {
  return (
    <ToolTip
      manualControlMS={5000}
      text={
        <div className="flex flex-col items-end">
          {isLoading ? (
            <span>Waiting for status..</span>
          ) : isError ? (
            <span>error fetching status</span>
          ) : data?.id ? (
            <p className="flex flex-col items-center justify-center">
              {data.status === "partial" ||
              (data.status === "pending" && data.timeInitialized) ? (
                <span>{`Update Initialized ${data?.timeInitialized?.toLocaleString(
                  undefined,
                  {
                    dateStyle: "short",
                    timeStyle: "short",
                  }
                )}`}</span>
              ) : (
                processChannelLoading && <span>Job pending</span>
              )}
              {(data.status === "completed" || data.status === "error") &&
                data.lastUpdated && (
                  <span>{`Last updated ${data?.lastUpdated?.toLocaleString(
                    undefined,
                    {
                      dateStyle: "short",
                      timeStyle: "short",
                    }
                  )}`}</span>
                )}
            </p>
          ) : (
            <span>
              {processChannelLoading
                ? "Job pending"
                : "No previous process jobs found"}
            </span>
          )}
          <ChannelStats channelId={channelId} />
        </div>
      }
      tooltipOptions={{
        align: "end",
        side: "bottom",
        sideOffset: 10,
      }}
      className="rounded-full"
    >
      <Button dummyButton={true} round={true}>
        <BsInfo className="h-5 w-5 flex-none" />
      </Button>
    </ToolTip>
  );
};

const ChannelProcessButton = ({ channelId }: { channelId: string }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [waitToFinish, setWaitToFinish] = useState(false);
  const isMobile = useIsMobileWindow();
  const utils = api.useContext();
  const dialogueTrigger = useGlobalStore((store) => store.setDialogueTrigger);
  const setSessionRequiredTrigger = useGlobalStore(
    (state) => state.setSessionRequiredTrigger
  );
  const { startMonitor, channelStatusQuery } = useMonitorChannel({ channelId });
  const processChannel = api.channel.processChannel.useMutation({
    async onSuccess() {
      await utils.channel.getVideosStatus.invalidate({ channelId });
      startMonitor();
      setWaitToFinish(true);
    },
    onError(error, variables, context) {
      if (error.data?.customError) {
        const cError = new CustomError({ fromstring: error.data.customError });
        if (cError.message) {
          dialogueTrigger({
            title: "error",
            description: cError.message,
            close: "ok",
          });
        }
      } else if (error.message === "UNAUTHORIZED") {
        setSessionRequiredTrigger("Sign in to request bulk channel updates");
      }
    },
  });
  //keep this loaded for invalidation
  api.channel.getStats.useQuery({ channelId });

  const updateSponsors = api.channel.updateChannelSponsors.useMutation({
    async onSuccess() {
      await Promise.allSettled([
        utils.channel.getSponsors.invalidate({ channelId }),
        utils.channel.getStats.invalidate({ channelId }),
      ]);
    },
    onError(error, variables, context) {
      if (error.data?.customError) {
        const cError = new CustomError({ fromstring: error.data.customError });
        if (cError.message) {
          dialogueTrigger({
            title: "error",
            description: cError.message,
            close: "ok",
          });
        }
      } else if (error.message === "UNAUTHORIZED") {
        setSessionRequiredTrigger("");
      }
    },
  });
  useEffect(() => {
    const invalidateSponsors = async () => {
      await Promise.all([
        utils.video.getSponsors.invalidate(),
        utils.channel.getSponsors.invalidate({ channelId }),
        utils.channel.getStats.invalidate({ channelId }),
      ]);
      setIsLoading(false);
      setWaitToFinish(false);
    };

    if (
      channelStatusQuery.data?.status === "partial" ||
      channelStatusQuery.data?.status === "pending"
    ) {
      startMonitor();
    }

    if (
      processChannel.isLoading ||
      updateSponsors.isLoading ||
      channelStatusQuery.isLoading ||
      channelStatusQuery.data?.status === "partial" ||
      channelStatusQuery.data?.status === "pending"
    ) {
      setIsLoading(true);
    } else if (waitToFinish) {
      console.log({
        waitToFinish,
        pLoading: processChannel.isLoading,
        mLoading: channelStatusQuery.isLoading,
        mStatus: channelStatusQuery.data?.status,
      });
      invalidateSponsors();
    } else {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    startMonitor,
    channelId,
    channelStatusQuery.isLoading,
    channelStatusQuery.data?.status,
    updateSponsors.isLoading,
    processChannel.isLoading,
    waitToFinish,
    // unnecessary causes effect loops
    // utils.video.getSponsors,
    // utils.channel.getSponsors,
    // utils.channel.getStats,
  ]);

  return (
    <div className="flex w-full flex-none gap-2 md:w-auto">
      <div className="w-full">
        <Dropdown
          disabled={isLoading}
          modal={isMobile}
          MenuItems={[
            <button
              disabled={isLoading}
              className="flex items-center justify-between px-4 sm:justify-start sm:gap-2 sm:px-4"
              key="button1"
              onClick={() => {
                processChannel.mutate({ channelID: channelId });
              }}
            >
              <BiBrain className="h-5 w-5 flex-none" />
              <span>Process Recent Videos</span>
            </button>,
            <button
              disabled={isLoading}
              className="flex items-center justify-between px-4 sm:justify-start sm:gap-2  sm:px-4 "
              key="button2"
              onClick={() => {
                updateSponsors.mutate({ channelId: channelId });
              }}
            >
              <BiRefresh className="h-5 w-5 flex-none -scale-x-100 " />
              <span>Sync Sponsors</span>
            </button>,
          ]}
          menuHeader={{
            title: "Process Channel",
            description:
              "Automatically identify and update sponsor information in recent videos. Sync sponsors if information is out of date.",
          }}
          menuOptions={{
            sideOffset: 5,
            side: "bottom",
            align: "end",
          }}
        >
          <ChannelProcessButtonChildren isLoading={isLoading} />
        </Dropdown>
      </div>

      <ChannelStatusToolTip
        channelId={channelId}
        isError={channelStatusQuery.isError}
        isLoading={channelStatusQuery.isLoading}
        data={channelStatusQuery?.data ?? undefined}
        processChannelLoading={processChannel.isLoading}
      />
    </div>
  );
};

export default ChannelProcessButton;
