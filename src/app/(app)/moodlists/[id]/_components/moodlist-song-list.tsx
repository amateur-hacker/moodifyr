import { VirtualizedSongList } from "@/app/(app)/_components/virtualized-song-list";
import type { MoodlistSongSchema } from "@/app/(app)/_types";
import { MoodlistSongCard } from "@/app/(app)/moodlists/[id]/_components/moodlist-song-card";

type MoodlistSongListProps = {
  songs: MoodlistSongSchema[];
  moodlistId: string;
  moodlistType: "owned" | "followed";
};
const MoodlistSongList = ({
  songs,
  moodlistId,
  moodlistType,
}: MoodlistSongListProps) => {
  return (
    <VirtualizedSongList
      songs={songs}
      renderItem={(song) => (
        <MoodlistSongCard
          song={song}
          moodlistId={moodlistId}
          moodlistType={moodlistType}
        />
      )}
    />
  );
};

export { MoodlistSongList };
