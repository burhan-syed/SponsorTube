import { useQuery } from "@tanstack/react-query";
import { getXMLCaptions } from "../server/common/captions";
const useVideoCaptions = ({ captionsURL }: { captionsURL: string }) => {
  const captions = useQuery(
    ["captions", captionsURL],
    () => getXMLCaptions(captionsURL),
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      cacheTime: Infinity,
    }
  );
  return captions;
};

export default useVideoCaptions;
