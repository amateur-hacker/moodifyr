import { SongsSetter } from "@/app/_components/songs-setter";
import { HistorySongList } from "@/app/history/_components/history-song-list";
import { getUserSongPlayHistory } from "@/app/history/queries";
import { getUserSession } from "@/app/queries";
import { Typography } from "@/components/ui/typography";

const HistoryPage = async () => {
  const session = (await getUserSession()) ?? null;

  if (!session) {
    return (
      <div className="w-full">
        <Typography variant="lead">
          Please sign in to see your song history.
        </Typography>
      </div>
    );
  }

  const songHistory = (await getUserSongPlayHistory()) ?? null;
  console.log(songHistory);

  const initialSongs = songHistory ? Object.values(songHistory).flat() : null;

  return (
    <div className="w-full">
      {songHistory && Object.keys(songHistory).length ? (
        <div className="w-full space-y-5 mx-auto max-w-3xl">
          <SongsSetter songs={initialSongs} />
          <HistorySongList songs={songHistory} />
        </div>
      ) : (
        <Typography variant="lead">No Song History</Typography>
      )}
    </div>
  );
};

export default HistoryPage;
