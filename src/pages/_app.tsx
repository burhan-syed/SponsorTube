// src/pages/_app.tsx
import "../styles/globals.css";
import { SessionProvider } from "next-auth/react";
import { CookiesProvider } from "react-cookie";
import type { Session } from "next-auth";
import type { AppType } from "next/app";
import { trpc } from "../utils/trpc";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { TooltipProvider } from "@radix-ui/react-tooltip";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <CookiesProvider>
      <SessionProvider session={session}>
        <TooltipProvider>
          <Component {...pageProps} />
          <ReactQueryDevtools initialIsOpen={false} />
        </TooltipProvider>
      </SessionProvider>
    </CookiesProvider>
  );
};

export default trpc.withTRPC(MyApp);
