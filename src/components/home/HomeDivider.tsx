import { cn } from "@/utils/cn";
import React, { useEffect, useState } from "react";

const HomeDivider = ({ delay = 0 }: { delay: number }) => {
  const [show, setShow] = useState(true);

  return (
    <section
      className={cn(
        "flex h-[50vh] w-full bg-gradient-to-b from-transparent to-th-baseBackground"
      )}
    >
      <div className="mx-4 block h-full w-full rounded-tl-[5vw] rounded-tr-[5vw] bg-gradient-to-b from-th-baseBackground/50 to-th-baseBackground pl-[5vw] pt-[5vw] text-lg backdrop-blur-lg md:mx-0 md:ml-[5vw] md:rounded-tr-none 2xl:ml-[calc(50vw-96rem+5vw)] ">
        <span className="block">some text</span>
      </div>
    </section>
  );
};

export default HomeDivider;
