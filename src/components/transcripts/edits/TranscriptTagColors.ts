import { AnnotationTags } from "@prisma/client";

const TAGS = new Map<AnnotationTags, string>([
  ["BRAND", "rgb(179, 245, 66)"],
  ["PRODUCT", "#42f5f5"],
  ["OFFER", "#4b46cd"],
]);

export default TAGS