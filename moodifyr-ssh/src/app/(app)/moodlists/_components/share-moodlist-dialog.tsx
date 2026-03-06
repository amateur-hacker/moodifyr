"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Typography } from "@/components/ui/typography";

const ShareMoodlistDialog = ({
  open,
  onOpenChange,
  link,
}: {
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
  link: string;
}) => {
  const allMoodlistsLink = link.substring(0, link.lastIndexOf("/"));
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share link</DialogTitle>
          <DialogDescription>
            Anyone who has this link will be able to view this/all.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <Typography variant="small">View This</Typography>
          <div className="flex items-center gap-2">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="link" className="sr-only">
                Link
              </Label>
              <div className="flex-1 flex items-center gap-2">
                <Input id="link" defaultValue={link} readOnly />
                <CopyButton
                  text={link}
                  size="icon"
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
                  <Link
                    href={link}
                    target="_blank"
                    rel="noreferrer"
                    data-skip-propagation
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink size={16} aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full flex items-center gap-3">
          <div className="h-2 border-b-2 border-dashed flex-1" />
          <Typography variant="body-small" className="font-semibold">
            OR
          </Typography>
          <div className="h-2 border-b-2 border-dashed flex-1" />
        </div>

        <div className="flex flex-col gap-2">
          <Typography variant="small">View All</Typography>
          <div className="flex items-center gap-2">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="all-link" className="sr-only">
                All Link
              </Label>
              <div className="flex-1 flex items-center gap-2">
                <Input id="all-link" defaultValue={allMoodlistsLink} readOnly />
                <CopyButton
                  text={allMoodlistsLink}
                  size="icon"
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
                  <Link
                    href={allMoodlistsLink}
                    target="_blank"
                    rel="noreferrer"
                    data-skip-propagation
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink size={16} aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { ShareMoodlistDialog };
