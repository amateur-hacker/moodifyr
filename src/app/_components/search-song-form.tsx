"use client";

import type React from "react";
import { useState, useTransition, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import { ChevronLeft, Search, X } from "lucide-react";
import { toast } from "sonner";

import { TopLoader } from "@/components/top-loader";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { encodeQueryParam } from "@/utils/url";
import { useFloatSearchBar } from "@/app/_context/float-search-bar-context";
import { mergeRefs } from "@mantine/hooks";

type SearchSongFormProps = {
  inputRef?: React.Ref<HTMLInputElement>;
};
const SearchSongForm = ({ inputRef }: SearchSongFormProps) => {
  const { close } = useFloatSearchBar();
  const searchParams = useSearchParams();
  const querySearchParam = searchParams.get("q") || "";
  const [query, setQuery] = useState(querySearchParam);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const localInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      localInputRef.current?.blur();
      startTransition(() => {
        if (!query) return router.push("/search");
        router.push(`/search?q=${encodeQueryParam(query)}`);
      });
    } catch (error) {
      toast.error("Something went wrong while searching");
      console.error("Search navigation error:", error);
    }
  };

  const handleClear = () => {
    setQuery("");
    localInputRef.current?.focus();
    // router.push("/search");
  };

  const mergeInputRefs = mergeRefs(localInputRef, inputRef);

  return (
    <>
      <TopLoader isLoading={isPending} />
      <form className="w-full flex" onSubmit={handleSearch}>
        <div className="relative w-full bg-background rounded-s-md rounded-e-md">
          <button
            className="absolute left-2 top-1/2 -translate-y-1/2 cursor-pointer block sm:hidden z-20"
            onClick={close}
            type="button"
          >
            <ChevronLeft className="size-5" />
          </button>
          <Input
            ref={mergeInputRefs}
            className={cn(
              "sticky inset-x-0 top-0 ps-8 sm:ps-3 pe-8 rounded-none z-10",
              "rounded-s-md focus-visible:ring-[1px]",
            )}
            placeholder="Search for song..."
            type="search"
            onChange={handleChange}
            value={query}
            autoComplete="off"
            spellCheck="false"
          />
          {query && !!query.length && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer hover:bg-background/40 p-1.5 rounded-full z-20"
              aria-label="Clear search"
            >
              <X size={16} strokeWidth={2} />
            </button>
          )}
        </div>
        <Button
          variant="ghost"
          className={cn(
            "rounded-none",
            "flex h-9 w-9 items-center justify-center rounded-e-md bg-background text-muted-foreground/80 transition-colors hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 hover:bg-ctp-mantle-500 cursor-pointer border-border border focus-visible:ring-[1px]",
          )}
          aria-label="Submit search"
          type="submit"
          disabled={isPending}
        >
          <Search size={16} strokeWidth={2} />
        </Button>
      </form>
    </>
  );
};

export { SearchSongForm };
