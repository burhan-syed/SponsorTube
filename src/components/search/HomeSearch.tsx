import React, { useEffect, useRef, useState } from "react";
import Autosuggest from "react-autosuggest";
import { RemoveScroll } from "react-remove-scroll";
import { TfiSearch, TfiClose, TfiAngleLeft } from "react-icons/tfi";
import { Button } from "@/components/ui/common/Button";
import { cn } from "@/utils/cn";
import useSearch from "@/hooks/useSearch";
import useGlobalStore from "@/store/useGlobalStore";
import useIsMobileWindow from "@/hooks/useIsMobileWindow";

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
    forceUnfocus,
  } = useSearch({
    initialValue,
    autoFocus,
    setAutoFocus,
    variant: "HOME",
    placeholder: "Lookup any Channel or Video",
  });

  const setHomeSearchTriggered = useGlobalStore(
    (store) => store.setHomeSearchTriggered
  );

  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;
    if (focused) {
      setHomeSearchTriggered(true);
      if (window.innerWidth > 768) {
        inputRef.current?.scrollIntoView({
          block: "center",
          behavior: "smooth",
        });
      } else {
        scrollTimeout = setTimeout(
          () => {
            if (inputRef?.current) {
              inputRef.current?.scrollIntoView({
                block: "start",
                behavior: "smooth",
              });
            }
          },

          100
        );
      }
    } else {
      setHomeSearchTriggered(false);
    }
    return () => {
      scrollTimeout && clearTimeout(scrollTimeout);
    };
  }, [focused]);

  return (
    <RemoveScroll forwardProps enabled={focused}>
      <>
        {focused && (
          <h2
            className="absolute left-0 z-50  w-full max-w-6xl -translate-y-full  items-center pb-[2vh] text-[16vw]  font-semibold  leading-[1] text-th-textPrimaryInverse opacity-95  sm:absolute sm:top-auto sm:pb-[4vh] sm:text-[10.6vw] md:text-[8vw] lg:text-[7.6vw] xl:text-[6.6vw] 2xl:text-[calc(min(5.5vw,12rem))]"
            //left-[2.5vw] top-16 z-50 flex w-[95vw]
            style={{ textShadow: "1px 2px 2px #00000020" }}
          >
            <div className="flex w-full items-center justify-between animate-in fade-in-0 slide-in-from-bottom-12 duration-300 ease-out ">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  forceUnfocus();
                }}
                className="outline-none animate-in slide-in-from-right-20 duration-500 "
              >
                <TfiAngleLeft
                  className="h-[10vw] w-[10vw]  flex-none md:h-[8vw] md:w-[8vw] lg:h-[7.6vw] lg:w-[7.6vw] xl:h-[6.6vw] xl:w-[6.6vw] 2xl:h-[calc(min(5.5vw,12rem))] 2xl:w-[calc(min(5.5vw,12rem))]"
                  style={{ filter: `drop-shadow(1px 2px 2px #00000020)` }}
                />
              </button>
              <span className="animate-in slide-in-from-left-20 duration-500  ">
                Search
              </span>
            </div>
          </h2>
        )}

        <form
          ref={formRef}
          onSubmit={onFormSubmit}
          className={cn(
            "flex h-11 max-w-6xl flex-grow flex-col text-th-searchText md:h-[calc(mac(4.6vw,4.4rem))] md:px-0  lg:h-[4.6vw]  xl:h-[3.6vw]   2xl:h-[calc(min(3.2vw,6.4rem))]  ",
            focused
              ? " z-50 rounded-full sm:relative sm:left-auto sm:top-auto sm:w-auto sm:translate-x-0 sm:shadow-md " // w-[95vw] -translate-x-1/2 fixed left-1/2 top-[calc(18vw+6.6rem)]
              : " "
          )}
          id="HomeSearch"
        >
          <div className="inline-flex h-full flex-grow">
            <div
              // onFocus={() => setFocused(true)}
              // onBlur={() => setFocused(false)}
              className={cn(
                "relative flex h-full w-full items-center justify-between rounded-full rounded-r-none border border-r-0 bg-th-menuBackground  sm:shadow-[inset_0_1px_2px_#eeeeee]", //sm:border sm:shadow-[inset_0_1px_2px_#eeeeee]
                focused
                  ? " border-th-searchBorder sm:shadow-[inset_0_1px_2px_#eeeeee] " //opacity-100 animate-in fade-in-90 slide-in-from-bottom-12 duration-300 ease-out sm:animate-none
                  : "border-th-searchBorder   " //sm:border-r-0 sm:ml-8
              )}
            >
              {/* {focused && ( */}
              <div
                className="hidden h-full items-center hover:cursor-text sm:flex"
                onClick={() => inputRef.current?.focus()}
              >
                <TfiSearch className="h-4 w-4 flex-none sm:ml-4 sm:h-5 sm:w-5 " />
              </div>
              {/* )} */}
              <Autosuggest
                id="HomeSearch"
                inputProps={inputProps}
                suggestions={
                  results?.data?.results &&
                  (results.data?.results?.length ?? 0) > 0
                    ? results.data?.results
                        .map((r) => ({ value: r }))
                        .slice(0, 5)
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
                  <div className="absolute top-[120%] z-50 flex w-[calc(100%+4.8rem)] flex-col items-center overflow-hidden rounded-[2.2rem] bg-th-raisedBackground py-2 shadow-md sm:absolute sm:h-auto sm:w-full sm:rounded-2xl sm:border sm:py-2">
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
                "h-full rounded-r-full border border-th-searchBorder bg-th-searchButton px-2   after:bg-th-additiveBackground/5  hover:bg-th-searchButtonHover sm:px-4  sm:hover:shadow-[0_1px_0_rgb(0,0,0,0,0.1)] sm:focus:border-th-searchBorderFocus sm:focus:outline-none" //sm:border sm:border-th-searchBorder sm:bg-th-searchButton sm:px-4 sm:hover:shadow-[0_1px_0_rgb(0,0,0,0,0.1)] sm:focus:border-th-searchBorderFocus
                // focused &&
                //   " opacity-100 animate-in fade-in-90 slide-in-from-bottom-12 duration-300 ease-out sm:animate-none"
              )}
            >
              <TfiSearch className="mx-2 h-4 w-4 flex-none sm:h-5 sm:w-5" />
            </button>
          </div>
        </form>
        {/* {focused && (
          //placeholder
          <div className="inline-flex h-11 max-w-6xl sm:hidden"></div>
        )} */}
        {(focused || autoFocus) && (
          //bg blur
          <>
            <div className="fixed inset-0 z-40 h-full w-full animate-[blur_ease-in-out_500ms_forwards] bg-th-invertedBackground/50 opacity-100 fade-in-90"></div>
          </>
        )}
      </>
    </RemoveScroll>
  );
};

export default HomeSearch;
