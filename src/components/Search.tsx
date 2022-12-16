import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { clsx } from "clsx";
import { TfiSearch, TfiClose } from "react-icons/tfi";
const Search = ({ initialValue = "" }: { initialValue?: string }) => {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const [searchTerm, setSearchTerm] = useState(() => initialValue);

  useEffect(() => {
    setSearchTerm(initialValue);
  }, [initialValue]);

  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchTerm) {
      router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <form onSubmit={onFormSubmit} className="inline-flex h-full w-full text-th-searchText">
      <div
        className={clsx(
          "relative flex h-full w-full items-center justify-between rounded-full rounded-r-none border shadow-[inset_0_1px_2px_#eeeeee]",
          focused
            ? "border-th-searchBorderFocus "
            : "ml-8 border-r-0 border-th-searchBorder "
        )}
      >
        {focused && (
          <div>
            <TfiSearch className="ml-4 h-4 w-4 flex-none" />
          </div>
        )}

        <input
          type="text"
          placeholder="Search"
          className="m-0 ml-3 w-full border-none bg-transparent px-1 outline-none"
          value={searchTerm}
          ref={inputRef}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => {
              setSearchTerm("");
              inputRef.current?.focus();
            }}
            className="absolute -right-2 mr-2 rounded-full p-4 hover:bg-th-additiveBackgroundA10"
          >
            <TfiClose className="h-4 w-4" />
          </button>
        )}
      </div>

      <button
        type="submit"
        aria-label="search"
        className={clsx(
          "h-full rounded-r-full border border-th-searchBorder bg-th-searchButton  px-4 hover:bg-th-searchButtonHover hover:shadow-[0_1px_0_rgb(0,0,0,0,0.1)] focus:border-th-searchBorderFocus focus:outline-none"
        )}
      >
        <TfiSearch className="h-5 w-5 mx-2" />
      </button>
    </form>
  );
};

export default Search;
