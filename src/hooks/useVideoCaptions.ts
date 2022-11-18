import { useQuery } from "@tanstack/react-query";
import { getXMLCaptions } from "../server/functions/captions";
const useVideoCaptions = ({ captionsURL }: { captionsURL: string }) => {
  const captions = useQuery(
    ["captions", captionsURL],
    () => getXMLCaptions(captionsURL),
    {
      enabled: !!captionsURL,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      cacheTime: Infinity,
    }
  );
  return captions;
};

export default useVideoCaptions;
