import { api } from "@/utils/api";
import { useCallback, useEffect, useState } from "react";

const useMonitorChannel = ({ channelId }: { channelId: string }) => {
  const [enableMonitor, setEnableMonitor] = useState(false);
  const startMonitor = useCallback(
    () => {
      setEnableMonitor(true);
    },
    [],
  )
  
  const channelStatusQuery = api.channel.getVideosStatus.useQuery(
    { channelId },
    {
      enabled: !!channelId,
      refetchOnReconnect: true,
      refetchOnWindowFocus: true,
      refetchInterval: enableMonitor ? 5 * 1000 : Infinity,
    }
  );

  useEffect(() => {
    if (
      !channelStatusQuery.isLoading &&
      channelStatusQuery.data?.status === "completed"
    ) {
      setEnableMonitor(false);
    }
  }, [channelStatusQuery.isLoading, channelStatusQuery.data]);

  return {
    channelStatusQuery,
    startMonitor,
  };
};

export default useMonitorChannel;
