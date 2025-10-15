import type { SongWithUniqueIdSchema } from "@/app/_types";
import youtubePlayer from "youtube-player";

const getSongInstanceId = (song: SongWithUniqueIdSchema) =>
  song.historyId ||
  song.favouriteId ||
  song.moodlistSongId ||
  song.searchId ||
  song.id;

export { getSongInstanceId };
