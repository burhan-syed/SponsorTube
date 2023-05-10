import { useSession } from "next-auth/react";
import React from "react";
import SignIn from "./SignIn";
import Avatar from "./Avatar";

const HomeHeaderAuth = () => {
  const session = useSession();

  if (session.status === "unauthenticated") {
    return (
      <div className="h-10 w-10 skeleton-box rounded-full"></div>
    )
  }

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

export default HomeHeaderAuth;
