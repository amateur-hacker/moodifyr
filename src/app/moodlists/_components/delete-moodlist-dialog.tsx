"use client";

import { Trash } from "lucide-react";
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
import { toast } from "sonner";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { deleteUserMoodlist } from "../actions";

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

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await deleteUserMoodlist({ id: moodlistId });
      if (response?.success) {
        onOpenChange(false);
        toast.success(`"${moodlistName}" has been deleted.`);
      } else {
        toast.error(`Failed to delete "${moodlistName}".`);
      }
    } catch (error) {
      console.error(error);
      toast.error(`Failed to delete "${moodlistName}".`);
    } finally {
      setIsDeleting(false);
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
            <Trash className="opacity-80" size={16} />
          </div>
          <DialogHeader>
            <DialogTitle className="sm:text-center">
              Delete Moodlist
            </DialogTitle>
            <DialogDescription className="sm:text-center">
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
