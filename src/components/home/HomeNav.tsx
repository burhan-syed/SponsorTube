import React, { useEffect } from "react";
import Dropdown from "../ui/common/Dropdown";
import { BiLogIn, BiLogOut, BiMenu, BiX } from "react-icons/bi";
import { MdVideoLabel } from "react-icons/md";
import { BsFillQuestionCircleFill } from "react-icons/bs";
import { signIn, signOut, useSession } from "next-auth/react";
import useGlobalStore from "@/store/useGlobalStore";
import useIsMobileWindow from "@/hooks/useIsMobileWindow";
import Link from "next/link";

const DropdownButton = ({
  isopen,
  invert,
}: {
  isopen?: boolean;
  invert?: boolean;
}) => {
  const homeSearchTriggered = useGlobalStore(
    (store) => store.homeSearchTriggered
  );
  const isMobile = useIsMobileWindow();
  return (
    <div className="relative flex h-8 w-8 flex-none items-center justify-center overflow-hidden md:h-10 md:w-10">
      {isopen && isMobile ? (
        <BiX className="h-6 w-6 flex-none text-th-textPrimaryInverse" />
      ) : (
        <BiMenu
          className={
            "h-6 w-6 flex-none " +
            (invert
              ? "text-th-PrimaryInverse sm:text-th-textPrimary"
              : homeSearchTriggered
              ? "text-th-textPrimaryInverse"
              : "text-th-textPrimary")
          }
          style={{ filter: `drop-shadow(1px 2px 2px #00000020)` }}
        />
      )}
    </div>
  );
};

const HomeNav = ({ invert }: { invert?: boolean }) => {
  const isMobile = useIsMobileWindow();
  const session = useSession();
  return (
    <div
      className={
        "flex h-8 w-8 flex-none items-center justify-center rounded-full md:h-10 md:w-10"
      }
    >
      <Dropdown
        modal={isMobile}
        menuOptions={{
          sideOffset: 10,
          align: "end",
        }}
        MenuItems={[
          <button
            className={
              (session.status === "loading" ? "skeleton-box " : "") +
              "flex items-center justify-between px-4 md:justify-start md:gap-2 md:px-4"
            }
            key={
              session.status === "authenticated"
                ? "sign out"
                : session.status === "unauthenticated"
                ? "sign in"
                : ""
            }
            onClick={() => {
              session.status === "unauthenticated"
                ? signIn()
                : session.status === "authenticated" && signOut();
            }}
          >
            {session.status === "authenticated" && (
              <BiLogOut className="h-5 w-5 flex-none" />
            )}
            {session.status === "unauthenticated" && (
              <BiLogIn className="h-5 w-5 flex-none" />
            )}
            <span>
              {session.status === "authenticated"
                ? "Sign out"
                : session.status === "unauthenticated"
                ? "Sign in"
                : ""}
            </span>
          </button>,
          <Link
            href={"/recent"}
            key={"recents link"}
            className="flex items-center justify-between px-4 md:justify-start md:gap-2 md:px-4"
          >
            <MdVideoLabel className="h-5 w-5 flex-none" />
            Recent Videos
          </Link>,
          <Link
            href={"/faqs"}
            key={"faqs link"}
            className="flex items-center justify-between px-4 md:justify-start md:gap-2 md:px-4"
          >
            <BsFillQuestionCircleFill className="h-5 w-5 flex-none" />
            FAQs
          </Link>,
        ]}
      >
        <DropdownButton invert={invert} />
      </Dropdown>
    </div>
  );
};

export default HomeNav;
