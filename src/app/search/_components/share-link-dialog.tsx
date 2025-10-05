"use client";

import type { Dispatch, SetStateAction } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CopyButton } from "@/components/ui/shadcn-io/copy-button";

const ShareLinkDialog = ({
  open,
  onOpenChange,
  link,
}: {
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
  link: string;
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share link</DialogTitle>
          <DialogDescription>
            Anyone who has this link will be able to view this.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">
              Link
            </Label>
            <div className="flex-1 flex gap-2">
              <Input id="link" defaultValue={link} readOnly />
              <CopyButton
                content={link}
                size="default"
                className="rounded-md"
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { ShareLinkDialog };
