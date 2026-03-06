import { SongCard } from "@/app/(app)/_components/song-card";
import type { DashboardSongSchema } from "@/app/(app)/_types";

type DashboardSongCardProps = {
  song: DashboardSongSchema;
  timesPlayed: number;
};
const DashboardSongCard = ({ song, timesPlayed }: DashboardSongCardProps) => {
  return <SongCard variant="dashboard" song={song} timesPlayed={timesPlayed} />;
};

export { DashboardSongCard };
