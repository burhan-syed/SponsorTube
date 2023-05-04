import React, { useEffect, useRef, useState } from "react";
import Autosuggest from "react-autosuggest";
import { TfiSearch, TfiClose } from "react-icons/tfi";
import { Button } from "@/components/ui/common/Button";
import { cn } from "@/utils/cn";
import useSearch from "@/hooks/useSearch";

const HomeSearch = ({
  initialValue = "",
  autoFocus = false,
  setAutoFocus,
}: {
  initialValue?: string;
  autoFocus?: boolean;
  setAutoFocus?(b: boolean): void;
}) => {
  const {
    formRef,
    inputRef,
    onFormSubmit,
    focused,
    inputProps,
    suggestions,
    onSuggestionsFetchRequested,
    getSuggestionValue,
    onSuggestionSelected,
    renderSuggestions,
    onClear,
    results,
    searchTerm,
    autoCompleteSearchTerm,
  } = useSearch({
    initialValue,
    autoFocus,
    setAutoFocus,
    variant: "HOME",
    placeholder: "Search",
  });

  return (
    <>
      <form
        ref={formRef}
        onSubmit={onFormSubmit}
        className={cn(
          "inline-flex h-11 max-w-6xl text-th-searchText md:px-0  ",
          focused
            ? "fixed left-1/2 top-32 z-50 w-[95vw] -translate-x-1/2 sm:relative sm:top-[40%] sm:z-0 sm:w-full"
            : "absolute bottom-32 left-1/2 w-[95vw] -translate-x-1/2 -translate-y-1/2 sm:top-1/2 sm:w-full "
        )}
        id="HomeSearch"
      >
        <div
          // onFocus={() => setFocused(true)}
          // onBlur={() => setFocused(false)}
          className={cn(
            "relative flex h-full w-full items-center justify-between rounded-full rounded-r-none border bg-th-menuBackground sm:border sm:bg-transparent sm:shadow-[inset_0_1px_2px_#eeeeee]",
            focused
              ? "scale-100 border-th-searchBorder opacity-100 animate-in fade-in-90 slide-in-from-bottom-12 duration-300 ease-out sm:border-th-searchBorderFocus sm:slide-in-from-bottom-10 "
              : "border-th-searchBorder sm:ml-8 sm:border-r-0 "
          )}
        >
          {focused && (
            <div
              className="hidden h-full items-center hover:cursor-text sm:flex"
              onClick={() => inputRef.current?.focus()}
            >
              <TfiSearch className="h-4 w-4 flex-none sm:ml-4 " />
            </div>
          )}
          <Autosuggest
            id="HomeSearch"
            inputProps={inputProps}
            suggestions={
              results?.data?.results && (results.data?.results?.length ?? 0) > 0
                ? results.data?.results.map((r) => ({ value: r }))
                : []
            }
            getSuggestionValue={(suggestion) => suggestion.value}
            renderSuggestion={renderSuggestions}
            onSuggestionsFetchRequested={onSuggestionsFetchRequested}
            onSuggestionsClearRequested={() => {}}
            onSuggestionSelected={onSuggestionSelected}
          />
          {searchTerm && (
            <Button
              type="button"
              round
              variant={"transparent"}
              size={"large"}
              onClick={onClear}
              className={"absolute rounded-full p-4"}
            >
              <TfiClose className="h-3 w-3 flex-none sm:h-4 sm:w-4" />
            </Button>
          )}
          {results.isLoading &&
            autoCompleteSearchTerm.length >= 3 &&
            focused && (
              <div className="fixed top-[calc(10%+5rem)] z-[9999] flex w-[95vw] flex-col items-center overflow-hidden rounded-[2.2rem] bg-th-raisedBackground py-2 shadow-md sm:absolute sm:h-auto sm:w-full sm:rounded-2xl sm:border sm:py-2">
                <div className="flex w-full flex-col">
                  <div className="pointer-events-none z-10 flex items-center gap-4 p-1 px-0 sm:border-none sm:p-2">
                    <div>
                      <TfiSearch className="ml-4 h-4 w-4 flex-none" />
                    </div>
                    <span className="skeleton-box h-5 w-1/2 rounded-lg"></span>
                  </div>
                </div>
              </div>
            )}
        </div>

        <button
          type="submit"
          aria-label="search"
          className={cn(
            "z-10 h-full rounded-r-full border border-l-0 border-th-searchBorder bg-th-searchButton px-2   after:bg-th-additiveBackground/5  hover:bg-th-searchButtonHover sm:border sm:border-th-searchBorder sm:bg-th-searchButton sm:px-4 sm:hover:shadow-[0_1px_0_rgb(0,0,0,0,0.1)] sm:focus:border-th-searchBorderFocus sm:focus:outline-none",
            focused &&
              "scale-100 opacity-100 animate-in fade-in-90 slide-in-from-bottom-12 duration-300 ease-out sm:slide-in-from-bottom-10"
          )}
        >
          <TfiSearch className="mx-2 h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </form>

      {((results.data?.results && (results.data?.results?.length ?? 0 > 0)) ||
        results.isLoading) &&
        (focused || autoFocus) && (
          //prevent click through and close search when clicked
          <div
            // onClick={(e) => {
            //   e.stopPropagation();
            //   setAutoFocus && setAutoFocus(false);
            // }}
            className="fixed inset-0 z-40 h-full w-full animate-[blur_ease-in-out_500ms_forwards] bg-th-invertedBackground/50 opacity-100 fade-in-90 sm:hidden"
          ></div>
        )}
    </>
  );
};

export default HomeSearch;
