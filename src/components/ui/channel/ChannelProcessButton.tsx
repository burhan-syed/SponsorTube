import React, { useEffect, useState } from "react";
import { trpc } from "@/utils/trpc";

import Dropdown from "../common/Dropdown";
import { BiBrain, BiChevronDown, BiRefresh } from "react-icons/bi";
import { useWindowWidth } from "@react-hook/window-size/throttled";
import useMonitorChannel from "@/hooks/useMonitorChannel";
const ChannelProcessButton = ({ channelId }: { channelId: string }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [waitToFinish, setWaitToFinish] = useState(false);
  const windowWidth = useWindowWidth({ initialWidth: 400 });
  const utils = trpc.useContext();
  const { startMonitor, channelStatusQuery } = useMonitorChannel({ channelId });
  const processChannel = trpc.channel.processChannel.useMutation({
    async onSuccess() {
      await utils.channel.getVideosStatus.invalidate({ channelId });
      startMonitor();
      setWaitToFinish(true);
    },
  });
  const updateSponsors = trpc.channel.updateChannelSponsors.useMutation({
    async onSuccess() {
      await utils.channel.getSponsors.invalidate({ channelId });
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
  }, [
    startMonitor,
    channelId,
    channelStatusQuery.isLoading,
    channelStatusQuery.data?.status,
    updateSponsors.isLoading,
    processChannel.isLoading,
    waitToFinish,
    utils.video.getSponsors,
    utils.channel.getSponsors,
    utils.channel.getStats,
  ]);

  return (
    <div>
      <Dropdown
        disabled={isLoading}
        TriggerElementChildren={
          <span className="flex flex-none select-none items-center gap-2">
            Process
            <>
              {isLoading ? (
                <div className="animate-spin">
                  <BiRefresh className="h-5 w-5 flex-none -scale-x-100  " />
                </div>
              ) : (
                <BiChevronDown className="h-5 w-5 flex-none" />
              )}
            </>
          </span>
        }
        MenuItems={[
          <button
            disabled={isLoading}
            className="flex items-center justify-between px-4 md:justify-start md:gap-2 md:px-4"
            key="button1"
            onClick={() => {
              processChannel.mutate({ channelID: channelId });
            }}
          >
            <BiBrain className="h-5 w-5 flex-none" />
            <span>Process Channel</span>
          </button>,
          <button
            disabled={isLoading}
            className="flex items-center justify-between px-4 md:justify-start md:gap-2  md:px-4 "
            key="button2"
            onClick={() => {
              updateSponsors.mutate({ channelId: channelId });
            }}
          >
            <BiRefresh className="h-5 w-5 flex-none -scale-x-100 " />
            <span>Update Sponsors</span>{" "}
          </button>,
        ]}
        menuOptions={{
          sideOffset: 5,
          side: "bottom",
          align: windowWidth > 768 ? "end" : "center",
        }}
      />
    </div>
  );
};

export default ChannelProcessButton;
