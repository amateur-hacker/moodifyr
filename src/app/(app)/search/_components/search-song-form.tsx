"use client";

import {
  useClickOutside,
  useDebouncedValue,
  useInViewport,
} from "@mantine/hooks";
import fuzzysort from "fuzzysort";
import parse from "html-react-parser";
import { History, Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import type React from "react";
import { useEffect, useRef, useState, useTransition } from "react";
import { RemoveScroll } from "react-remove-scroll";
import { toast } from "sonner";
import { useUser } from "@/app/(app)/_context/user-context";
import {
  removeUserSongSearchHistory,
  trackUserSongSearchHistory,
} from "@/app/(app)/actions";
import {
  getSongSearchSuggestions,
  getUserSongSearchHistory,
} from "@/app/(app)/queries";
import { TopLoader } from "@/components/top-loader";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { encodeQueryParam } from "@/lib/utils";

// import { useScrollLock } from "@/hooks/use-scroll-lock";

const SearchSongForm = () => {
  const searchParams = useSearchParams();
  const querySearchParam = searchParams.get("q") || "";

  const [query, setQuery] = useState(querySearchParam);
  const [debouncedQuery] = useDebouncedValue(query, 500);
  const [isPending, startTransition] = useTransition();
  const [history, setHistory] = useState<
    { id: string; query: string; isOwnQuery?: string }[]
  >([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [contentEl, setContentEl] = useState<HTMLDivElement | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [shouldRefreshUserHistory, setShouldRefreshUserHistory] =
    useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const shouldShowUserHistory = !debouncedQuery.trim();
  const shouldShowDropdown =
    isInputFocused && history.length > 0 && !loadingHistory;

  const user = useUser();
  const userId = user?.id ?? null;

  const router = useRouter();

  // useScrollLock(shouldShowDropdown);
  useClickOutside(
    () => setIsInputFocused(false),
    ["click", "mousedown"],
    [inputRef?.current, contentEl],
  );

  const { ref: bottomRef, inViewport } = useInViewport();

  // biome-ignore lint/correctness/useExhaustiveDependencies: <_>
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setHistory([]);
    setLoadingHistory(true);

    const fetch = shouldShowUserHistory
      ? getUserSongSearchHistory({ page: 1, limit: 10 })
      : getSongSearchSuggestions({
          query: debouncedQuery.trim(),
          page: 1,
          limit: 10,
          userId,
        });

    fetch
      .then((res) => {
        setHistory(res ?? []);
        setHasMore((res?.length ?? 0) >= 10);
      })
      .finally(() => setLoadingHistory(false));
  }, [debouncedQuery, shouldShowUserHistory]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <_>
  useEffect(() => {
    if (inViewport && hasMore && !loadingMore) {
      setLoadingMore(true);

      const fetchNext = shouldShowUserHistory
        ? getUserSongSearchHistory({ page: page + 1, limit: 10 })
        : getSongSearchSuggestions({
            query: debouncedQuery.trim(),
            page: page + 1,
            limit: 10,
            userId,
          });

      fetchNext
        .then((res) => {
          if (res?.length) {
            setHistory((prev) => [...prev, ...res]);
            setPage((p) => p + 1);
          }
          if (!res?.length || res.length < 10) setHasMore(false);
        })
        .finally(() => setLoadingMore(false));
    }
  }, [inViewport, debouncedQuery, hasMore, loadingMore]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const navigateWithQuery = (q: string) => {
    startTransition(() => {
      if (!q?.length) router.push("/search");
      else router.push(`/search?q=${encodeQueryParam(q)}`);
    });
  };

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsInputFocused(false);
    inputRef?.current?.blur();

    const trimmedQuery = query.trim();
    if (trimmedQuery?.length) {
      trackUserSongSearchHistory({ query: trimmedQuery.toLowerCase() })
        .then((res) => {
          if (!res?.success) console.error("Failed to track search history.");
        })
        .catch((error) =>
          console.error("Error tracking search history:", error),
        );
      navigateWithQuery(trimmedQuery);
    }
  };

  const handleClear = () => {
    setQuery("");
    inputRef?.current?.focus();
  };

  const handleRemoveHistory = async (id: string) => {
    setHistory((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, query: "Removed" } : item,
      ),
    );

    try {
      const res = await removeUserSongSearchHistory({ id });
      if (!res?.success) {
        toast.error("Failed to remove history. Please try again.");
      } else {
        setShouldRefreshUserHistory(true);
      }
    } catch (error) {
      console.error("Error removing search history:", error);
    }
  };

  const handleSelectHistory = async (text: string) => {
    if (text === "Removed") return;

    const trimmedText = text.trim();
    setQuery(trimmedText);
    inputRef?.current?.blur();
    navigateWithQuery(trimmedText);

    trackUserSongSearchHistory({ query: trimmedText })
      .then((res) => {
        if (!res?.success) {
          console.error("Failed to track search history.");
          // toast.error("Failed to track search history. Please try again.");
        }
      })
      .catch((error) => console.error("Error tracking search history:", error));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" && shouldShowDropdown) {
      e.preventDefault();
      queueMicrotask(() => {
        const firstItem =
          contentEl?.querySelector<HTMLDivElement>('[role="menuitem"]');
        firstItem?.focus();
      });
    }
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;

    const result = fuzzysort.single(query, text);

    if (!result) return text;

    return result.highlight(
      "<strong className='text-foreground'>",
      "</strong>",
    );
  };

  return (
    <>
      <TopLoader isLoading={isPending} />
      <form className="w-full flex" onSubmit={handleSearch}>
        <div className="relative w-full bg-background rounded-s-md rounded-e-md">
          <Input
            ref={inputRef}
            className="sticky inset-x-0 top-0 pl-3 pr-7 rounded-none rounded-s-md focus-visible:ring-[1px]"
            placeholder="Search for song..."
            type="search"
            onChange={handleChange}
            onFocus={() => {
              if (shouldShowUserHistory && shouldRefreshUserHistory) {
                setShouldRefreshUserHistory(false);
                getUserSongSearchHistory({ page: 1, limit: 10 })
                  .then((res) => {
                    setHistory(res ?? []);
                    setHasMore((res?.length ?? 0) >= 10);
                  })
                  .catch((error) => {
                    console.error("Error loading search history:", error);
                    // toast.error(
                    //   "Failed to load search history. Please try again.",
                    // );
                  })
                  .finally(() => setLoadingHistory(false));
              }
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

          <RemoveScroll enabled={shouldShowDropdown}>
            <DropdownMenu open={shouldShowDropdown} modal={false}>
              <DropdownMenuTrigger asChild>
                <div
                  aria-hidden
                  className="absolute inset-0 pointer-events-none"
                  suppressHydrationWarning
                />
              </DropdownMenuTrigger>

              <DropdownMenuContent
                ref={setContentEl}
                align="start"
                className="w-[var(--radix-dropdown-menu-trigger-width)] p-0 max-h-60 overflow-y-auto"
                // @ts-expect-error shadcn typing mismatch
                onOpenAutoFocus={(e) => e.preventDefault()}
                onCloseAutoFocus={(e) => e.preventDefault()}
              >
                {history.map((item, idx) => (
                  <DropdownMenuItem
                    key={item.id}
                    className={`flex justify-between items-center group ${
                      item.query === "Removed"
                        ? "text-muted-foreground opacity-50"
                        : ""
                    }`}
                    onSelect={(e) => {
                      e.preventDefault();
                      handleSelectHistory(item.query);
                      setIsInputFocused(false);
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
                          inputRef?.current?.focus();
                        }
                      }
                    }}
                  >
                    <div className="flex gap-2 items-center overflow-hidden">
                      {shouldShowUserHistory || item?.isOwnQuery ? (
                        <History className="text-foreground" />
                      ) : (
                        <Search className="text-foreground" />
                      )}
                      <span
                        className={`truncate ${
                          shouldShowUserHistory
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }
                            `}
                      >
                        {parse(highlightMatch(item.query, debouncedQuery))}
                      </span>
                    </div>
                    {(shouldShowUserHistory || item?.isOwnQuery) && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveHistory(item.id);
                        }}
                        className="ml-2 not-has-hover:opacity-100 has-hover:opacity-0 group-hover-always:group-hover:opacity-100 group-focus-within:opacity-100 text-foreground cursor-pointer disabled:pointer-events-none disabled:opacity-50"
                        title="Remove"
                        disabled={item.query === "Removed"}
                      >
                        <X className="size-4 text-inherit" aria-hidden />
                      </button>
                    )}
                  </DropdownMenuItem>
                ))}

                {(hasMore || loadingMore) && (
                  <div
                    ref={bottomRef}
                    className="flex items-center justify-center py-2 text-sm text-muted-foreground gap-2"
                  >
                    <Spinner />
                    Loading...
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </RemoveScroll>

          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
              title="Clear Search"
            >
              <X className="size-5" aria-hidden />
            </button>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="flex items-center justify-center rounded-none rounded-e-md disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer border border-border focus-visible:ring-[1px]"
          type="submit"
          disabled={isPending}
          title="Search"
        >
          <Search size={16} aria-hidden />
        </Button>
      </form>
    </>
  );
};

export { SearchSongForm };
