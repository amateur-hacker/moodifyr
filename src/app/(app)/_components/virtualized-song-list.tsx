import { Fragment } from "react";
import { Virtuoso } from "react-virtuoso";
import type { SongSchema } from "@/app/(app)/_types";

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
      // components={{
      //   Footer: () => <div className="pb-[var(--player-height,0px)]" />,
      // }}
      itemContent={(i, song) => (
        <div className="flex flex-col">
          {renderItem(song, i)}
          {i < songs.length - 1 && <div className="my-5 h-px bg-border" />}
        </div>
      )}
    />
  );
}
