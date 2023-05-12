import { useEffect, useRef, useState } from "react";
import Head from "next/head";
import type { NextPage } from "next";
import HomeNavBar from "@/components/home/HomeNavBar";
import Hero from "@/components/home/Hero";
import HeroBG from "@/components/home/HeroBG";
import HomeSectionsContainer from "@/components/home/HomeSectionsContainer";
import ScrollComponent from "@/components/ui/ScrollComponent";

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

        <section className="mx-auto w-full px-4 pt-16 sm:items-center md:px-[calc(5vw)] 2xl:max-w-[192rem]">
          <div className="relative flex md:mx-[5vw] ">
            <Hero />
          </div>
        </section>
      </div>

      <div className="mt-[10vw]">
        <HomeSectionsContainer>
          <section className="mx-auto w-full p-[5vw] sm:items-center md:px-[calc(5vw)] 2xl:max-w-[192rem]">
            <div className="md:px-[5vw]">
              <section className="flex w-full flex-col items-start gap-y-[5vw] md:flex-row md:justify-between md:gap-x-[5vw] md:gap-y-0">
                <h2 className="text-h2">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit.{" "}
                </h2>
                <p className="text-p">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit.{" "}
                </p>
              </section>
              <ScrollComponent completeAt={0}>
                <h2 className="text-[10vw] font-bold text-th-textSecondary/20 inline">scrolling text</h2>
              </ScrollComponent>
              <p className="h-[300vh]">?</p>
            </div>
          </section>
        </HomeSectionsContainer>
      </div>
    </>
  );
};

export default Home;
