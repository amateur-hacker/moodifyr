"use client";

import { createContext, useContext, useState } from "react";

type FloatSearchBarContextType = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

const FloatSearchBarContext = createContext<FloatSearchBarContextType | null>(
  null,
);

export const FloatSearchBarProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen((prev) => !prev);

  return (
    <FloatSearchBarContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
    </FloatSearchBarContext.Provider>
  );
};

export const useFloatSearchBar = () => {
  const ctx = useContext(FloatSearchBarContext);
  if (!ctx)
    throw new Error("useSearchBar must be used within <SearchBarProvider>");
  return ctx;
};
