import { Skeleton } from "@/components/ui/skeleton";
import { Heart } from "lucide-react";

const SongCardLoader = ({ showHeart = false }: { showHeart?: boolean }) => {
  return (
    <div className="flex flex-row items-center gap-2.5 sm:gap-5">
      <div className="flex w-full items-center gap-2.5">
        <Skeleton className=" w-[120px] h-[60px] sm:w-[150px] sm:h-[75px] aspect-[2/1.2] rounded-md" />
        <div className="flex w-full flex-col gap-2">
          <Skeleton className="h-4 w-[90%]" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>

      {showHeart && (
        <Skeleton className="heart h-5.5 mr-4 self-end rounded-none" />
      )}
    </div>
  );
};

export { SongCardLoader };
