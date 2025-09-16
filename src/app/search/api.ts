"use server";

import type { Song } from "@/app/search/_types";
import { executeApi } from "@/db/utils";
import { env } from "@/lib/env";
import { encodeQueryParam } from "@/lib/utils";

const searchSong = async ({ query, id }: { query?: string; id?: string }) => {
  if ((!query && !id) || (query && id)) {
    return null;
  }

  const url = query
    ? `${env.API_BASE_URL}/search?q=${encodeQueryParam(query)}`
    : `${env.API_BASE_URL}/search?id=${id}`;

  return executeApi({
    apiFn: async (): Promise<
      { success: true; songs: Song[] } | { success: false; message: string }
    > =>
      (
        await fetch(url, {
          cache: "force-cache",
          next: { revalidate: 10 * 60 },
        })
      ).json(),
    isProtected: false,
    serverErrorMessage: "searchSong",
  });
};

export { searchSong };
