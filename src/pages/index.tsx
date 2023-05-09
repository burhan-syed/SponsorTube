import { useEffect, useState } from "react";
import Head from "next/head";
import HomeSearch from "@/components/search/HomeSearch";
import type { NextPage } from "next";
import HomeNavBar from "@/components/home/HomeNavBar";
import Hero from "@/components/home/Hero";
import GradientBG from "@/components/ui/GradientBG";
import HomeDivider from "@/components/home/HomeDivider";

const Home: NextPage = () => {
  //const hello = trpc.example.hello.useQuery({ text: "from tRPC" });
  const [angle, setAngle] = useState(-45);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const calcs = (v: number, w: number) => {
      const h = Math.sqrt(Math.pow(v, 2) + Math.pow(w, 2));
      let a = -45;
      if (v >= w) {
        a = Math.asin(w / h) * (180 / Math.PI);
      } else {
        const s = Math.asin(v / h) * (180 / Math.PI);
        a = 180 - 90 - s;
      }
      return { hypotenuse: h, angle: -a };
    };
    const setCalcs = () => {
      const { hypotenuse, angle } = calcs(
        window.innerWidth + 40,
        window.innerHeight + 40
      );
      setWidth(hypotenuse);
      setAngle(angle);
    };
    setCalcs();
    const onResize = () => {
      setCalcs();
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="fixed top-0 z-50 w-full ">
        <HomeNavBar />
      </div>
      <GradientBG />
      <div className="">
        <section className="mx-auto h-[calc(100%-6.4rem)] w-full px-4 pt-16 sm:items-center md:px-[calc(5vw)] 2xl:max-w-[192rem]">
          <div className="relative flex ">
            <Hero />
          </div>
        </section>
        <div className="mt-[10vw] md:w-full">
          <HomeDivider delay={1500} />
          <div className="h-[300vh] bg-th-baseBackground backdrop-blur-lg">
            <section className="mx-auto w-full px-4 pt-16 sm:items-center md:px-[calc(5vw)] 2xl:max-w-[192rem]">
              some more text
            </section>
          </div>
        </div>
      </div>

      {/* <div className="absolute top-0 -z-10 min-h-screen min-w-full bg-slate-300"> */}
      {/* <div
          className="fixed right-0 origin-top-right bg-gradient-to-br from-rose-800  to-red-700 transition-transform duration-300 ease-out"
          style={{
            top: `-40px`,
            transform: `rotate(${angle}deg) translate(0px,0px)`,
            width: `${width}px`,
            height: `${width}px`,
          }}
        >
          <div className="top-0 h-20 w-full bg-gradient-to-l from-slate-800 via-slate-700 to-slate-800"></div>
        </div> */}
      {/* </div> */}
    </>
  );
};

export default Home;
