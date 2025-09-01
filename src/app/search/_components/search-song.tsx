"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { env } from "@/lib/env";
import { SearchSongForm } from "./search-song-form";

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

function SearchSong() {
  const _id = useId();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialSong = searchParams.get("song") || "";

  const [query, _setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedSong, setSelectedSong] = useState<string | null>(
    initialSong || null,
  );

  // Fetch songs
  const searchSongs = async (q: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${env.NEXT_PUBLIC_API_BASE_URL}/search?q=${encodeURIComponent(q)}`,
      );
      const data = await res.json();
      console.log(data);
      setResults(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submit
  const _handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.replace(`?q=${encodeURIComponent(query)}`);
    searchSongs(query);
  };

  // Handle song click
  const _handleSongClick = (videoId: string) => {
    setSelectedSong(videoId);
    router.replace(`?song=${videoId}`);
  };

  // Auto-load song if URL param exists
  useEffect(() => {
    if (selectedSong) return;
    if (initialQuery) searchSongs(initialQuery);
  }, [initialQuery, selectedSong, searchSongs]);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <SearchSongForm />
      {/* <form onSubmit={handleSubmit}> */}
      {/*   <div className="relative"> */}
      {/*     <Input */}
      {/*       id={id} */}
      {/*       className="peer ps-9 pe-9" */}
      {/*       placeholder="Search..." */}
      {/*       type="search" */}
      {/*       value={query} */}
      {/*       onChange={(e) => setQuery(e.target.value)} */}
      {/*       autoComplete="off" */}
      {/*       spellCheck="false" */}
      {/*     /> */}
      {/*     <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50"> */}
      {/*       <SearchIcon size={16} /> */}
      {/*     </div> */}
      {/*     <button */}
      {/*       className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50" */}
      {/*       aria-label="Submit search" */}
      {/*       type="submit" */}
      {/*     > */}
      {/*       <ArrowRightIcon size={16} aria-hidden="true" /> */}
      {/*     </button> */}
      {/*   </div> */}
      {/* </form> */}

      {loading && <p className="mt-4 text-center">Loading...</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
        {results?.map((song) => (
          <Link key={song.id} href={`/song/${song.id}`}>
            <Card className="cursor-pointer hover:shadow-lg transition">
              <CardContent>
                <img
                  src={song.thumbnail}
                  alt={song.title}
                  className="rounded-md mb-2"
                />
                <h3 className="font-medium">{song.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {song.duration.timestamp}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Full page song modal/view */}
      {/* {selectedSong && ( */}
      {/*   <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"> */}
      {/*     <div className="bg-surface0 rounded-lg p-6 w-full max-w-2xl relative"> */}
      {/*       <button */}
      {/*         className="absolute top-4 end-4 text-white hover:text-red-400" */}
      {/*         onClick={() => { */}
      {/*           setSelectedSong(null); */}
      {/*           router.replace("?q=" + encodeURIComponent(query)); */}
      {/*         }} */}
      {/*       > */}
      {/*         Close */}
      {/*       </button> */}
      {/*       <iframe */}
      {/*         width="100%" */}
      {/*         height="400" */}
      {/*         src={`https://www.youtube.com/embed/${selectedSong}?autoplay=1`} */}
      {/*         title="YouTube video player" */}
      {/*         frameBorder="0" */}
      {/*         allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" */}
      {/*         allowFullScreen */}
      {/*       ></iframe> */}
      {/*     </div> */}
      {/*   </div> */}
      {/* )} */}
    </div>
  );
}

export { SearchSong };
