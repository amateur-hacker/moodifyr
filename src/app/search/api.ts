"use server";

import z from "zod";
import type { SongSchema } from "@/app/_types";
import { executeApi } from "@/db/utils";
import { env } from "@/lib/env";
import { encodeQueryParam } from "@/lib/utils";

const searchSong = async ({ query, id }: { query?: string; id?: string }) => {
  const searchSongSchema = z.object({
    query: z.string().min(1).optional(),
    id: z.string().min(1).optional(),
  });
  // .refine((data) => (data.query && !data.id) || (!data.query && data.id), {
  //   message: "Either 'query' or 'id' must be provided, but not both",
  // });
  const { query: parsedQuery, id: parsedId } = searchSongSchema.parse({
    query,
    id,
  });

  return executeApi({
    apiFn: async (): Promise<
      | { success: true; songs: SongSchema[] }
      | { success: true; song: SongSchema }
      | { success: false; message: string }
    > => {
      const url = parsedQuery
        ? `${env.API_BASE_URL}/search?q=${encodeQueryParam(parsedQuery)}`
        : `${env.API_BASE_URL}/search?id=${parsedId}`;

      const response = (
        await fetch(url, {
          cache: "no-store",
          // cache: "force-cache",
          // next: { revalidate: 24 * 60 * 60 },
        })
      ).json();

      return response;
    },
    isProtected: false,
    serverErrorMessage: "searchSong",
  });
};

export { searchSong };
