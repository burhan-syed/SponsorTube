import { cn } from "@/utils/cn";
import React, { useEffect, useState } from "react";

const HomeSectionsContainer = ({ children }: { children?: React.ReactElement }) => {
  return (
    <div className={cn("relative")}>
      <div className="flex h-[50vh] w-full bg-gradient-to-b from-transparent to-th-baseBackground absolute -z-10">
        <div className="block h-full w-full bg-gradient-to-b  from-th-baseBackground/50 to-th-baseBackground shadow-[0px_0px_2vw_0.1vw_#00000020]  backdrop-blur-lg md:mx-0 md:ml-[5vw]   md:rounded-tl-[5vw] 2xl:ml-[max(calc(50vw-96rem+5vw),5vw)] "></div>
      </div>

      <div className="min-h-[50vh] w-full before:absolute before:top-[50vh] before:-z-10 before:h-[calc(100%-50vh)] before:w-full before:bg-th-baseBackground">
        {children}
      </div>
    </div>
  );
};

export default HomeSectionsContainer;
