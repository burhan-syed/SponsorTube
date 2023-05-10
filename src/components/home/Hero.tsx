import React, { createRef, useEffect, useRef } from "react";
import ScrollInText from "../ui/ScrollInText";
import HomeSearch from "../search/HomeSearch";
const Hero = () => {
  const HeroText = ["Uncover the", "Brands Behind", "Video Sponsors"];
  const HeroTextTransitionDuration = 500;
  const HeroTextDelays = [200, 300, 400, 700, 800, 900];
  const SecondaryTextInitialDelay =
    (HeroTextDelays[HeroTextDelays.length - 1] ?? 0) +
    HeroTextTransitionDuration;
  const SecondaryTextDelays = [5];
  const SecondayTextDuration = [200];
  const SubHeroText = [
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  ];

  const searchContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const delay = SecondaryTextInitialDelay;
    const el = searchContainerRef.current;
    new Promise((res) =>
      setTimeout((r) => {
        if (el) {
          el.className =
            "flex w-full animate-in slide-in-from-bottom-10 transition-opacity sm:relative sm:order-1";
          el.style.opacity = "100%";
          // el.style.transform = "translate(0%,0%)";
        }
        res(r);
      }, delay)
    );
  }, []);
  return (
    <div className="flex w-full flex-grow flex-col sm:gap-y-[4vh] sm:pt-[10vh] md:pt-[8vh] lg:pt-[10vh] xl:pt-[12vh] 2xl:pt-[20vh]">
      <h1
        className="text-[calc(min(18vw,10rem))] font-semibold leading-[1] text-th-textPrimaryInverse sm:text-[10.6vw] md:text-[8vw] lg:text-[7.6vw] xl:text-[6.6vw] 2xl:text-[calc(min(5.5vw,12rem))]"
        style={{ textShadow: "1px 2px 2px #00000020" }}
      >
        <ScrollInText
          textLines={HeroText}
          duration={[500]}
          delay={HeroTextDelays}
          initialDelay={0}
        />
      </h1>
      <div className="mt-[8vw] flex flex-col gap-y-[3vh] sm:mt-0 sm:gap-y-[4vh] ">
        <h2
          className="px-1 text-[calc(min(4vw,2rem))] font-normal leading-[1.2] text-th-textPrimaryInverse sm:order-2 sm:text-[2.6vw] md:max-w-[60vw] md:text-[2vw] xl:text-[1.4vw] 2xl:text-[calc(min(1.5vw,2rem))]"
          style={{ textShadow: "1px 2px 2px #00000020" }}
        >
          <ScrollInText
            textLines={SubHeroText}
            initialDelay={SecondaryTextInitialDelay}
            delay={SecondaryTextDelays}
            duration={SecondayTextDuration}
          />
        </h2>
        <div
          ref={searchContainerRef}
          className="flex w-full opacity-0 transition-opacity ease-in-out sm:relative sm:order-1 "
        >
          <HomeSearch />
        </div>
      </div>
    </div>
  );
};

export default Hero;
