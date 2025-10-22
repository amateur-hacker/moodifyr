import { Suspense } from "react";
import { SongCardLoader } from "@/app/_components/song-card-loader";
import { SongsSetter } from "@/app/_components/songs-setter";
import { HistorySongList } from "@/app/history/_components/history-song-list";
import { getUserSongPlayHistory } from "@/app/history/queries";
import { getUserMoodlists } from "@/app/moodlists/queries";
import { getUserSession } from "@/app/queries";
import { Typography } from "@/components/ui/typography";

const HistoryPage = async () => {
  const session = (await getUserSession()) ?? null;

  if (!session?.user) {
    return (
      <div className="w-full">
        <Typography variant="lead">
          Please sign in to see your song history.
        </Typography>
      </div>
    );
  }

  const [songHistory, moodlists] = await Promise.all([
    getUserSongPlayHistory({ page: 1, limit: 20 }).then((res) => res ?? null),
    getUserMoodlists().then((res) => res ?? null),
  ]);

  const initialSongs = songHistory ? Object.values(songHistory).flat() : null;

  return (
    <div className="w-full">
      <Typography variant="h2" className="font-playful text-center mb-4">
        History
      </Typography>
      <div className="w-full space-y-5 mx-auto max-w-3xl">
        {songHistory && Object.keys(songHistory).length ? (
          <Suspense
            fallback={
              <div className="space-y-[1.3125rem]">
                {Array.from({ length: 10 }, (_, idx) => idx).map((id) => (
                  <SongCardLoader key={`loader-${id}`} />
                ))}
              </div>
            }
          >
            <SongsSetter songs={initialSongs} />
            <HistorySongList
              initialHistory={songHistory}
              moodlists={moodlists}
            />
          </Suspense>
        ) : (
          <Typography variant="lead" className="text-center">
            No Song History
          </Typography>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
