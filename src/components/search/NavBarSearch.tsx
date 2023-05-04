import React from "react";
import Autosuggest from "react-autosuggest";
import { clsx } from "clsx";
import { TfiSearch, TfiClose } from "react-icons/tfi";
import { Button } from "@/components/ui/common/Button";
import useSearch from "@/hooks/useSearch";

const NavBarSearch = ({
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
  } = useSearch({ initialValue, autoFocus, setAutoFocus, variant: "HOME" });

  return (
    <>
      <form
        ref={formRef}
        onSubmit={onFormSubmit}
        className="inline-flex h-full w-full text-th-searchText"
        id="NavBarSearch"
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
            <div className="hidden sm:flex items-center h-full hover:cursor-text" onClick={() => inputRef.current?.focus()}>
              <TfiSearch className="h-4 w-4 flex-none sm:ml-4 " />
            </div>
          )}
          <Autosuggest
            inputProps={inputProps}
            suggestions={suggestions}
            getSuggestionValue={getSuggestionValue}
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
              className="absolute rounded-full p-4"
            >
              <TfiClose className="h-3 w-3 flex-none sm:h-4 sm:w-4" />
            </Button>
          )}
          {results.isLoading &&
            autoCompleteSearchTerm.length >= 3 &&
            focused && (
              <div className="fixed left-0 top-12 z-[9999] flex w-full flex-col items-center bg-th-raisedBackground shadow-md sm:absolute sm:h-auto sm:rounded-2xl sm:border sm:py-2">
                <div className="flex w-full flex-col">
                  <div className="pointer-events-none z-10 flex items-center gap-4 border-b p-1 px-0 pb-2 sm:border-none sm:p-2">
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
          className={clsx(
            "h-full rounded-r-full bg-th-additiveBackground/5 px-2 hover:bg-th-searchButtonHover sm:border  sm:border-th-searchBorder sm:bg-th-searchButton sm:px-4 sm:hover:shadow-[0_1px_0_rgb(0,0,0,0,0.1)] sm:focus:border-th-searchBorderFocus sm:focus:outline-none"
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
            onClick={(e) => {
              e.stopPropagation();
              setAutoFocus && setAutoFocus(false);
            }}
            className="fixed left-0 top-12 z-50 h-full w-full animate-[blur_ease-in-out_200ms_forwards] bg-th-invertedBackground/50 opacity-100 fade-in-90 sm:hidden"
          ></div>
        )}
    </>
  );
};

export default NavBarSearch;
