"use client";

import { PlusIcon, Smile } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createUserMoodlist } from "@/app/moodlists/actions";
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
import { Label } from "@/components/ui/label";
import { Typography } from "@/components/ui/typography";
import { cn, getErrorMessage } from "@/lib/utils";

export const CreateMoodlist = ({ className }: { className?: string }) => {
  const [inputValue, setInputValue] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleCreate = async () => {
    setIsPending(true);
    try {
      const response = await createUserMoodlist({ name: inputValue });
      setInputValue("");
      if (response.success) {
        toast.success(response?.message);
        setIsOpen(false);
      } else {
        toast.error(response?.message);
      }
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      toast(errorMsg);
      // if (err instanceof Error) {
      //   toast.error(err.message);
      // } else {
      //   toast.error("Failed to create moodlist");
      // }
    } finally {
      setIsPending(false);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <_>
  useEffect(() => {
    setInputValue("");
  }, [isOpen]);

  return (
    <div>
      <Typography variant="h3" className="mb-4 font-playful">
        Create Moodlist
      </Typography>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {/* <Button variant="outline" className="cursor-pointer"> */}
          {/*   <PlusIcon className="-ms-1" size={16} aria-hidden="true" /> */}
          {/*   Create Moodlist */}
          {/* </Button> */}
          <Button variant="outline" className="w-max h-max p-0 gap-2 flex-col">
            <div className={cn("cursor-pointer", className)}>
              <PlusIcon className="size-16" aria-hidden="true" />
            </div>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <div className="flex flex-col items-center gap-2">
            <div
              className="flex size-9 shrink-0 items-center justify-center rounded-full border"
              aria-hidden="true"
            >
              <Smile className="opacity-80" size={16} />
            </div>
            <DialogHeader>
              <DialogTitle className="sm:text-center">
                Create Moodlist
              </DialogTitle>
              <DialogDescription className="sm:text-center">
                Name your moodlist to group and play songs that match your vibe.
              </DialogDescription>
            </DialogHeader>
          </div>

          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              handleCreate();
            }}
          >
            <div className="*:not-first:mt-2">
              <Label htmlFor="moodlist-name">Moodlist name</Label>
              <Input
                id="moodlist-name"
                type="text"
                placeholder="e.g. Chill Vibes, Gym Pump, Late Night Drive..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
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
                disabled={!inputValue?.trim().length || isPending}
              >
                {isPending ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
