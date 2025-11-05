import { Suspense } from "react";
import { SongCardLoader } from "@/app/(app)/_components/song-card-loader";
import { HistorySongList } from "@/app/(app)/history/_components/history-song-list";
import { getUserSongPlayHistory } from "@/app/(app)/history/queries";
import { getUserMoodlists } from "@/app/(app)/moodlists/queries";
import { getUserSession } from "@/app/(app)/queries";
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
    getUserSongPlayHistory({ page: 1, limit: 25 }).then((res) => res ?? null),
    getUserMoodlists().then((res) => res ?? null),
  ]);

  return (
    <div className="size-full space-y-4">
      <Typography variant="h2" className="font-playful text-center">
        History
      </Typography>
      <div className="size-full mx-auto max-w-3xl pb-[var(--player-height,0px)]">
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
