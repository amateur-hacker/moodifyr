"use client";

import { Trash } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { deleteUserMoodlist } from "@/app/moodlists/actions";
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
import { Spinner } from "@/components/ui/spinner";

const DeleteMoodlistDialog = ({
  open,
  onOpenChange,
  moodlistName,
  moodlistId,
}: {
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
  moodlistName: string;
  moodlistId: string;
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e.stopPropagation();
    setIsDeleting(true);

    try {
      const response = await deleteUserMoodlist({ id: moodlistId });

      if (response?.success) {
        onOpenChange(false);
        toast.success(`"${moodlistName}" deleted successfully!`);
      } else {
        toast.error(`Couldn't delete "${moodlistName}". Please try again.`);
      }
    } catch (error) {
      console.error("Error deleting moodlist:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center gap-2">
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-full border"
            aria-hidden="true"
          >
            <Trash className="opacity-80" size={16} />
          </div>
          <DialogHeader>
            <DialogTitle className="text-center">Delete Moodlist</DialogTitle>
            <DialogDescription className="text-center">
              Are you sure you want to delete <strong>{moodlistName}</strong>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
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
            type="button"
            className="flex-1 cursor-pointer"
            onClick={handleDelete}
            disabled={isDeleting}
            data-skip-propagation
          >
            {isDeleting ? (
              <div className="flex items-center justify-center gap-2">
                <Spinner />
                Deleting
              </div>
            ) : (
              "Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { DeleteMoodlistDialog };
