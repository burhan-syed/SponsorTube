import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "./ui/common/Button";
import { TfiSearch, TfiArrowLeft } from "react-icons/tfi";
import HeaderAuth from "./auth/HeaderAuth";
import Image from "next/image";
import NavBarSearch from "./search/NavBarSearch";
import { cn } from "@/utils/cn";

const Header = ({
  searchInitialValue = "",
}: {
  searchInitialValue?: string;
}) => {
  const [searchInitialText, setSearchInitialText] =
    useState(searchInitialValue);
  const [showSearch, setShowSearch] = useState(false);
  useEffect(() => {
    setSearchInitialText(searchInitialValue);
  }, [searchInitialValue]);

  return (
    <>
      <header
        className={
          "fixed top-0 z-50 flex h-12 sm:h-14 w-full items-center justify-center bg-th-baseBackground"
        }
      >
        <nav
          className={cn(
            "relative flex h-full w-full items-center justify-between gap-2 2xl:max-w-[192rem] ",
            showSearch
              ? "px-2 pr-[calc(0.8rem+var(--removed-body-scroll-bar-size))]  "
              : "px-2 pr-[calc(0.8rem+var(--removed-body-scroll-bar-size))] md:mx-[5vw] md:px-4  md:pr-[calc(1.6rem+var(--removed-body-scroll-bar-size))] "
          )}
        >
          {showSearch ? (
            <Button
              round={true}
              variant={"transparent"}
              size={"medium"}
              onClick={() => setShowSearch(false)}
              className="flex-none"
            >
              <TfiArrowLeft className=" h-4 w-4 flex-none" />
            </Button>
          ) : (
            <Link href={"/"} className="flex h-1/2 items-center gap-x-1">
              <div className="aspect-square h-full">
                <Image
                  src={"/android-chrome-192x192.png"}
                  alt="logo"
                  width={192}
                  height={192}
                  className=""
                  sizes="100vw"
                  style={{
                    width: "100%",
                    height: "auto",
                  }}
                />
              </div>
              <span
                className={cn(
                  "font-semibold",
                  searchInitialText ? "hidden sm:block" : "block"
                )}
              >
                SponsorTube<span className="text-xxs font-thin pl-0.5">beta</span>
              </span>
            </Link>
          )}
          {!showSearch && !searchInitialValue && (
            <div className="mx-auto sm:hidden"></div>
          )}
          <div
            className={cn(
              "h-8 w-full sm:h-10 sm:max-w-6xl sm:px-2 md:w-2/3 md:px-0 ",
              showSearch ? "" : "hidden sm:block"
            )}
          >
            <NavBarSearch
              initialValue={searchInitialText}
              autoFocus={showSearch}
              setAutoFocus={setShowSearch}
            />
          </div>
          {!showSearch && (
            <>
              {searchInitialValue ? (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setShowSearch(true);
                  }}
                  className="flex h-8 flex-grow items-center justify-start rounded-lg bg-th-additiveBackground/5 px-2 pl-3 sm:hidden"
                >
                  {searchInitialText}
                </button>
              ) : (
                <Button
                  round={true}
                  variant={"transparent"}
                  className="flex-none sm:hidden"
                  onClick={() => setShowSearch(true)}
                >
                  <TfiSearch className=" h-4 w-4 flex-none" />
                </Button>
              )}
            </>
          )}
          {!showSearch && <HeaderAuth />}
        </nav>
      </header>
      <div className="h-12 w-full sm:h-14"></div>
    </>
  );
};

export default Header;
