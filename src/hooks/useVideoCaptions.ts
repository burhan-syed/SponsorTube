import { useQuery } from "@tanstack/react-query";
import he from 'he'; 

const useVideoCaptions = ({ captionsURL }: { captionsURL: string }) => {
  const getXMLCaptions = async () => {
    const data = await fetch(captionsURL)
      .then((response) => response.text())
      .then(
        (str) =>
          new window.DOMParser().parseFromString(str, "text/xml") as XMLDocument
      );
    if (!data.children?.[0]?.children) {
      throw new Error("Captions missing");
    }
    const formatted = Object.values(data.children[0].children).map((child) => {
      return {
        start: parseFloat((child?.["attributes"] as any)?.["start"]?.["value"]),
        duration: parseFloat(
          (child?.["attributes"] as any)?.["dur"]?.["value"]
        ),
        text: he.decode(child?.textContent ?? ""),
      };
    });
    return formatted;
  };

  const captions = useQuery(["captions", captionsURL], getXMLCaptions, {
    enabled: !!captionsURL,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    cacheTime: Infinity,
  });

  return captions;
};

export default useVideoCaptions;
