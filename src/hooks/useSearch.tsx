import { useRouter } from "next/router";
import React, { type FormEvent, useEffect, useRef, useState } from "react";
import useAutoCompleteSearch from "./useAutoCompleteSearch";
import Link from "next/link";
import { TfiSearch } from "react-icons/tfi";
import { cn } from "@/utils/cn";
import { BsBoxArrowInUpLeft } from "react-icons/bs";

const useSearch = ({
  initialValue = "",
  placeholder = "",
  autoFocus = false,
  setAutoFocus,
  variant,
  noScroll = false, 
}: {
  initialValue?: string;
  placeholder?: string;
  autoFocus?: boolean;
  setAutoFocus?(b: boolean): void;
  variant: "HOME" | "NAV";
  noScroll?:boolean;
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
        ((results.data?.results?.length ?? 0 > 0) && autoFocus || (noScroll && focused))
          ? "hidden"
          : "auto";
    }

    return () => {
      if (html) {
        html.style.overflow = "auto";
      }
    };
  }, [results.data, autoFocus, noScroll, focused]);

  const forceUnfocus = () => {
    inputRef.current?.blur(); 
    setFocused(false); 
  }

  const onFormSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (searchTerm) {
      router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  const inputProps = {
    ref: inputRef,
    placeholder: placeholder,
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
    onFocus: () => {
      setFocused(true);
    },
    onBlur: () => {},
  };

  useEffect(() => {
    let focusTime: number;
    const checkBlur = (e: MouseEvent) => {
      const delayMS = 200;
      const now = new Date().getTime();
      const boundingRect = formRef.current?.getBoundingClientRect();
      const searchContainer = document.querySelector(
        ".react-autosuggest__suggestions-container--open"
      );
      const searchContainerBounding = searchContainer?.getBoundingClientRect();
      // console.log(
      //   e.clientX,
      //   e.clientY,
      //   formRef.current?.getBoundingClientRect(),
      //   searchContainerBounding
      // );

      if (
        boundingRect &&
        now > focusTime + delayMS &&
        (e.clientX < boundingRect.left ||
          e.clientX > (boundingRect?.x ?? 0) + (boundingRect?.width ?? 0) ||
          e.clientY < boundingRect.y ||
          e.clientY > boundingRect.y + boundingRect.height) &&
        !(
          searchContainerBounding &&
          e.clientX >= searchContainerBounding.x &&
          e.clientY <=
            searchContainerBounding.x + searchContainerBounding.width &&
          e.clientY >= searchContainerBounding.y &&
          e.clientY <=
            searchContainerBounding.y + searchContainerBounding.height
        )
      ) {
        forceUnfocus();
      }
    };
    if (focused) {
      focusTime = new Date().getTime();
      window?.addEventListener("click", checkBlur);
    }

    return () => {
      window?.removeEventListener("click", checkBlur);
    };
  }, [focused]);
  const escapeCount = useRef<number>(initialValue ? 0 : 1);
  useEffect(() => {
    escapeCount.current = initialValue ? 0 : 1;
  }, [initialValue]);

  useEffect(() => {
    const onKeyPress = (e: KeyboardEvent) => {
      const cValue = inputRef.current?.value;
      if (e.key === "Escape" && !cValue) {
        escapeCount.current += 1;
        if (escapeCount.current > 1) {
          inputRef.current?.blur();
          setFocused(false);
        }
      } else if (cValue) {
        escapeCount.current = 0;
      }
    };
    if (focused) {
      window.addEventListener("keyup", onKeyPress);
    }

    return () => {
      window.removeEventListener("keyup", onKeyPress);
    };
  }, [focused]);

  const suggestions =
    results?.data?.results && (results.data?.results?.length ?? 0) > 0
      ? results.data?.results.map((r) => ({ value: r }))
      : [];
  const onSuggestionsFetchRequested = ({ value }: { value: string }) => {
    setSearchTerm(value);
  };
  const getSuggestionValue = (suggestion: { value: string }) =>
    suggestion.value;
  const onSuggestionSelected = (
    event: FormEvent<any>,
    { suggestion }: { suggestion: { value: string } }
  ) => {
    event.preventDefault();
    setAutoCompleteSearchTerm("");
    setAutoFocus && setAutoFocus(false);
    suggestion &&
      router.push(`/search?q=${encodeURIComponent(suggestion.value)}`);
  };

  const renderSuggestions = (
    suggestion: { value: string },
    { query }: { query: string }
  ) => {
    // const matches = AutosuggestHighlightMatch(suggestion, query);
    const parts = suggestion.value.split(query).map((part, i) => {
      if (part === "" && i === 0) {
        return { text: query, highlight: false };
      }
      return { text: part, highlight: true };
    });
    // const parts = AutosuggestHighlightParse(suggestion, matches);
    return (
      (<Link
        href={`/search?q=${encodeURIComponent(suggestion.value)}`}
        className={cn(
          "z-10 flex items-center gap-4  p-1 px-0 sm:border-none sm:p-2",
          variant === "HOME" ? "sm:text-lg" : variant === "NAV" && "border-b"
        )}>

        <div>
          <TfiSearch className="ml-4 h-4 w-4 flex-none" />
        </div>
        <span>
          {parts.map((part, i) => (
            <span
              className={cn(part.highlight && "font-semibold")}
              key={`${i}_${part.text}`}
            >
              {part.text}
            </span>
          ))}
        </span>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setSearchTerm(suggestion.value);
            setAutoCompleteSearchTerm(suggestion.value);
          }}
          className="ml-auto mr-2 aspect-square rounded-lg bg-th-additiveBackground/5 p-2 sm:hidden"
        >
          <BsBoxArrowInUpLeft />
        </button>

      </Link>)
    );
  };

  const onClear = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    e.stopPropagation();
    setSearchTerm("");
    setAutoCompleteSearchTerm("");
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return {
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
    forceUnfocus
  };
};

export default useSearch;
