"use client";

import { createContext, useContext, useState, useCallback } from "react";
import type React from "react";

type FavouriteContextType = {
  favouriteSongs: Record<string, boolean>;
  isFavouritePending: Record<string, boolean>;
  setFavourite: (songId: string, fav: boolean) => void;
  setFavouritePending: (songId: string, pending: boolean) => void;
};

const FavouriteContext = createContext<FavouriteContextType | null>(null);

export function FavouriteProvider({ children }: { children: React.ReactNode }) {
  const [favouriteSongs, setFavouriteSongs] = useState<Record<string, boolean>>(
    {},
  );
  const [isFavouritePending, setIsFavouritePending] = useState<
    Record<string, boolean>
  >({});

  const setFavourite = useCallback((songId: string, fav: boolean) => {
    setFavouriteSongs((prev) => ({ ...prev, [songId]: fav }));
  }, []);

  const setFavouritePending = useCallback(
    (songId: string, pending: boolean) => {
      setIsFavouritePending((prev) => ({ ...prev, [songId]: pending }));
    },
    [],
  );

  return (
    <FavouriteContext.Provider
      value={{
        favouriteSongs,
        isFavouritePending,
        setFavourite,
        setFavouritePending,
      }}
    >
      {children}
    </FavouriteContext.Provider>
  );
}

export const useFavourites = () => {
  const ctx = useContext(FavouriteContext);
  if (!ctx)
    throw new Error("useFavourites must be used within FavouriteProvider");
  return ctx;
};
