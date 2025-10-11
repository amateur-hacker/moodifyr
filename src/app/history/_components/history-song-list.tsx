import type { HistorySongSchema, Prettify } from "@/app/_types";
import { HistorySongCard } from "@/app/history/_components/history-song-card";
import type { getUserMoodlists } from "@/app/moodlists/queries";
import { Typography } from "@/components/ui/typography";
import type { getUserSongPlayHistory } from "@/app/history/queries";

type HistorySongListProps = {
  history: Awaited<ReturnType<typeof getUserSongPlayHistory>>;
  moodlists: Awaited<ReturnType<typeof getUserMoodlists>>;
};
const HistorySongList = ({ history, moodlists }: HistorySongListProps) => {
  if (!history) return null;

  return (
    <div className="pb-[var(--player-height,80px)] space-y-10">
      {Object.entries(history).map(([date, songs]) => (
        <div key={date} className="flex flex-col">
          <Typography variant="large" className="mb-2">
            {date}
          </Typography>
          {songs.map((song, i) => (
            <div key={`${song.id}-${i}`}>
              <HistorySongCard song={song} moodlists={moodlists} />
              {i < songs.length - 1 && <div className="my-5 h-px bg-border" />}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export { HistorySongList };
