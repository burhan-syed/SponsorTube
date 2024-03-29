import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { getProviders, signIn } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/server/auth";
import { Button } from "@/components/ui/common/Button";
import { BsGithub } from "react-icons/bs";
import HeroBG from "@/components/home/HeroBG";
import Link from "next/link";
import Image from "next/image";
import ScrollTextHeader from "@/components/ui/animation/ScrollTextHeader";
export default function SignIn({
  providers,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <div className="flex min-h-screen flex-1 flex-grow flex-col items-stretch">
        <div className="flex h-full flex-grow">
          <section className="flex h-full w-full flex-1 flex-col">
            <div className="flex h-full w-full flex-col items-center justify-center gap-16 p-10  sm:mb-24">
              <div className="flex flex-col items-center">
                <Link
                  href={"/"}
                  className="pointer-events-auto flex items-center gap-x-1"
                  aria-label="SponsorTube Home"
                >
                  <div className="aspect-square h-12">
                    <Image
                      src={"/android-chrome-192x192.png"}
                      alt="logo"
                      width={192}
                      height={192}
                      className=""
                      sizes="100vw"
                      style={{
                        width: "100%",
                        height: "auto",
                        filter: `drop-shadow(1px 2px 2px #00000020)`,
                      }}
                    />
                  </div>
                </Link>
                <h1
                  className={"text-h1 inline font-bold text-th-textPrimary/80"}
                >
                  Sign In
                </h1>
              </div>

              {Object.values(providers).map((provider) => (
                <div key={provider.name} className="w-full">
                  <Button
                    onClick={() => signIn(provider.id)}
                    className="w-full"
                  >
                    {provider.name === "GitHub" ? (
                      <div className="flex items-center gap-x-2 font-semibold">
                        <BsGithub className="h-4 w-4 flex-none" />
                        <span>Continue with {provider.name}</span>
                      </div>
                    ) : (
                      `Sign in with ${provider.name}`
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </section>
          <section className="bg-secondary pointer-events-none relative hidden flex-1 select-none overflow-hidden md:flex">
            <div className="h-full w-full">
              <HeroBG />
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions);

  // If the user is already logged in, redirect.
  // Note: Make sure not to redirect to the same page
  // To avoid an infinite loop!
  if (session) {
    return { redirect: { destination: "/" } };
  }

  const providers = await getProviders();

  return {
    props: { providers: providers ?? [] },
  };
}
