import { HistorySongCard } from "@/app/history/_components/history-song-card";
import type { SongHistory } from "@/app/history/_types";
import { Typography } from "@/components/ui/typography";

type HistorySongListProps = {
  songs: SongHistory | null;
};
const HistorySongList = ({ songs }: HistorySongListProps) => {
  if (!songs) return null;

  return (
    <div className="pb-[var(--player-height,80px)] space-y-10">
      {Object.entries(songs).map(([date, songs]) => (
        <div key={date} className="flex flex-col gap-5">
          <Typography variant="large">{date}</Typography>
          {songs.map((song, i) => (
            <div key={`${song.id}-${i}`}>
              <HistorySongCard song={song} />
              {i < songs.length - 1 && <div className="my-5 h-px bg-border" />}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export { HistorySongList };
