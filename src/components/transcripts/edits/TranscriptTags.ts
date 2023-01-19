import { AnnotationTags } from "@prisma/client";
export const TAGCLASSES =
  "relative rounded [&>span]:absolute [&>span]:left-0 [&>span]:-translate-y-1/2 [&>span]:!ml-[4px] [&>span]:text-th-textPrimary [&>span]:uppercase ";
//  colors must be in hex
export const TAGS = new Map<AnnotationTags, string>([
  ["BRAND", "#B3F541"],
  ["PRODUCT", "#42f5f5"],
  ["OFFER", "#4b46cd"],
]);
