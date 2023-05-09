import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import HeaderAuth from "../auth/HeaderAuth";
import { cn } from "@/utils/cn";

const HomeNavBar = () => {
  const [invertText, setInvertText] = useState(true);
  const [blurBG, setBlurBG] = useState(false);
  useEffect(() => {
    function convertRemToPixels(rem: number) {
      return (
        rem * parseFloat(getComputedStyle(document.documentElement).fontSize)
      );
    }
    let windowHeight = window.innerHeight;
    let windowWidth = window.innerWidth;
    let triggerY =
      windowWidth > 768
        ? windowHeight -
          0.1 * windowWidth +
          convertRemToPixels(6.4)  //100vh - 10vw(home spacing) - 6.4rem(navbar height)
        : 4 * windowWidth - 1.5 * windowWidth - 1 * windowWidth;
    const onScroll = () => {
      console.log("s?", window.scrollY, windowHeight, windowWidth, triggerY);
      const scrollY = window.scrollY;
      if (scrollY > convertRemToPixels(6.4)) {
        setBlurBG(true);
      } else {
        setBlurBG(false);
      }
      if (scrollY > triggerY) {
        setInvertText(false);
      } else {
        setInvertText(true);
      }
    };
    const onResize = () => {
      windowHeight = window.innerHeight;
      windowWidth = window.innerWidth;
      triggerY =
        windowWidth > 768
          ? windowHeight -
            0.1 * windowWidth +
            convertRemToPixels(6.4) 
          : 4 * windowWidth - 1.5 * windowWidth - 1 * windowWidth;
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
        "relative flex h-16 w-full items-center justify-center bg-th-baseBackground/0  transition-colors duration-500",
        invertText ? "text-th-textPrimaryInverse" : "text-th-textPrimary",
        blurBG ? "backdrop-blur-sm" : "backdrop-blur-none"
      )}
    >
      <div className="relative flex h-full w-full items-center justify-between px-4 md:px-[calc(5vw)] 2xl:max-w-[192rem]">
        <Link href={"/"} className="flex h-1/2 items-center gap-x-1">
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
              }}
            />
          </div>
          <span className="block text-lg font-semibold sm:text-2xl ">
            SponsorTube
          </span>
        </Link>
        <HeaderAuth />
      </div>
    </nav>
  );
};

export default HomeNavBar;
