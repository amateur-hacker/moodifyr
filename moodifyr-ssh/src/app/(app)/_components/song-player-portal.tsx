// song-player-portal.tsx
"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

export const SongPlayerPortal = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const container = document.getElementById("global-song-player-root");
  if (!container) return null;

  return createPortal(children, container);
};
