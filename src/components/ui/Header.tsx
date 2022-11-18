import React, { useEffect, useState } from "react";
import Link from "next/link";
import Search from "../Search";
import Auth from "../Auth";

const Header = ({
  searchInitialValue = "",
}: {
  searchInitialValue?: string;
}) => {

  const [searchInitialText, setSearchInitialText] = useState(searchInitialValue)
  useEffect(() => {
    setSearchInitialText(searchInitialValue)
  }, [searchInitialValue])
  
  return (
    <header className="flex h-12 w-screen items-center">
      <Link href={"/"}>
        <a>Home</a>
      </Link>
      <div className="h-11 w-full max-w-6xl px-2 md:w-2/3 md:px-0">
        <Search initialValue={searchInitialText} />
      </div>
      <Auth/>
    </header>
  );
};

export default Header;
