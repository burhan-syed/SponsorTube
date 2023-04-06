import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/common/Button";
import { TAGS } from "@/components/transcripts/edits/TranscriptTags";
import TouchResponse from "@/components/ui/common/TouchResponse";
import useIsPressed from "@/hooks/useIsPressed";
import { BiChevronDown } from "react-icons/bi";
import clsx from "clsx";

const ChannelSponsorsPills = ({ sponsors }: { sponsors: string[] }) => {
  const { containerRef, isPressed } = useIsPressed();
  const { containerRef: containerRef2, isPressed: isPressed2 } = useIsPressed();
  const initSponsorsLength = useRef<number>(sponsors.length);
  const [showExpand, setShowExpand] = useState<boolean>();
  const [expand, setExpand] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [atBottom, setAtBottom] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);
  useLayoutEffect(() => {
    if (
      sponsors.length > initSponsorsLength.current &&
      listRef?.current?.scrollTop !== undefined &&
      listRef.current.scrollHeight
    ) {
      listRef.current.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: "smooth",
      });
    }

    const checkShowExpand = () => {
      if (
        (listRef?.current?.scrollHeight ?? 0) >
        (listRef.current?.clientHeight ?? 0)
      ) {
        setShowExpand(true);
      } else {
        setShowExpand(false);
      }
    };
    checkShowExpand();
    window.addEventListener("resize", checkShowExpand);
    return () => {
      window.removeEventListener("resize", checkShowExpand);
    };
  }, [sponsors]);
  useEffect(() => {
    const el = listRef.current;
    if (el) {
      const onScroll = (e: Event) => {
        //console.log(el.clientHeight, el.scrollTop, el.scrollHeight);
        if (el.scrollTop > 0) {
          setScrolled(true);
        } else {
          setScrolled(false);
        }
        if (el.scrollTop + el.clientHeight === el.scrollHeight) {
          setAtBottom(true);
        } else {
          setAtBottom(false);
        }
      };
      el.addEventListener("scroll", onScroll);
      window.addEventListener("resize", onScroll);
      return () => {
        el.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      };
    }
  }, []);

  return (
    <div
      className={clsx(
        "rounded-3xl ring-1 ring-th-chipBackground ",
        expand && showExpand && ""
      )}
    >
      <button
        ref={containerRef2}
        disabled={!showExpand}
        className={clsx(
          "relative flex h-10 w-full items-center justify-center rounded-t-3xl bg-th-chipBackground ",
          showExpand && "hover:bg-th-chipBackgroundHover"
        )}
        onClick={() =>
          showExpand &&
          setExpand((e) => {
            if (e) {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
            return !e;
          })
        }
      >
        <h2 className="text-base">Recent Sponsors</h2>
        <TouchResponse
          variant="ring"
          className={"rounded-t-3xl"}
          isPressed={isPressed2 && !!showExpand}
        />
      </button>

      <div className={"relative"}>
        <ul
          ref={listRef}
          className={clsx(
            "flex flex-row flex-wrap items-center justify-center gap-x-2 gap-y-1 py-2 transition-all  duration-200 ease-in-out md:px-1 ",
            " before:pointer-events-none  before:absolute before:top-[100px] before:z-20 before:h-[100px] before:w-full before:bg-gradient-to-t  before:from-th-baseBackground before:via-transparent  before:to-transparent after:pointer-events-none  after:absolute after:top-0 after:z-10 after:h-[100px] after:w-full after:bg-gradient-to-b after:from-th-baseBackground after:via-transparent after:to-transparent after:transition-opacity after:ease-in",
            expand
              ? "max-h-[100vh] overflow-y-auto"
              : "max-h-[200px] overflow-y-scroll",
            expand || atBottom || !showExpand
              ? `before:opacity-0 ${
                  atBottom ? " before:transition-opacity before:ease-in" : ""
                }`
              : ` before:opacity-100 before:transition-opacity before:ease-in  `,
            scrolled && !expand ? "after:opacity-100" : "after:opacity-0"
          )}
        >
          {sponsors.map((s) => (
            <li key={s}>
              <Button
                onClick={() => console.log(s)}
                variant={"primary"}
                size={"small"}
                className=""
              >
                <div className={"z-10 flex items-center"}>
                  <span className="">{s}</span>
                </div>

                <div
                  className="absolute h-full w-full rounded-full backdrop-blur-md"
                  style={{ backgroundColor: `${TAGS.get("BRAND")}90` }}
                ></div>
              </Button>
            </li>
          ))}
        </ul>
        {showExpand && (
          <button
            ref={containerRef}
            className="relative flex h-10 w-full items-center justify-center rounded-b-3xl bg-th-chipBackground hover:bg-th-chipBackgroundHover  "
            onClick={() =>
              setExpand((e) => {
                if (e) {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
                return !e;
              })
            }
          >
            <BiChevronDown
              className={clsx(
                expand ? "rotate-180" : "",
                "h-6 w-6 flex-none transition-transform ease-in-out"
              )}
            />
            <TouchResponse
              variant="ring"
              className={"rounded-b-3xl"}
              isPressed={isPressed}
            />
          </button>
        )}
      </div>
    </div>
  );
};

export default ChannelSponsorsPills;
