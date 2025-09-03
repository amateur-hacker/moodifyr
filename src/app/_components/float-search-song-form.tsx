"use client";

import { useClickOutside } from "@mantine/hooks";
import { Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SearchSongForm } from "./search-song-form";

const FloatSearchSongForm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useClickOutside(() => setIsOpen(false));

  return (
    <div className="relative">
      <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)}>
        <Search className="size-5" />
      </Button>

      {isOpen && (
        <div
          className="fixed top-0 left-0 right-0 z-50 flex items-start justify-center py-3 px-3 bg-background border-b border-border"
          ref={ref}
        >
          <SearchSongForm />
        </div>
      )}
    </div>
  );
};

export { FloatSearchSongForm };
