// src/server/trpc/router/index.ts
import { router } from "../trpc";
import { exampleRouter } from "./example";
import { authRouter } from "./auth";
import { videoRouter } from "./video";
import { searchRouter } from "./search";
export const appRouter = router({
  example: exampleRouter,
  auth: authRouter,
  video: videoRouter,
  search: searchRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
