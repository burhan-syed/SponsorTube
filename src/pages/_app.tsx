// src/pages/_app.tsx
import "../styles/globals.css";
import { SessionProvider } from "next-auth/react";
import { CookiesProvider } from "react-cookie";
import type { Session } from "next-auth";
import type { AppType } from "next/app";
import { trpc } from "../utils/trpc";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useQueryClient } from '@tanstack/react-query'

import { TooltipProvider } from "@radix-ui/react-tooltip";
import Head from "next/head";
import SessionRequiredDialogueWrapper from "@/components/ui/dialogue/SessionRequiredDialogueWrapper";



const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const queryClient = useQueryClient({})
  queryClient.setDefaultOptions({
    queries: {
      staleTime: Infinity,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,

    }
  })

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover, user-scalable=0" //user-scalable="no"
        />
      </Head>
      <main>
        <CookiesProvider>
          <SessionProvider session={session}>
            <TooltipProvider>
              <SessionRequiredDialogueWrapper>
                <Component {...pageProps} />
              </SessionRequiredDialogueWrapper>
              <ReactQueryDevtools initialIsOpen={false} />
            </TooltipProvider>
          </SessionProvider>
        </CookiesProvider>
      </main>
    </>
  );
};

export default trpc.withTRPC(MyApp);
