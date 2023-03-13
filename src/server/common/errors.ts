// flags for frontend handling
type CustomErrorTypes = "BOT_PENDING" | "BOT_ERROR" | "";
// flags for processqueue error status
type CustomErrorLevels = "COMPLETE" | "PARTIAL" | "";

type CustomErrorType = {
  message: string;
  type?: CustomErrorTypes;
  level?: CustomErrorLevels;
  expose?: boolean;
};

export class CustomError extends Error {
  expose: boolean;
  type: CustomErrorTypes;
  level: CustomErrorLevels;
  constructor({ message, type, expose, level }: CustomErrorType) {
    super(message);
    // assign the error class name in your custom error (as a shortcut)
    this.name = "CustomError"; //this.constructor.name;
    // capturing the stack trace keeps the reference to your error class
    Error.captureStackTrace(this, this.constructor);

    this.type = type ?? "";
    this.level = level ?? "";
    this.expose = !!expose;
  }
}
