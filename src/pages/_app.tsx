// src/pages/_app.tsx
import "@/styles/globals.css";
import { SessionProvider } from "next-auth/react";
import { CookiesProvider } from "react-cookie";
import type { Session } from "next-auth";
import type { AppType } from "next/app";
import Router from "next/router";
import { api } from "@/utils/api";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useQueryClient } from "@tanstack/react-query";

import { TooltipProvider } from "@radix-ui/react-tooltip";
import Head from "next/head";
import AlertDialogueProvider from "@/components/ui/dialogue/AlertDialogProvider";
import GeneralDialogueProvider from "@/components/ui/dialogue/GeneralDialogProvider";
import { useEffect, useState } from "react";
import RouteChangeLoader from "@/components/ui/loaders/RouteChangeLoader";
import { Roboto, Roboto_Mono } from "next/font/google";
import Footer from "@/components/Footer";

const roboto = Roboto({
  weight: ["100", "300", "400", "500", "700", "900"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
});

const roboto_mono = Roboto_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto-mono",
});

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const queryClient = useQueryClient({});
  queryClient.setDefaultOptions({
    queries: {
      staleTime: Infinity,
      cacheTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    },
  });

  const [routeIsLoading, setRouteIsLoading] = useState(false);
  useEffect(() => {
    Router.events.on("routeChangeStart", (url) => {
      setRouteIsLoading(true);
    });
    Router.events.on("routeChangeComplete", (url) => {
      setRouteIsLoading(false);
    });

    Router.events.on("routeChangeError", (url) => {
      setRouteIsLoading(false);
    });
  }, [Router]);

  return (
    <>
      <style jsx global>
        {`
          :root {
            --font-roboto: ${roboto.style.fontFamily};
            --font-roboto-mono: ${roboto_mono.style.fontFamily};
          }
        `}
      </style>
      <Head>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover, user-scalable=1" //user-scalable="no"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={"h-full w-full"}>
        <CookiesProvider>
          <SessionProvider session={session}>
            <TooltipProvider>
              <AlertDialogueProvider>
                <GeneralDialogueProvider>
                  <>
                    <RouteChangeLoader routeIsLoading={routeIsLoading} />
                    <Component {...pageProps} />
                    <Footer />
                  </>
                </GeneralDialogueProvider>
              </AlertDialogueProvider>
              {/* <ReactQueryDevtools initialIsOpen={false} /> */}
            </TooltipProvider>
          </SessionProvider>
        </CookiesProvider>
      </main>
    </>
  );
};

export default api.withTRPC(MyApp);
