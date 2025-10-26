import type { MoodlistSongSchema } from "@/app/_types";
import { MoodlistSongCard } from "@/app/moodlists/user/[userId]/[moodlistId]/_components/moodlist-song-card";

type MoodlistSongListProps = {
  songs: MoodlistSongSchema[];
  moodlistName: string;
  moodlistId: string;
};
const MoodlistSongList = ({ songs }: MoodlistSongListProps) => {
  return (
    <div className="pb-[var(--player-height,0px)]">
      {songs?.map((song, i) => (
        <div key={song.id} className="flex flex-col">
          <MoodlistSongCard song={song} />
          {i < songs.length - 1 && <div className="my-5 h-px bg-border" />}
        </div>
      ))}
    </div>
  );
};

export { MoodlistSongList };
