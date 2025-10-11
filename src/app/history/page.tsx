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
    getUserSongPlayHistory().then((res) => res ?? null),
    getUserMoodlists().then((res) => res ?? null),
  ]);

  const initialSongs = songHistory ? Object.values(songHistory).flat() : null;

  return (
    <div className="w-full">
      <Typography variant="h2" className="font-playful text-center mb-4">
        History
      </Typography>
      {songHistory && Object.keys(songHistory).length ? (
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
            <SongsSetter songs={initialSongs} />
            <HistorySongList history={songHistory} moodlists={moodlists} />
          </Suspense>
        </div>
      ) : (
        <Typography variant="lead">No Song History</Typography>
      )}
    </div>
  );
};

export default HistoryPage;
