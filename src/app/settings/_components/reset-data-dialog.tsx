"use client";

import { RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { resetUserData } from "@/app/settings/actions";
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

const ResetDataDialog = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) setInput("");
  }, [open]);

  const handleReset = async () => {
    if (input !== "Reset My Data") {
      toast.error('Please type "Reset My Data" to confirm.');
      return;
    }
    setIsLoading(true);
    try {
      await resetUserData();
      toast.success("Your data has been reset successfully!");
      setOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to reset data.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mt-2 cursor-pointer" variant="destructive">
          Reset My Data
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center gap-2">
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-full border"
            aria-hidden="true"
          >
            <RefreshCcw className="opacity-80" size={16} />
          </div>
        </div>

        <DialogHeader>
          <DialogTitle className="text-center">Confirm Reset</DialogTitle>
          <DialogDescription className="text-center">
            Type <strong>Reset My Data</strong> to confirm.
          </DialogDescription>
        </DialogHeader>

        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Reset My Data"
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
            onClick={handleReset}
            disabled={input !== "Reset My Data" || isLoading}
            variant="default"
            className="flex-1 cursor-pointer"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <Spinner />
                Resetting
              </div>
            ) : (
              "Reset"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { ResetDataDialog };
