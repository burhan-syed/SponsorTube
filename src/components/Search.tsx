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
      <a className="flex items-center space-x-4 p-2 px-0 bg-th-raisedBackground sm:bg-transparent border-b sm:border-none">
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

const Search = ({ initialValue = "" }: { initialValue?: string }) => {
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

  const onFormSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (searchTerm) {
      console.log("search?", searchTerm);
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
  };

  return (
    <>
      <form
        ref={formRef}
        onSubmit={onFormSubmit}
        className="inline-flex h-full w-full text-th-searchText"
      >
        <div
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
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
              <TfiClose className="h-4 w-4 flex-none" />
            </Button>
          )}
        </div>

        <button
          type="submit"
          aria-label="search"
          className={clsx(
            "h-full rounded-r-full border border-th-searchBorder bg-th-searchButton  px-4 hover:bg-th-searchButtonHover hover:shadow-[0_1px_0_rgb(0,0,0,0,0.1)] focus:border-th-searchBorderFocus focus:outline-none"
          )}
        >
          <TfiSearch className="mx-2 h-5 w-5" />
        </button>
      </form>
    </>
  );
};

export default Search;
