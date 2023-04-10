import { api } from "@/utils/api";
import { useCallback, useEffect, useState } from "react";

const useMonitorVideo = ({ videoId }: { videoId: string }) => {
  const [enableMonitor, setEnableMonitor] = useState(false);
  const startMonitor = useCallback(() => {
    setEnableMonitor(true);
  }, []);

  const videoStatusQuery = api.video.getVideoStatus.useQuery(
    { videoId },
    {
      enabled: !!videoId,
      refetchOnReconnect: true,
      refetchOnWindowFocus: true,
      refetchInterval: enableMonitor ? 5 * 1000 : Infinity,
    }
  );

  useEffect(() => {
    if (
      !videoStatusQuery.isLoading &&
      (videoStatusQuery.data?.status === "completed" ||
        videoStatusQuery.data?.status === "error")
    ) {
      setEnableMonitor(false);
    }
  }, [videoStatusQuery.isLoading, videoStatusQuery.data]);

  return {
    videoStatusQuery,
    startMonitor,
  };
};

export default useMonitorVideo;
