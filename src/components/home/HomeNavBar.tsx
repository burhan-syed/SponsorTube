import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import HeaderAuth from "../auth/HeaderAuth";
import { cn } from "@/utils/cn";
import useGlobalStore from "@/store/useGlobalStore";
import HomeNav from "./HomeNav";
import HomeHeaderAuth from "../auth/HomeHeaderAuth";
import ThemeSwitcher from "../ui/ThemeSwitcher";

const HomeNavBar = ({noinvert}: {noinvert?:boolean}) => {
  const [invert, setInvert] = useState(true);
  const homeSearchTriggered = useGlobalStore(
    (store) => store.homeSearchTriggered
  );
  useEffect(() => {
    function convertRemToPixels(rem: number) {
      return (
        rem * parseFloat(getComputedStyle(document.documentElement).fontSize)
      );
    }
    let windowHeight = window.innerHeight;
    let windowWidth = window.innerWidth;
    let triggerY = convertRemToPixels(6.4);
    const onScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY > triggerY) {
        setInvert(false);
      } else {
        setInvert(true);
      }
    };
    const onResize = () => {
      windowHeight = window.innerHeight;
      windowWidth = window.innerWidth;
      // triggerY =
      //   windowWidth > 768
      //     ? windowHeight - 0.1 * windowWidth + convertRemToPixels(6.4)
      //     : 4 * windowWidth - 1.5 * windowWidth - 1 * windowWidth;
    };
    window.addEventListener("scroll", onScroll);
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <nav
      className={cn(
        "relative flex h-16 w-full items-center justify-center transition-colors duration-500 pointer-events-none pr-[var(--removed-body-scroll-bar-size)] ",
        (invert || homeSearchTriggered) && !noinvert
          ? " text-th-textPrimaryInverse sm:bg-transparent "
          : "text-th-textPrimary before:absolute before:h-[200%] before:w-full before:bg-gradient-to-b before:from-th-baseBackground before:via-transparent before:to-transparent  sm:backdrop-blur-none"
      )}
    >
      <div className="relative flex h-full w-full items-center justify-between px-4 md:px-[5vw] 2xl:max-w-[192rem]">
        <Link href={"/"} className="flex h-1/2 items-center gap-x-1 pointer-events-auto">
          <div className="aspect-square h-full">
            <Image
              src={"/SponsorTube.svg"}
              alt="logo"
              width={128}
              height={128}
              className=""
              sizes="100vw"
              style={{
                width: "100%",
                height: "auto",
                filter: `drop-shadow(1px 2px 2px #00000020)`,
              }}
            />
          </div>
          <span
            className="block text-lg font-semibold sm:text-2xl "
            style={{ textShadow: "1px 2px 2px #00000020" }}
          >
            SponsorTube
            <span className="pl-0.5 text-sm font-thin">beta</span>
          </span>
        </Link>

        <div className="items-center gap-x-6 sm:flex pointer-events-auto  ">
 
          <HomeNav invert={invert && !noinvert}/>

        </div>
      </div>
    </nav>
  );
};

export default HomeNavBar;
