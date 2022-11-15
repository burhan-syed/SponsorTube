import { XMLParser } from "fast-xml-parser";
import he from 'he'; 

export const getXMLCaptions = async (
  url: string
): Promise<{ text: string; start: number; dur: number }[]> => {
  const XMLdata = await fetch(url).then((response) => response.text());
  const parser = new XMLParser({
    ignoreAttributes: false,
    parseAttributeValue: true,
    attributeNamePrefix: "",
    preserveOrder: true,
    textNodeName: "text",
  });
  const parsedCaptions = parser.parse(XMLdata);
  const firstSegment = parsedCaptions?.[1]?.["transcript"]?.[0];
  //check for unexpected xml format
  if (
    !firstSegment?.["text"]?.[0]?.text &&
    !firstSegment?.[":@"]?.start &&
    !firstSegment?.[":@"]?.dur
  ) {
    throw new Error("Unexpected XML Format. First segment:", firstSegment);
  }
  const formattedCaptions = parsedCaptions?.[1]?.["transcript"]?.map(
    (segment: any) => ({
      text: he.decode(segment?.["text"]?.[0]?.text ?? ""),
      ...segment?.[":@"],
    })
  );
  //console.log("formatted:", formattedCaptions?.[0]);
  return formattedCaptions;
};
