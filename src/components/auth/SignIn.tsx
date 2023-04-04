import React from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { CiUser } from "react-icons/ci";
import { BiLogOut } from "react-icons/bi";
const SignIn = () => {
  const session = useSession();

  if (session.status === "unauthenticated") {
    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          signIn();
        }}
        className="sm:border-th-touchResponse/20 e flex flex-none items-center justify-center rounded-full sm:gap-x-2 sm:border sm:px-3 sm:py-2 sm:text-th-callToAction sm:hover:border-th-callToAction/5 sm:hover:bg-th-callToAction/20"
      >
        <div className="overflow-hidden rounded-full ring-1 ring-th-textPrimary sm:ring-th-callToAction">
          <CiUser className="h-5 w-5 flex-none translate-y-0.5 scale-110 sm:h-5 sm:w-5 " />
        </div>
        <span className="hidden font-semibold sm:block">Sign in</span>
      </button>
    );
  }

  if (session.status === "authenticated") {
    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          signOut();
        }}
        className="sm:border-th-touchResponse/20 e flex flex-none items-center justify-center rounded-full sm:gap-x-2 sm:border sm:px-3 sm:py-2 sm:text-th-callToAction sm:hover:border-th-callToAction/5 sm:hover:bg-th-callToAction/20"
      >
        <BiLogOut className="h-5 w-5 flex-none" />
        <span className="hidden font-semibold sm:block">Sign out</span>
      </button>
    );
  }

  return <div className=" skeleton-box h-8 w-8 rounded-full "></div>;
};

export default SignIn;
