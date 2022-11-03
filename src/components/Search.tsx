import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { clsx } from "clsx";
import { MdSearch, MdClear } from "react-icons/md";
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
    <form
      onSubmit={onFormSubmit}
      className={clsx(
        "flex h-full w-full items-center justify-between rounded-full border",
        focused
          ? "border-slate-50 bg-slate-50/90 shadow-xl backdrop-blur-3xl"
          : "border-transparent bg-slate-50/80 shadow-md backdrop-blur-md"
      )}
    >
      <input
        type="search"
        className="m-0 w-full border-none bg-transparent pl-4 pr-1 outline-none"
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
          className="mr-2"
        >
          <MdClear className="h-4 w-4 text-slate-800" />
        </button>
      )}

      <button
        type="submit"
        aria-label="search"
        className={clsx(
          "h-full rounded-r-full border-l border-slate-50/40 px-4",
          focused ? "border-slate-50/40" : "border-slate-50/10"
        )}
      >
        <MdSearch className="h-6 w-6 text-slate-800" />
      </button>
    </form>
  );
};

export default Search;
