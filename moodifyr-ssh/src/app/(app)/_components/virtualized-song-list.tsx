import { Virtuoso } from "react-virtuoso";
import type { Prettify, SongSchema } from "@/app/(app)/_types";
import { SongCardLoader } from "./song-card-loader";
import { Spinner } from "@/components/ui/spinner";

const VIRTUALIZE_AFTER = 25;

type VirtualizedSongListBaseProps<T extends SongSchema> = {
  songs: T[];
  renderItem: (song: T, index: number) => React.ReactNode;
  overscan?: number;
  useWindowScroll?: boolean;
};
type InfiniteScroll =
  | {
      endReached: (index: number) => void;
      showLoading: boolean;
    }
  | { endReached?: never; showLoading?: never };

type VirtualizedSongListProps<T extends SongSchema> = Prettify<
  VirtualizedSongListBaseProps<T> & InfiniteScroll
>;
export function VirtualizedSongList<T extends SongSchema>({
  songs,
  renderItem,
  overscan = 400,
  useWindowScroll = true,
  endReached,
  showLoading = false,
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
      endReached={endReached}
      increaseViewportBy={200}
      components={{
        Footer: () => {
          if (showLoading)
            return (
              <div className="flex items-center justify-center py-2 mt-3 text-sm text-muted-foreground gap-2">
                <Spinner />
                Loading...
              </div>
            );
          return null;
        },
      }}
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
