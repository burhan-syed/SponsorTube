import React, { useEffect, useRef } from "react";
import SlideUpText from "../ui/animation/SlideUpText";
import HomeSearch from "../search/HomeSearch";
const Hero = () => {
  const HeroText = ["Uncover the", "brands behind", "video sponsors."];
  const HeroTextTransitionDuration = 500;
  const HeroTextDelays = [200, 300, 400, 800, 850, 900];
  const SecondaryTextInitialDelay =
    (HeroTextDelays[HeroTextDelays.length - 1] ?? 0) +
    HeroTextTransitionDuration;
  const SecondaryTextDelays = [5];
  const SecondayTextDuration = [200];
  const SubHeroText = [
    "SponsorTube empowers you to effortlessly analyze the latest brands sponsoring videos and channels on YouTube. Lookup any channel or video to get started.",
  ];

  const searchContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const delay = SecondaryTextInitialDelay;
    const el = searchContainerRef.current;
    new Promise((res) =>
      setTimeout((r) => {
        if (el) {
          el.className =
            "flex w-full animate-in slide-in-from-bottom-10 transition-opacity duration-200 sm:relative sm:order-1";
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
        className="text-h1 font-semibold text-th-textPrimaryInverse"
        style={{ textShadow: "1px 2px 2px #00000020" }}
      >
        <SlideUpText
          textLines={HeroText}
          duration={[500]}
          delay={HeroTextDelays}
          initialDelay={0}
        />
      </h1>
      <div className="mt-[8vw] flex flex-col gap-y-[3vh] sm:mt-0 sm:gap-y-[4vh] ">
        <h2
          className="px-1 text-p font-normal leading-[1.2] text-th-textPrimaryInverse sm:order-2 md:max-w-[50vw] "
          style={{ textShadow: "1px 2px 2px #00000020" }}
        >
          <SlideUpText
            textLines={SubHeroText}
            initialDelay={SecondaryTextInitialDelay}
            delay={SecondaryTextDelays}
            duration={SecondayTextDuration}
          />
        </h2>
        <div
          ref={searchContainerRef}
          className="flex w-full opacity-0 transition-opacity duration-200 ease-in-out sm:relative sm:order-1 "
        >
          <HomeSearch />
        </div>
      </div>
    </div>
  );
};

export default Hero;
