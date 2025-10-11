"use client";

import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import type { SongSchema } from "@/app/_types";
import { addUserSongToMoodlist } from "@/app/moodlists/actions";
import type { getUserMoodlists } from "@/app/moodlists/queries";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";

const AddToMoodlistDialog = ({
  open,
  onOpenChange,
  moodlists,
  songId,
  song,
}: {
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
  // moodlists: SelectMoodlistModel[] | null;
  moodlists: Awaited<ReturnType<typeof getUserMoodlists>>;
  songId: string;
  song: SongSchema;
}) => {
  const [selectedMoodlist, setSelectedMoodlist] = useState(
    moodlists?.[0]?.id ?? "",
  );
  const [loading, setLoading] = useState(false);

  const ownedMoodlists = moodlists?.filter((m) => m.type === "owned") ?? null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMoodlist) return;

    const selectedMoodlistItem = ownedMoodlists?.find(
      (m) => m.id === selectedMoodlist,
    );

    setLoading(true);
    try {
      const response = await addUserSongToMoodlist({
        moodlistId: selectedMoodlist,
        songId,
        song,
      });

      if (response.success) {
        toast.success(
          <span>
            Added to <strong>{selectedMoodlistItem?.name ?? "Unknown"}</strong>{" "}
            moodlist
          </span>,
        );
        onOpenChange(false);
      } else {
        if (response.message.includes("already")) {
          toast.warning(
            <span>
              Already exists in{" "}
              <strong>{selectedMoodlistItem?.name ?? "Unknown"}</strong>{" "}
              moodlist
            </span>,
          );
        }
      }
    } catch (err) {
      console.error(err);
      toast.error(
        <span>
          Failed to add to{" "}
          <strong>{selectedMoodlistItem?.name ?? "Unknown"}</strong> moodlist
        </span>,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <div className="mb-2 flex flex-col gap-2">
          <DialogHeader>
            <DialogTitle className="text-left">
              Choose your moodlist
            </DialogTitle>
            <DialogDescription className="text-left">
              Pick one of the following moodlist.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <ScrollArea viewPortClassName="max-h-36 h-full pr-3">
            <RadioGroup
              className="gap-2"
              value={selectedMoodlist}
              onValueChange={setSelectedMoodlist}
              defaultValue={ownedMoodlists?.[0]?.id ?? ""}
            >
              {ownedMoodlists?.map((m) => (
                <div
                  className="border-input has-data-[state=checked]:border-primary/50 has-data-[state=checked]:bg-accent relative flex w-full items-center gap-2 rounded-md border px-4 py-3 shadow-xs outline-none"
                  key={m.id}
                >
                  <RadioGroupItem
                    value={m.id}
                    id={m.id}
                    aria-describedby={m.name}
                    className="order-1 after:absolute after:inset-0 cursor-pointer"
                  />
                  <div className="grid grow gap-1">
                    <Label htmlFor={m.id}>{m.name}</Label>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </ScrollArea>

          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className="flex-1 cursor-pointer"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              className="flex-1 cursor-pointer"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
export { AddToMoodlistDialog };
