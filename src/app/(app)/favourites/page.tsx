import { Suspense } from "react";
import { SongCardLoader } from "@/app/(app)/_components/song-card-loader";
import { FavResults } from "@/app/(app)/favourites/_components/fav-results";
import { getUserSession } from "@/app/(app)/queries";
import { Typography } from "@/components/ui/typography";

const FavSongsPage = async () => {
  const session = await getUserSession();

  if (!session?.user) {
    return (
      <div className="w-full">
        <Typography variant="lead">
          Please sign in to see your favourite songs.
        </Typography>
      </div>
    );
  }

  return (
    <div className="size-full space-y-2">
      <Typography variant="h2" className="font-playful text-center">
        Favourites
      </Typography>

      <div className="size-full mx-auto max-w-3xl pb-[var(--player-height,0px)]">
        <Suspense
          fallback={
            <div className="space-y-4">
              <div className="text-center">Loading...</div>
              <div className="space-y-[1.3125rem]">
                {Array.from({ length: 10 }).map((_, id) => (
                  <SongCardLoader key={`loader-${id}`} showHeart />
                ))}
              </div>
            </div>
          }
        >
          <FavResults />
        </Suspense>
      </div>
    </div>
  );
};

export default FavSongsPage;
