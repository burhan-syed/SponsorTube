import React from "react";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

const Auth = () => {
  const { data: session } = useSession();
  return (
    <div>
      {!session ? (
        <>
          <button
            onClick={(e) => {
              e.preventDefault();
              signIn();
            }}
          >
            <span className="">Login</span>
          </button>
        </>
      ) : (
        <>
          <button
            onClick={(e) => {
              e.preventDefault();
              signOut();
            }}
          >
            <span className="">Logout</span>
          </button>
        </>
      )}
    </div>
  );
};

export default Auth;
