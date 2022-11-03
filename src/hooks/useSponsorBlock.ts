import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { Category } from "sponsorblock-api";
import { v4 as uuidv4 } from "uuid";
import { getVideoSegments } from "../apis/sponsorblock";

const useSponsorBlock = ({
  videoID,
  categories = ["sponsor"],
}: {
  videoID: string | undefined;
  categories?: Category[];
}) => {
  const [cookie, setCookie] = useCookies(["sb-id"]);
  const [userID, setUserID] = useState(() => uuidv4());
  useEffect(() => {
    if (cookie["sb-id"]) {
      setUserID(cookie["sb-id"]);
    } else {
      setCookie("sb-id", uuidv4(), {
        expires: new Date(2147483647 * 1000),
        sameSite: "lax",
      });
    }
  }, []);

  const segments = useQuery(
    ["sponsorblock", videoID, categories, userID],
    () => getVideoSegments({ userID, videoID, categories }),
    {
      enabled: !!userID && !!videoID,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      cacheTime: Infinity
    }
  );

  return segments;
};

export default useSponsorBlock;
