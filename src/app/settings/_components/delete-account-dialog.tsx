"use client";

import { Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { deleteUserAccount } from "@/app/settings/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

type DeleteAccountDialogProps = {
  username: string;
};
export const DeleteAccountDialog = ({ username }: DeleteAccountDialogProps) => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) setInput("");
  }, [open]);

  const handleDelete = async () => {
    if (input !== username) {
      toast.error(`Please type your username "${username}" to confirm.`);
      return;
    }

    setIsLoading(true);
    try {
      await deleteUserAccount();
      toast.success("Account deleted successfully!");
      setOpen(false);
      window.location.href = "/";
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete account.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mt-2 cursor-pointer" variant="destructive">
          Delete My Account
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center gap-2">
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-full border"
            aria-hidden="true"
          >
            <Trash className="opacity-80" size={16} />
          </div>
        </div>

        <DialogHeader>
          <DialogTitle className="text-center">
            Confirm Account Deletion
          </DialogTitle>
          <DialogDescription className="text-center">
            Type your username <strong>{username}</strong> to confirm.
          </DialogDescription>
        </DialogHeader>

        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={username}
        />

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
            onClick={handleDelete}
            disabled={input !== username || isLoading}
            variant="default"
            className="flex-1 cursor-pointer"
          >
            {isLoading ? (
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
