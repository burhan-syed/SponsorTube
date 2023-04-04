import Image from "next/image";
import React from "react";
import Dropdown from "@/components/ui/common/Dropdown";
import { signOut } from "next-auth/react";
import { BiLogOut } from "react-icons/bi";

const Avatar = ({ img, user }: { img?: string; user?: string }) => {
  const initials = user
    ? user?.split(" ")?.length >= 2
      ? `${user?.split(" ")?.[0]?.[0] ?? "?"}${
          user?.split(" ")?.[1]?.[0] ?? "?"
        }`
      : user.substring(0, 2)
    : "??";
  return (
    <div className="h-8 w-8 flex-none">
      <Dropdown
        modal={false}
        MenuItems={[
          <button
            className="flex items-center justify-between px-4 md:justify-start md:gap-2 md:px-4"
            key="sign out"
            onClick={() => signOut()}
          >
            <BiLogOut className="h-5 w-5 flex-none" />
            <span>Sign out</span>
          </button>,
        ]}
      >
        <div className="relative h-8 w-8 flex-none overflow-hidden rounded-full">
          {img && (
            <>
              <Image
                src={img}
                layout="fill"
                unoptimized
                alt={initials}
                className="z-10"
              />
            </>
          )}
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none">
            {initials}
          </span>
        </div>
      </Dropdown>
    </div>
  );
};

export default Avatar;
