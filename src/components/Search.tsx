import React, { useEffect, useRef, useState } from "react";
import Autosuggest from "react-autosuggest";
import { useRouter } from "next/router";
import { clsx } from "clsx";
import { TfiSearch, TfiClose } from "react-icons/tfi";
import { Button } from "./ui/common/Button";
import useAutoCompleteSearch from "@/hooks/useAutoCompleteSearch";
import Link from "next/link";

const renderSuggestions = (
  suggestion: string,
  { query }: { query: string }
) => {
  // const matches = AutosuggestHighlightMatch(suggestion, query);
  const parts = suggestion.split(query).map((part, i) => {
    if (part === "" && i === 0) {
      return { text: query, highlight: false };
    }
    return { text: part, highlight: true };
  });
  // const parts = AutosuggestHighlightParse(suggestion, matches);
  return (
    <Link href={`/search?q=${encodeURIComponent(suggestion)}`}>
      <a className="flex items-center space-x-4 border-b bg-th-raisedBackground p-2 px-0 sm:border-none sm:bg-transparent">
        <div>
          <TfiSearch className="ml-4 h-4 w-4 flex-none" />
        </div>
        <span>
          {parts.map((part, i) => (
            <span
              className={clsx(part.highlight && "font-bold")}
              key={`${i}_${part.text}`}
            >
              {part.text}
            </span>
          ))}
        </span>
      </a>
    </Link>
  );
};

const Search = ({
  initialValue = "",
  autoFocus = false,
  setAutoFocus,
}: {
  initialValue?: string;
  autoFocus?: boolean;
  setAutoFocus?(b: boolean): void;
}) => {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [focused, setFocused] = useState(false);
  const [searchTerm, setSearchTerm] = useState(() => initialValue);
  const [autoCompleteSearchTerm, setAutoCompleteSearchTerm] = useState(
    () => ""
  );
  const results = useAutoCompleteSearch(autoCompleteSearchTerm);
  useEffect(() => {
    setSearchTerm(initialValue);
  }, [initialValue]);
  useEffect(() => {
    autoFocus && inputRef?.current?.focus();
  }, [autoFocus]);
  useEffect(() => {
    const html = document.querySelector("html");
    if (html) {
      html.style.overflow =
        (results.data?.results?.length ?? 0 > 0) && autoFocus
          ? "hidden"
          : "auto";
    }

    return () => {
      if (html) {
        html.style.overflow = "auto";
      }
    };
  }, [results.data, autoFocus]);
  useEffect(() => {
    const checkClick = (e: any) => {
      if (e.target?.id === "react-autowhatever-1" && setAutoFocus) {
        setAutoFocus(false);
      }
    };
    autoFocus &&
      window.innerWidth <= 640 &&
      window.addEventListener("click", checkClick);
    return () => {
      window.removeEventListener("click", checkClick);
    };
  }, [autoFocus]);

  const onFormSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (searchTerm) {
      router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  const inputProps = {
    ref: inputRef,
    placeholder: "",
    value: searchTerm,
    onChange: (
      e: React.FormEvent<HTMLElement>,
      { newValue, method }: { newValue: string; method: string }
    ) => {
      //console.log("term?", newValue, method);
      setSearchTerm(newValue);
      method === "type" && setAutoCompleteSearchTerm(newValue);
    },
    autoFocus: autoFocus,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
  };

  return (
    <>
      <form
        ref={formRef}
        onSubmit={onFormSubmit}
        className="inline-flex h-full w-full text-th-searchText"
      >
        <div
          // onFocus={() => setFocused(true)}
          // onBlur={() => setFocused(false)}
          className={clsx(
            "relative flex h-full w-full items-center justify-between rounded-full rounded-r-none bg-th-additiveBackground/5 sm:border sm:bg-transparent sm:shadow-[inset_0_1px_2px_#eeeeee]",
            focused
              ? "sm:border-th-searchBorderFocus "
              : "sm:ml-8 sm:border-r-0 sm:border-th-searchBorder "
          )}
        >
          {focused && (
            <div className="hidden sm:block">
              <TfiSearch className="h-4 w-4 flex-none sm:ml-4" />
            </div>
          )}
          <Autosuggest
            inputProps={inputProps}
            suggestions={results.data?.results ?? []}
            getSuggestionValue={(suggestion) => suggestion}
            renderSuggestion={renderSuggestions}
            onSuggestionsFetchRequested={({ value }) => {
              setSearchTerm(value);
            }}
            onSuggestionSelected={(event, { suggestion }) => {
              event.preventDefault();
              suggestion &&
                router.push(`/search?q=${encodeURIComponent(suggestion)}`);
            }}
          />
          {searchTerm && (
            <Button
              type="button"
              round
              variant={"transparent"}
              size={"large"}
              onClick={(e) => {
                e.preventDefault();
                setSearchTerm("");
                setAutoCompleteSearchTerm("");
                setTimeout(() => inputRef.current?.focus(), 0);
              }}
              className="absolute rounded-full p-4"
            >
              <TfiClose className="h-3 w-3 flex-none sm:h-4 sm:w-4" />
            </Button>
          )}
        </div>

        <button
          type="submit"
          aria-label="search"
          className={clsx(
            "h-full rounded-r-full bg-th-additiveBackground/5 px-2 hover:bg-th-searchButtonHover sm:border  sm:border-th-searchBorder sm:bg-th-searchButton sm:px-4 sm:hover:shadow-[0_1px_0_rgb(0,0,0,0,0.1)] sm:focus:border-th-searchBorderFocus sm:focus:outline-none"
          )}
        >
          <TfiSearch className="mx-2 h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </form>
    </>
  );
};

export default Search;
