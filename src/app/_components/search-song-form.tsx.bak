"use client";

import { mergeRefs, useClickOutside } from "@mantine/hooks";
import { ChevronLeft, Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import type React from "react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { useFloatSearchBar } from "@/app/_context/float-search-bar-context";
import {
  removeUserSongSearchHistory,
  trackUserSongSearchHistory,
} from "@/app/actions";
import { getUserSongSearchHistory } from "@/app/queries";
import { TopLoader } from "@/components/top-loader";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useScrollLock } from "@/hooks/use-scroll-lock";
import { encodeQueryParam } from "@/lib/utils";

type SearchSongFormProps = {
  inputRef?: React.Ref<HTMLInputElement>;
};

const SearchSongForm = ({ inputRef }: SearchSongFormProps) => {
  const { close } = useFloatSearchBar();
  const searchParams = useSearchParams();
  const querySearchParam = searchParams.get("q") || "";

  const [query, setQuery] = useState(querySearchParam);
  const [isPending, startTransition] = useTransition();
  const [history, setHistory] = useState<{ id: string; query: string }[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const shouldOpen = isInputFocused && query.length === 0;

  useScrollLock(shouldOpen);

  const router = useRouter();

  const [localInput, setLocalInput] = useState<HTMLInputElement | null>(null);
  const [contentEl, setContentEl] = useState<HTMLDivElement | null>(null);

  useClickOutside(() => setIsInputFocused(false), null, [
    localInput,
    contentEl,
  ]);

  useEffect(() => {
    if (!shouldOpen) return;

    setLoadingHistory(true);

    getUserSongSearchHistory({ page: 1, limit: 10 })
      .then((res) => setHistory(res ?? []))
      .finally(() => setLoadingHistory(false));
  }, [shouldOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const navigateWithQuery = (q: string) => {
    startTransition(() => {
      if (!q?.length) router.push("/search");
      else router.push(`/search?q=${encodeQueryParam(q)}`);
    });
  };

  const handleSearch = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    try {
      localInput?.blur();
      if (query?.length) {
        trackUserSongSearchHistory({ query });
      }
      navigateWithQuery(query);
    } catch (error) {
      toast.error("Something went wrong while searching");
      console.error("Search navigation error:", error);
    }
  };

  const handleClear = () => {
    setQuery("");
    localInput?.focus();
  };

  const handleRemoveHistory = async (id: string) => {
    setHistory((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, query: "Removed" } : item,
      ),
    );
    const res = await removeUserSongSearchHistory({ id });
    if (!res?.success) toast.error("Failed to remove search history");
  };

  const handleSelectHistory = async (text: string) => {
    if (text === "Removed") return;
    setQuery(text);
    try {
      localInput?.blur();
      navigateWithQuery(text);
      await trackUserSongSearchHistory({ query: text });
    } catch (error) {
      toast.error("Something went wrong while searching");
      console.error("Search navigation error:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" && shouldOpen) {
      e.preventDefault();
      queueMicrotask(() => {
        const firstItem =
          contentEl?.querySelector<HTMLDivElement>('[role="menuitem"]');
        firstItem?.focus();
      });
    }
  };

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
            ref={mergeRefs(setLocalInput, inputRef)}
            className="sticky inset-x-0 top-0 pl-8 pr-8 sm:pl-3 rounded-none z-10 rounded-s-md focus-visible:ring-[1px]"
            placeholder="Search for song..."
            type="search"
            onChange={handleChange}
            // onFocus={() => setIsInputFocused(true)}
            onFocus={() => {
              const timer = setTimeout(() => {
                setIsInputFocused(true);
              }, 300);

              return () => clearTimeout(timer);
            }}
            onKeyDown={handleKeyDown}
            value={query}
            autoComplete="off"
            spellCheck="false"
          />

          <DropdownMenu open={shouldOpen} modal={false}>
            <DropdownMenuTrigger asChild>
              <div
                aria-hidden
                className="absolute inset-0 pointer-events-none"
              />
            </DropdownMenuTrigger>

            <DropdownMenuContent
              ref={setContentEl}
              align="start"
              className="w-[var(--radix-dropdown-menu-trigger-width)] p-0"
              // @ts-expect-error shadcn typing mismatch
              onOpenAutoFocus={(e) => e.preventDefault()}
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              {history.length === 0 && !loadingHistory ? (
                <DropdownMenuItem disabled>No history</DropdownMenuItem>
              ) : (
                history.map((item, idx) => (
                  <DropdownMenuItem
                    key={item.id}
                    className={`flex justify-between items-center cursor-pointer ${
                      item.query === "Removed" ? "text-muted-foreground" : ""
                    }`}
                    // onPointerLeave={(event) => event.preventDefault()}
                    // onPointerMove={(event) => event.preventDefault()}
                    onSelect={(e) => {
                      e.preventDefault();
                      handleSelectHistory(item.query);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowUp") {
                        e.preventDefault();
                        const items = Array.from(
                          contentEl?.querySelectorAll<HTMLElement>(
                            '[role="menuitem"]',
                          ) || [],
                        );
                        if (idx > 0) {
                          items[idx - 1]?.focus();
                        } else {
                          localInput?.focus();
                        }
                      }
                    }}
                  >
                    <span>{item.query}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveHistory(item.id);
                      }}
                      className="ml-2 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <X className="size-4" />
                    </button>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer z-20"
              aria-label="Clear search"
            >
              <X className="size-5" />
            </button>
          )}
        </div>

        <Button
          variant="ghost"
          className="flex h-9 w-9 items-center justify-center rounded-none rounded-e-md disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer border border-border focus-visible:ring-[1px]"
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
