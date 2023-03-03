import crypto from "crypto";

const cleanString = (data: string) => data.replace(/[\r\n]/gm, "");

export const md5 = (data: string) =>
  crypto.createHash("md5").update(cleanString(data)).digest("hex");
