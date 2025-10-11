import type { HistorySongSchema, Prettify } from "@/app/_types";
import { HistorySongCard } from "@/app/history/_components/history-song-card";
// import { GlitchText } from "@/components/ui/shadcn-io/glitch-text";
import { Typography } from "@/components/ui/typography";

type HistorySongListProps = {
  songs: Prettify<Record<string, HistorySongSchema[]>>;
};
const HistorySongList = ({ songs }: HistorySongListProps) => {
  if (!songs) return null;

  return (
    <div className="pb-[var(--player-height,80px)] space-y-10">
      {/* <Typography variant="h2" className="mb-4 text-center font-retro"> */}
      {/*   History */}
      {/* </Typography> */}
      {/* <GlitchText */}
      {/*   speed={1} */}
      {/*   enableShadows={true} */}
      {/*   enableOnHover={false} */}
      {/*   className="mb-4 text-center after:left-0 after:right-0 after:m-auto after:translate-x-[10px] before:left-0 before:right-0 before:m-auto before:-translate-x-[10px]" */}
      {/* > */}
      {/*   History */}
      {/* </GlitchText> */}
      {Object.entries(songs).map(([date, songs]) => (
        <div key={date} className="flex flex-col">
          <Typography variant="large" className="mb-2">
            {date}
          </Typography>
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
