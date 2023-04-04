import { useSession } from "next-auth/react";
import React from "react";
import SignIn from "./SignIn";
import Avatar from "./Avatar";

const HeaderAuth = () => {
  const session = useSession();

  if (session.status === "authenticated") {
    return (
      <Avatar
        img={session.data.user.image ?? undefined}
        user={session.data.user.name ?? undefined}
      />
    );
  }

  return <SignIn />;
};

export default HeaderAuth;
