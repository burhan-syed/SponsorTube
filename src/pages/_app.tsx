// src/pages/_app.tsx
import "../styles/globals.css";
import { SessionProvider } from "next-auth/react";
import { CookiesProvider } from "react-cookie";
import type { Session } from "next-auth";
import type { AppType } from "next/app";
import { trpc } from "../utils/trpc";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <CookiesProvider>
      <SessionProvider session={session}>
        <Component {...pageProps} />
        <ReactQueryDevtools initialIsOpen={false} />
      </SessionProvider>
    </CookiesProvider>
  );
};

export default trpc.withTRPC(MyApp);
