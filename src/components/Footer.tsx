import Link from "next/link";
import React from "react";

const links: { href: string; display: string }[] = [
  {
    href: "/about",
    display: "About",
  },
  { href: "/faqs", display: "FAQs" },
  { href: "/recent", display: "Recents" },
];
const Footer = () => {
  return (
    <footer className="relative w-full border-t border-th-additiveBackground/5 bg-th-generalBackgroundA  ">
      <div className="mx-auto flex h-full w-full flex-row flex-wrap items-center justify-between px-4 py-2 md:px-[5vw] 2xl:max-w-[192rem]">
        <ul className="flex flex-wrap items-center gap-x-6 py-2">
          {links.map((link) => (
            <li key={link.display}>
              <Link href={link.href} className="hover:underline">
                {link.display}
              </Link>
            </li>
          ))}
        </ul>

        <div className="inline-flex flex-wrap gap-x-6 font-light text-th-textSecondary ">
          <span className="">
            {`Copyright 2023. `}
            <Link href={"/"}>SponsorTube</Link>
            {` ©`}
          </span>
          <span>
            SponsorTube makes use of SponsorBlock data from{" "}
            <a
              href="https://sponsor.ajay.app/"
              className="hover:text-th-callToAction"
            >
              https://sponsor.ajay.app/
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
