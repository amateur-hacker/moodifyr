import { Virtuoso } from "react-virtuoso";
import type { SongSchema } from "@/app/(app)/_types";
import { SongCardLoader } from "./song-card-loader";

const VIRTUALIZE_AFTER = 15;

type VirtualizedSongListProps<T extends SongSchema> = {
  songs: T[];
  renderItem: (song: T, index: number) => React.ReactNode;
  overscan?: number;
  useWindowScroll?: boolean;
};

export function VirtualizedSongList<T extends SongSchema>({
  songs,
  renderItem,
  overscan = 400,
  useWindowScroll = true,
}: VirtualizedSongListProps<T>) {
  if (songs.length <= VIRTUALIZE_AFTER) {
    return (
      <div className="h-full">
        {songs.map((song, i) => (
          <div key={song.id} className="flex flex-col">
            {renderItem(song, i)}
            {i < songs.length - 1 && <div className="my-5 h-px bg-border" />}
          </div>
        ))}
      </div>
    );
  }

  return (
    <Virtuoso
      className="h-full"
      useWindowScroll={useWindowScroll}
      data={songs}
      overscan={overscan}
      initialItemCount={Math.min(VIRTUALIZE_AFTER, songs.length)}
      defaultItemHeight={88}
      // components={{
      //   Footer: () => <div className="pb-[var(--player-height,0px)]" />,
      // EmptyPlaceholder: () => <SongCardLoader />,
      // }}
      itemContent={(i, song) => {
        if (!song) return <SongCardLoader />;

        return (
          <div className="flex flex-col">
            {renderItem(song, i)}
            {i < songs.length - 1 && <div className="my-5 h-px bg-border" />}
          </div>
        );
      }}
    />
  );
}
