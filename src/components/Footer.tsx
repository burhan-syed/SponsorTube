import Link from "next/link";
import React from "react";

const links: { href: string; display: string }[] = [
  { href: "/faqs", display: "FAQs" },
  { href: "/recent", display: "Recents" },
];
const Footer = () => {
  return (
    <footer className="relative w-full border-t border-th-additiveBackground/5 bg-th-generalBackgroundA  ">
      <div className="mx-auto flex h-full w-full flex-row flex-wrap items-center justify-between px-4 py-2 md:px-[5vw] 2xl:max-w-[192rem] gap-x-4">
        <ul className="flex flex-wrap items-center gap-x-6 py-2">
          {links.map((link) => (
            <li key={link.display}>
              <Link href={link.href} className="hover:underline">
                {link.display}
              </Link>
            </li>
          ))}
        </ul>

        <div className="inline-flex flex-wrap gap-x-6 font-light text-th-textSecondary lg:ml-auto">
          <span className="">
            {`Copyright ${new Date().getFullYear()}. `}
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
        <div className="font-light text-th-textSecondary lg:hidden">
          Created by {" "}
          <a
            target="_blank"
            rel="noreferrer"
            href="https://github.com/burhan-syed"
            className="hover:text-th-callToAction"
          >
            Burhan Syed
          </a>
        </div>
      </div>
      <div className="font-light text-th-textSecondary hidden lg:block px-4 pb-4 md:px-[5vw] 2xl:max-w-[192rem] gap-x-4 mx-auto">
          Created by {" "}
          <a
            target="_blank"
            rel="noreferrer"
            href="https://github.com/burhan-syed"
            className="hover:text-th-callToAction"
          >
            Burhan Syed
          </a>
        </div>
    </footer>
  );
};

export default Footer;
