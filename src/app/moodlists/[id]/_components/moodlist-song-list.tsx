import type { MoodlistSongSchema } from "@/app/_types";
import { MoodlistSongCard } from "@/app/moodlists/[id]/_components/moodlist-song-card";

type MoodlistSongListProps = {
  songs: MoodlistSongSchema[] | null;
  moodlistName: string;
  moodlistId: string;
  moodlistType: "owned" | "followed";
};
const MoodlistSongList = ({
  songs,
  moodlistId,
  moodlistType,
}: MoodlistSongListProps) => {
  return (
    <div className="pb-[var(--player-height,80px)]">
      {songs?.map((song, i) => (
        <div key={song.id} className="flex flex-col">
          <MoodlistSongCard
            song={song}
            moodlistId={moodlistId}
            moodlistType={moodlistType}
          />
          {i < songs.length - 1 && <div className="my-5 h-px bg-border" />}
        </div>
      ))}
    </div>
  );
};

export { MoodlistSongList };
