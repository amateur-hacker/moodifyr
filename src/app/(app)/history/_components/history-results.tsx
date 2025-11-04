import { HistorySongList } from "@/app/(app)/history/_components/history-song-list";
import { getUserSongPlayHistory } from "@/app/(app)/history/queries";
import { getUserMoodlists } from "@/app/(app)/moodlists/queries";
import { getUserSession } from "@/app/(app)/queries";
import { Typography } from "@/components/ui/typography";

const HistoryResults = async () => {
  const session = (await getUserSession()) ?? null;

  if (!session?.user) {
    return (
      <Typography variant="lead" className="text-center">
        Please sign in to see your song history.
      </Typography>
    );
  }

  const [songHistory, moodlists] = await Promise.all([
    getUserSongPlayHistory({ page: 1, limit: 25 }).then((res) => res ?? null),
    getUserMoodlists().then((res) => res ?? null),
  ]);

  if (!songHistory || !Object.keys(songHistory).length) {
    return (
      <Typography variant="lead" className="text-center">
        No Song History
      </Typography>
    );
  }

  return <HistorySongList initialHistory={songHistory} moodlists={moodlists} />;
};

export { HistoryResults };
