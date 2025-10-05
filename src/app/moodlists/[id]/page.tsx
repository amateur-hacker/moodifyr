import { SongsSetter } from "@/app/_components/songs-setter";
import { getMoodlistById, getUserMoodlistSongs } from "../queries";
import { MoodlistSongList } from "./_components/moodlist-song-list";
import { SongCardLoader } from "@/app/_components/song-card-loader";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { Typography } from "@/components/ui/typography";
import { Music, Smile } from "lucide-react";
import { getUserSession } from "@/app/queries";

const MoodlistIdPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const session = (await getUserSession()) ?? null;

  if (!session?.user) {
    return (
      <div className="w-full mt-15">
        <Typography variant="lead">
          Please sign in to see moodlist songs page.
        </Typography>
      </div>
    );
  }

  const { id: moodlistId } = await params;

  // const moodlistSongs = (await getUserMoodlistSongs({ moodlistId })) ?? null;
  // if (!moodlistSongs) return null;
  let moodlistSongs = null;
  let hasError = false;

  try {
    moodlistSongs = await getUserMoodlistSongs({ moodlistId });
  } catch (error) {
    console.error("Error fetching moodlist:", error);
    hasError = true;
  }

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Typography variant="h3" className="font-semibold">
          Something went wrong 😔
        </Typography>
        <Typography variant="muted">
          Try refreshing the page or coming back later.
        </Typography>
      </div>
    );
  }

  if (!moodlistSongs) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Typography variant="h3" className="font-semibold">
          Moodlist not found
        </Typography>
        <Typography variant="muted">
          It may have been deleted or made private by the owner.
        </Typography>
      </div>
    );
  }

  const songs = moodlistSongs.songs.map((item) => ({
    id: item.id,
    moodlistSongId: item.moodlistSongId,
    title: item.title,
    thumbnail: item.thumbnail,
    duration: item.duration,
  }));

  return (
    <div className="w-full">
      <div className="w-max mx-auto">
        <Badge variant="outline">
          <Smile
            className="-ms-0.5 text-emerald-500"
            size={12}
            aria-hidden="true"
          />
          Moodlist
        </Badge>
      </div>
      <Typography variant="h2" className="font-playful text-center mb-4">
        {moodlistSongs.name}
      </Typography>
      <div className="w-full space-y-5 mx-auto max-w-3xl">
        <Suspense
          fallback={
            <div className="space-y-[1.3125rem]">
              {Array.from({ length: 10 }, (_, idx) => idx).map((id) => (
                <SongCardLoader key={`loader-${id}`} />
              ))}
            </div>
          }
        >
          <MoodlistSongList
            songs={moodlistSongs.songs}
            moodlistName={moodlistSongs.name}
            moodlistId={moodlistId}
            moodlistType={moodlistSongs.type}
          />
          <SongsSetter songs={songs} />
        </Suspense>
      </div>
    </div>
  );
};

export default MoodlistIdPage;
