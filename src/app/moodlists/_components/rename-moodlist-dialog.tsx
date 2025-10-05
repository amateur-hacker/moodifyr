"use client";

import { Edit } from "lucide-react";
import type React from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateUserMoodlistName } from "../actions";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";

const RenameMoodlistDialog = ({
  open,
  onOpenChange,
  prevMoodlistName,
  moodlistId,
}: {
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
  prevMoodlistName: string;
  moodlistId: string;
}) => {
  const [moodlistName, setMoodlistName] = useState(prevMoodlistName);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setMoodlistName(prevMoodlistName);
    }
  }, [open, prevMoodlistName]);

  const handleUpdateMoodlistName = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    setIsLoading(true);
    try {
      e.preventDefault();

      const response = await updateUserMoodlistName({
        id: moodlistId,
        name: moodlistName,
      });
      if (response?.success) {
        onOpenChange(false);
        toast.success("Moodlist name updated!");
      } else {
        toast.error("Failed to update moodlist name");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update moodlist name");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <div className="flex flex-col items-center gap-2">
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-full border"
            aria-hidden="true"
          >
            <Edit className="opacity-80" size={16} />
          </div>
          <DialogHeader>
            <DialogTitle className="sm:text-center">
              Rename Moodlist
            </DialogTitle>
            <DialogDescription className="sm:text-center">
              Choose a new name for your moodlist.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form className="space-y-5" onSubmit={handleUpdateMoodlistName}>
          <div className="*:not-first:mt-2">
            <Label htmlFor="moodlist-name">Moodlist name</Label>
            <Input
              id="moodlist-name"
              type="text"
              placeholder="Enter a new moodlist name"
              value={moodlistName}
              onChange={(e) => setMoodlistName(e.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
          </div>
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
              disabled={moodlistName === prevMoodlistName || isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Spinner />
                  Renaming
                </div>
              ) : (
                "Rename"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export { RenameMoodlistDialog };
