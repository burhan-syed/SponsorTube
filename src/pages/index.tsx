import { useEffect, useState } from "react";
import Head from "next/head";
import Search from "../components/Search";
import type { NextPage } from "next";
import Auth from "@/components/Auth";

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
      <div className="flex min-h-screen flex-col items-center justify-center ">
        <div className="absolute top-0 right-0">
          <Auth/>
        </div>
        <div className="h-11 w-full max-w-6xl px-2 md:w-2/3 md:px-0">
          <Search />
        </div>
      </div>
      <div className="absolute top-0 -z-10 min-h-screen min-w-full bg-slate-300">
        <div
          className="fixed right-0 origin-top-right bg-gradient-to-br from-rose-800  to-red-700 transition-transform duration-300 ease-out"
          style={{
            top: `-40px`,
            transform: `rotate(${angle}deg) translate(0px,0px)`,
            width: `${width}px`,
            height: `${width}px`,
          }}
        >
          <div className="top-0 h-20 w-full bg-gradient-to-l from-slate-800 via-slate-700 to-slate-800"></div>
        </div>
      </div>
    </>
  );
};

export default Home;