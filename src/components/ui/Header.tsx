import React, { useEffect, useState } from "react";
import Link from "next/link";
import Search from "../Search";
import Auth from "../Auth";

const Header = ({
  searchInitialValue = "",
}: {
  searchInitialValue?: string;
}) => {
  const [searchInitialText, setSearchInitialText] =
    useState(searchInitialValue);
  useEffect(() => {
    setSearchInitialText(searchInitialValue);
  }, [searchInitialValue]);

  return (
    <>
      <header className="fixed top-0 z-50 flex h-12 w-screen items-center justify-between bg-th-baseBackground px-4 sm:h-14">
        <Link href={"/"}>
          <a>Home</a>
        </Link>
        <div className="h-10 w-full max-w-6xl px-2 md:w-2/3 md:px-0">
          <Search initialValue={searchInitialText} />
        </div>
        <Auth />
      </header>
      <div className="h-12 w-screen sm:h-14"></div>
    </>
  );
};

export default Header;
