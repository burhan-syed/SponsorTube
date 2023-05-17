import { useEffect, useRef, useState } from "react";
import Head from "next/head";
import type { GetServerSidePropsContext, NextPage } from "next";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { prisma } from "@/server/db";
import SuperJSON from "superjson";

import HomeNavBar from "@/components/home/HomeNavBar";
import Hero from "@/components/home/Hero";
import HeroBG from "@/components/home/HeroBG";
import HomeSectionsContainer from "@/components/home/HomeSectionsContainer";
import ScrollComponent from "@/components/ui/ScrollComponent";
import HomeRecentVods from "@/components/home/HomeRecentVods";
import { appRouter } from "@/server/api/router";
import { cn } from "@/utils/cn";
import { FaChevronRight } from "react-icons/fa";
import Link from "next/link";

const RecentVodsLimit = 5;

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>SponsorTube | Indexing Sponsors Across YouTube</title>
        <meta name="description" content="" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="fixed top-0 z-50 w-full ">
        <HomeNavBar />
      </div>

      <div className="relative">
        <HeroBG />
        <section className="mx-auto w-full px-4 pt-16 sm:items-center md:px-[5vw] 2xl:max-w-[192rem]">
          <div className="relative flex md:mx-[5vw] ">
            <Hero />
          </div>
        </section>
      </div>

      <div className="mt-[10vw]">
        <HomeSectionsContainer>
          <>
            <section className="mx-auto w-full p-[5vw] sm:items-center  2xl:max-w-[192rem]">
              <div className="md:px-[5vw]">
                <section className="flex w-full flex-col items-start gap-y-[5vw] md:flex-row md:justify-between md:gap-x-[5vw] md:gap-y-0">
                  <h2 className="text-h2">
                    We scan thousands of videos daily to automatically extract
                    sponsor information.
                  </h2>
                  <p className="text-p">
                    Brands, products, offers, and links are identified from
                    sponsored ad reads. Segments are community voted for
                    validity and corrected manually if necessary.
                  </p>
                </section>
              </div>
            </section>
            <section className="relative flex flex-col items-center">
              <div className="absolute top-0 mx-auto w-full max-w-full overflow-clip md:items-center md:px-[5vw] 2xl:max-w-[192rem] ">
                <div className="w-full lg:w-3/4  xl:w-2/3">
                  <ScrollComponent completeAt={0}>
                    <h2 className="text-h1 inline px-[5vw] font-bold text-th-textPrimary/10 ">
                      Latest Videos
                    </h2>
                  </ScrollComponent>
                  <div>
                    <Link
                      href="/recent"
                      className={
                        "text-h2  group absolute right-[10vw] top-0 flex items-center gap-x-2 font-semibold text-th-textPrimary "
                      }
                    >
                      <span className="text-p translate-x-0 transition-transform duration-500 ease-in-out group-hover:-translate-x-2">
                        View All
                      </span>
                      <div className="aspect-square h-full rounded-lg bg-th-textPrimary lg:rounded-2xl">
                        <FaChevronRight className=" p-1 text-th-textPrimaryInverse lg:p-2" />
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
              <div
                className={cn(
                  "mx-auto w-full px-[5vw] sm:items-center md:px-[calc(5vw)] 2xl:max-w-[192rem]",
                  "my-[calc(min(12vw,8rem))] sm:my-[7.4vw] md:my-[5.6vw] lg:my-[5.4vw] xl:my-[4.8vw] 2xl:my-[calc(min(4.1vw,8.8rem))]"
                )}
              >
                <div className="-mx-1 flex w-full flex-col sm:mx-0 md:px-[5vw]">
                  <HomeRecentVods limit={RecentVodsLimit} />
                </div>
              </div>
            </section>
          </>
        </HomeSectionsContainer>
      </div>
    </>
  );
};

export async function getServerSideProps(
  context: GetServerSidePropsContext<{}>
) {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, session: null },
    transformer: SuperJSON, // optional - adds superjson serialization
  });
  await helpers.video.getRecent.prefetchInfinite({
    limit: RecentVodsLimit,
    withSponsors: true,
  });
  context.res.setHeader(
    "Cache-Control",
    "public, s-maxage=3600, stale-while-revalidate=59"
  );
  return {
    props: {
      trpcState: helpers.dehydrate(),
    },
  };
}

export default Home;
