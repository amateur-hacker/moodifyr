import type { SongSchema } from "@/app/_types";
import { MoodlistSongCard } from "./moodlist-song-card";
import { Typography } from "@/components/ui/typography";
import { GlitchText } from "@/components/ui/shadcn-io/glitch-text";
import { Badge } from "@/components/ui/badge";
import { Music, Smile } from "lucide-react";

// import { TypingAnimation } from "@/components/ui/typing-animation";

type MoodlistSongListProps = {
  // songs:
  //   | {
  //       id: string;
  //       song: SongSchema;
  //     }[]
  //   | null;
  songs: (SongSchema & { moodlistSongId: string })[];
  moodlistName: string;
  moodlistId: string;
};
const MoodlistSongList = async ({ songs }: MoodlistSongListProps) => {
  return (
    <div className="pb-[var(--player-height,80px)]">
      {/* {songs?.length && ( */}
      {/*   <TypingAnimation startOnView={true} className="text-lg font-semibold"> */}
      {/*     {`${songs.length} Search Results...`} */}
      {/*   </TypingAnimation> */}
      {/* )} */}
      {/* <Typography variant="h4" className="mb-4"> */}
      {/*   {moodlistName} */}
      {/* </Typography> */}
      {/* <div className="w-max mx-auto"> */}
      {/*   <Badge variant="outline"> */}
      {/*     <Smile */}
      {/*       className="-ms-0.5 text-emerald-500" */}
      {/*       size={12} */}
      {/*       aria-hidden="true" */}
      {/*     /> */}
      {/*     Moodlist */}
      {/*   </Badge> */}
      {/* </div> */}
      {/* <GlitchText */}
      {/*   speed={1} */}
      {/*   enableShadows={true} */}
      {/*   enableOnHover={false} */}
      {/*   className="mb-4 text-center after:left-0 after:right-0 after:m-auto after:translate-x-[10px] before:left-0 before:right-0 before:m-auto before:-translate-x-[10px] !cursor-default font-playful" */}
      {/* > */}
      {/*   {moodlistName} */}
      {/* </GlitchText> */}
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
