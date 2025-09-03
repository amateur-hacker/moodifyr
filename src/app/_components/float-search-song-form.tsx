"use client";

import { Search } from "lucide-react";
import { useEffect, useRef } from "react";
import { SearchSongForm } from "@/app/_components/search-song-form";
import { useFloatSearchBar } from "@/app/_context/float-search-bar-context";
import { Button } from "@/components/ui/button";

const FloatSearchSongForm = () => {
  const { isOpen, open } = useFloatSearchBar();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  return (
    <div className="relative">
      <Button variant="ghost" size="icon" onClick={open}>
        <Search className="size-5" />
      </Button>

      {isOpen && (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center gap-1.5 justify-center py-3 px-3 bg-background border-b border-border">
          <SearchSongForm inputRef={inputRef} />
        </div>
      )}
    </div>
  );
};

export { FloatSearchSongForm };
