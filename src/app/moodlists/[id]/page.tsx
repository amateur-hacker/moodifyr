import { Smile } from "lucide-react";
import { Suspense } from "react";
import { PlayHeader } from "@/app/_components/play-header";
import { SongCardLoader } from "@/app/_components/song-card-loader";
import { SongsSetter } from "@/app/_components/songs-setter";
import { MoodlistSongList } from "@/app/moodlists/[id]/_components/moodlist-song-list";
import {
  getUserMoodlistSongs,
  getUserMoodlistSongsStats,
} from "@/app/moodlists/queries";
import { getUserSession } from "@/app/queries";
import { Badge } from "@/components/ui/badge";
import { Typography } from "@/components/ui/typography";

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

  const [moodlistSongs, moodlistSongsStats] = await Promise.all([
    getUserMoodlistSongs({ moodlistId }).then((res) => res ?? null),
    getUserMoodlistSongsStats({ moodlistId }).then((res) => res ?? null),
  ]);
  // const moodlistSongs = (await getUserMoodlistSongs({ moodlistId })) ?? null;

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
      {moodlistSongs && (
        <>
          <div className="mb-4">
            <Typography variant="h2" className="font-playful text-center">
              {moodlistSongs.name}
            </Typography>
            {moodlistSongsStats?.totalSongs && moodlistSongsStats.totalTime && (
              <PlayHeader
                songs={moodlistSongs?.songs}
                totalSongs={moodlistSongsStats.totalSongs}
                totalTime={moodlistSongsStats.totalTime}
                className="text-center"
              />
            )}
          </div>
          <div className="w-full space-y-5 mx-auto max-w-3xl">
            {moodlistSongs.songs.length > 0 ? (
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
                <SongsSetter songs={moodlistSongs.songs} />
              </Suspense>
            ) : (
              <Typography variant="lead" className="text-center">
                No Moodlist Songs
              </Typography>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MoodlistIdPage;
