import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/common/Button";
import { api } from "@/utils/api";
import { BiBrain } from "react-icons/bi";
import { TRPCError } from "@trpc/server";
import useGlobalStore from "@/store/useGlobalStore";
import { CustomError } from "@/server/common/errors";
import useMonitorVideo from "@/hooks/useMonitorVideo";
import ToolTip from "../ui/common/Tooltip";
import useSponsorBlock from "@/hooks/useSponsorBlock";

const AutoAnnotateAll = ({
  videoId,
  isLoading,
}: {
  videoId?: string;
  isLoading: boolean;
}) => {
  const [disable, setDisable] = useState(false);
  const dialogueTrigger = useGlobalStore((store) => store.setDialogueTrigger);
  const { segments, savedSegments } = useSponsorBlock({ videoID: videoId });
  const utils = api.useContext();
  const { startMonitor, videoStatusQuery } = useMonitorVideo({
    videoId: videoId ?? "",
  });
  const processVideo = api.video.processVideo.useMutation({
    async onSuccess(data, variables, context) {
      //console.log("success?", data);
      if (data?.errors?.length ?? 0 > 0) {
        dialogueTrigger({
          title: "The following errors were logged for one or more segments",
          description: data?.errors?.join("\n") ?? "",
          close: "ok",
        });
      }else{
        setDisable(true);
      }

      await Promise.all([
        utils.video.getVideoStatus.invalidate({ videoId: videoId ?? "" }),
        utils.transcript.get.invalidate(),
        utils.video.getSponsors.invalidate({
          videoId: videoId ?? "",
        }),
      ]);
    },

    onError(error, variables, context) {
      if (error.data?.customError) {
        const parse = new CustomError({ fromstring: error.data?.customError });
        //console.log("parsed?", parse);
        if (parse.type === "BOT_PENDING") {
          startMonitor();
        } else if (parse.message) {
          dialogueTrigger({
            title: "errors",
            description: parse.message,
            close: "ok",
          });
        }
      }
    },
  });

  useEffect(() => {
    const invalidate = async () => {
      await Promise.all([
        utils.transcript.get.invalidate(),
        utils.video.getSponsors.invalidate({
          videoId: videoId ?? "",
        }),
      ]);
    };
    if (
      (processVideo.status === "error" || processVideo.status === "idle") &&
      videoStatusQuery.status === "success"
    ) {
      invalidate();
    }
  }, [processVideo.status, videoStatusQuery.status]);
  useEffect(() => {
    if (videoStatusQuery.data?.status === "pending") {
      startMonitor();
    }
  }, [videoStatusQuery.status]);

  const loading =
    processVideo.isLoading ||
    videoStatusQuery.isLoading ||
    videoStatusQuery.data?.status === "pending";
  const disabled =
    disable ||
    !(
      (segments.data?.length ?? 0) > 0 || (savedSegments.data?.length ?? 0) > 0
    ) ||
    processVideo.isLoading ||
    videoStatusQuery.isLoading ||
    isLoading ||
    !videoId ||
    //videoStatusQuery.data?.status === "completed" ||
    videoStatusQuery.data?.status === "pending";
  return (
    <ToolTip
      tooltipOptions={{ side: "bottom", sideOffset: 15 }}
      text={
        videoStatusQuery.data?.status === "completed" ? (
          <span className="max-w-[80vw] truncate">
            video previously auto annotated
            {videoStatusQuery.data.lastUpdated?.toDateString()
              ? ` on ${videoStatusQuery.data.lastUpdated?.toDateString()}`
              : ""}
          </span>
        ) : videoStatusQuery.data?.status === "pending" ? (
          videoStatusQuery.data.timeInitialized ? (
            `started ${videoStatusQuery.data.timeInitialized.toLocaleString()}`
          ) : (
            ""
          )
        ) : !(
            (segments.data?.length ?? 0) > 0 ||
            (savedSegments.data?.length ?? 0) > 0
          ) ? (
          "no segments found to annotate"
        ) : (
          ""
        )
      }
      manualControlMS={
        videoStatusQuery?.data?.status === "completed" ? 5000 : 0
      }
    >
      <Button
        disabled={disabled}
        loading={loading}
        onClick={() =>
          processVideo.mutate({
            videoId: videoId ?? "",
          })
        }
        loadingText={true}
        className="w-full gap-x-2"
      >
        {videoStatusQuery.data?.status === "pending" ||
        processVideo.isLoading ? (
          "Auto Annotations Pending"
        ) : (
          <div className="flex items-center gap-x-2">
            {!loading && <BiBrain className="" />}
            Auto Annotate Video
          </div>
        )}
      </Button>
    </ToolTip>
  );
};

export default AutoAnnotateAll;
