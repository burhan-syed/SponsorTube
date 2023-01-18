import { AnnotationTags } from "@prisma/client";
export const TAGCLASSES =
  "relative [&>span]:absolute [&>span]:left-0 [&>span]:-translate-y-1/2 [&>span]:!ml-[4px]";
//  colors must be in hex
export const TAGS = new Map<AnnotationTags, string>([
  ["BRAND", "#B3F541"],
  ["PRODUCT", "#42f5f5"],
  ["OFFER", "#4b46cd"],
]);
