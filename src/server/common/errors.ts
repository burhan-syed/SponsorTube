import { z } from "zod";
// flags for frontend handling
const CustomErrorTypesSchema = z
  .union([z.literal("BOT_PENDING"), z.literal("BOT_ERROR")])
  .optional();
type CustomErrorTypes = z.infer<typeof CustomErrorTypesSchema>; //"BOT_PENDING" | "BOT_ERROR" | "";
// flags for processqueue error status
const CustomErrorLevelsSchema = z
  .union([z.literal("COMPLETE"), z.literal("PARTIAL")])
  .optional();
type CustomErrorLevels = z.infer<typeof CustomErrorLevelsSchema>; //"COMPLETE" | "PARTIAL" | "";

type CustomErrorType = {
  fromstring?: string;
  message?: string;
  type?: CustomErrorTypes;
  level?: CustomErrorLevels;
  expose?: boolean;
};

export class CustomError extends Error {
  expose: boolean;
  type: CustomErrorTypes;
  level: CustomErrorLevels;
  constructor({ fromstring, message, type, expose, level }: CustomErrorType) {
    let sMessage = message;
    let sType = type;
    let sLevel = level;
    if (fromstring) {
      const split = fromstring.split("|");
      sMessage = split?.[0]?.split("message:")?.[1];
      const rawType = CustomErrorTypesSchema.safeParse(
        split?.[1]?.split("type:")?.[1]
      );
      sType = rawType.success ? rawType.data : undefined;
      const rawLevel = CustomErrorLevelsSchema.safeParse(
        split?.[2]?.split("level:")?.[1]
      );
      sLevel = rawLevel.success ? rawLevel.data : undefined;
    }
    super(sMessage);
    // assign the error class name in your custom error (as a shortcut)
    this.name = "CustomError"; //this.constructor.name;
    // capturing the stack trace keeps the reference to your error class
    Error.captureStackTrace(this, this.constructor);

    this.type = sType;
    this.level = sLevel;
    this.expose = !!expose;
  }
  toString() {
    return `message:${this.message}|type:${this.type}|level:${this.level}`;
  }
}
