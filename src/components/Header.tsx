import React, { useEffect, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Button } from "./ui/common/Button";
import { TfiSearch, TfiArrowLeft } from "react-icons/tfi";
import HeaderAuth from "./auth/HeaderAuth";
import Image from "next/image";
import NavBarSearch from "./search/NavBarSearch";

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
        className={clsx(
          "fixed top-0 z-50 flex h-12 w-full items-center justify-between gap-2 bg-th-baseBackground sm:h-14 ",
          showSearch ? "px-2 pr-[calc(0.8rem+var(--removed-body-scroll-bar-size))] " : "px-4 pr-[calc(1.6rem+var(--removed-body-scroll-bar-size))] "
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
            <span className="hidden font-semibold sm:block ">SponsorTube</span>
          </Link>
        )}
        {!showSearch && !searchInitialValue && (
          <div className="mx-auto sm:hidden"></div>
        )}
        <div
          className={clsx(
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
      </header>
      <div className="h-12 w-full sm:h-14"></div>
    </>
  );
};

export default Header;
