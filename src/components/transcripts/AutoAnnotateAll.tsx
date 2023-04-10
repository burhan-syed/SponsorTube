import React from "react";
import { Button } from "@/components/ui/common/Button";
import { api } from "@/utils/api";
import { BiBrain } from "react-icons/bi";
import { TRPCError } from "@trpc/server";
import useGlobalStore from "@/store/useGlobalStore";
import { CustomError } from "@/server/common/errors";

const AutoAnnotateAll = ({
  videoId,
  isLoading,
}: {
  videoId?: string;
  isLoading: boolean;
}) => {
  const dialogueTrigger = useGlobalStore((store) => store.setDialogueTrigger);
  const utils = api.useContext();
  const processVideo = api.video.processVideo.useMutation({
    async onSuccess(data, variables, context) {
      console.log("success?", data);
      if (data?.errors?.length ?? 0 > 0) {
        dialogueTrigger({
          title: "errors",
          description: data?.errors?.join("\n") ?? "",
          close: "ok",
        });
      }

      await Promise.all([
        utils.transcript.get.invalidate(),
        utils.video.getSponsors.invalidate({
          videoId: videoId ?? "",
        }),
      ]);
    },

    onError(error, variables, context) {
      if (error.data?.customError) {
        const parse = new CustomError({ fromstring: error.data?.customError });
        console.log("parsed?", parse);
        dialogueTrigger({
          title: "errors",
          description: parse.message,
          close: "ok",
        });
      }
    },
  });
  return (
    <>
      <Button
        disabled={processVideo.isLoading || isLoading || !videoId}
        loading={processVideo.isLoading}
        onClick={() =>
          processVideo.mutate({
            videoId: videoId ?? "",
          })
        }
        className="gap-x-2"
      >
        <BiBrain />
        Auto Annotate Video
      </Button>
    </>
  );
};

export default AutoAnnotateAll;
