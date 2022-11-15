// src/server/trpc/router/index.ts
import { router } from "../trpc";
import { exampleRouter } from "./example";
import { authRouter } from "./auth";
import { videoRouter } from "./video";
import { searchRouter } from "./search";
import { channelRouter } from "./channel";
export const appRouter = router({
  example: exampleRouter,
  auth: authRouter,
  video: videoRouter,
  search: searchRouter,
  channel: channelRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
