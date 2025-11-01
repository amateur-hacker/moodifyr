"use client";

import { ExternalLink, Share2 } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { Button } from "@/components/ui/button";
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
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
  link: string;
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center gap-2">
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-full border"
            aria-hidden="true"
          >
            <Share2 className="opacity-80" size={16} />
          </div>
          <DialogHeader>
            <DialogTitle className="text-center">Share link</DialogTitle>
            <DialogDescription className="text-center">
              Anyone who has this link will be able to view this.
            </DialogDescription>
          </DialogHeader>
        </div>

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
                title="Copy link"
              />

              <Button
                variant="outline"
                size="icon"
                className="rounded-md"
                aria-label="Open shared link in new tab"
                title="Open shared link"
                asChild
              >
                <Link href={link} target="_blank" rel="noreferrer">
                  <ExternalLink size={16} aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { ShareLinkDialog };
