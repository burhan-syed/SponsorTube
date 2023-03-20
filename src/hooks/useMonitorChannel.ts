import { trpc } from "@/utils/trpc";

const useMonitorChannel = ({ channelId }: { channelId: string }) => {
  const channelStatusQuery = trpc.channel.getStatus.useQuery(
    { channelId },
    { refetchInterval: 10 * 1000 }
  );


  return channelStatusQuery;

};

export default useMonitorChannel;
