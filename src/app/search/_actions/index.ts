import { env } from "@/lib/env";
import { executeApi } from "@/utils/execute-api";
import { encodeQueryParam } from "@/utils/url";

type Song = {
  id: string;
  title: string;
  url: string;
  duration: {
    timestamp: string;
    seconds: number;
  };
  views: number;
  author: string;
  thumbnail: string;
};

type SearchSongArgs = {
  query?: string;
  id?: string;
};
const searchSong = async ({ query, id }: SearchSongArgs) => {
  // if (!query && !id) {
  //   throw new Error("searchSong requires either query or id");
  // }
  //
  // if (query && id) {
  //   throw new Error("searchSong requires either query or id, but not both");
  // }

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
