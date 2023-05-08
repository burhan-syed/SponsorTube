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
          el.className = "animate-in slide-in-from-bottom-10 ";
          el.style.opacity = "100%";
          // el.style.transform = "translate(0%,0%)";
        }
        res(r);
      }, delay)
    );
  }, []);
  return (
    <div className="flex w-full flex-grow flex-col pb-10">
      <h1 className="text-[18vw] font-semibold leading-[1] sm:text-[10.6vw]">
        <ScrollInText
          textLines={HeroText}
          duration={[500]}
          delay={HeroTextDelays}
          initialDelay={0}
        />
      </h1>
      <div className="mt-[8vw] flex flex-col gap-y-[3vh] ">
        <h2 className=" px-1 text-[4vw] font-normal leading-[1.2] text-th-textSecondary sm:text-[2vw]">
          <ScrollInText
            textLines={SubHeroText}
            initialDelay={SecondaryTextInitialDelay}
            delay={SecondaryTextDelays}
            duration={SecondayTextDuration}
          />
        </h2>
        <div
          ref={searchContainerRef}
          className="flex w-full opacity-0 transition-opacity duration-1000 ease-in-out"
        >
          <HomeSearch />
        </div>
      </div>
    </div>
  );
};

export default Hero;
