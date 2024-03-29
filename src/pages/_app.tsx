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
import { PagesProgressBar as ProgressBar } from "next-nprogress-bar";
import AlertDialogueProvider from "@/components/ui/dialogue/AlertDialogProvider";
import GeneralDialogueProvider from "@/components/ui/dialogue/GeneralDialogProvider";
import { useEffect, useState } from "react";
import RouteChangeLoader from "@/components/ui/loaders/RouteChangeLoader";
import { Roboto, Roboto_Mono } from "next/font/google";
import Footer from "@/components/Footer";
import { Analytics } from "@vercel/analytics/react";

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
          content="width=device-width, minimum-scale=1, initial-scale=1, maximum-scale=1, viewport-fit=cover"
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
                    <div className="m-0 flex min-h-screen flex-col">
                      <div className="flex-1">
                        {/* <RouteChangeLoader routeIsLoading={routeIsLoading} /> */}
                        <ProgressBar
                          height="3px"
                          color="#F71C0D"
                          options={{ showSpinner: false }}
                          shallowRouting
                        />
                        <Component {...pageProps} />
                      </div>
                      <Footer />
                    </div>
                  </>
                </GeneralDialogueProvider>
              </AlertDialogueProvider>
              {/* <ReactQueryDevtools initialIsOpen={false} /> */}
            </TooltipProvider>
          </SessionProvider>
        </CookiesProvider>
      </main>
      <Analytics />
    </>
  );
};

export default api.withTRPC(MyApp);
