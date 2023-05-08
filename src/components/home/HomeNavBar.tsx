import Image from "next/image";
import Link from "next/link";
import React from "react";
import HeaderAuth from "../auth/HeaderAuth";

const HomeNavBar = () => {
  return (
    <nav className="relative flex h-16 w-full items-center justify-center bg-th-baseBackground/90 backdrop-blur-sm">
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
          <span className="sm:text-2xl text-lg font-semibold block ">
            SponsorTube
          </span>
        </Link>
        <HeaderAuth />
      </div>
    </nav>
  );
};

export default HomeNavBar;
