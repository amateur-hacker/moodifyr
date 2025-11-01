"use client";

import { DeleteAccountDialog } from "@/app/(app)/settings/_components/delete-account-dialog";
import { ResetDataDialog } from "@/app/(app)/settings/_components/reset-data-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";

type SettingsProps = {
  username: string;
};
export const Settings = ({ username }: SettingsProps) => {
  return (
    <Card className="max-w-3xl mx-auto">
      <CardContent className="flex flex-col gap-6">
        <div>
          <Typography variant="large">Reset Data</Typography>
          <Typography variant="body-small" className="text-muted-foreground">
            This will remove all your saved preferences, favourites, moodlists,
            search history and song history.
          </Typography>
          <ResetDataDialog />
        </div>

        <div>
          <Typography variant="large">Delete Account</Typography>
          <Typography variant="body-small" className="text-muted-foreground">
            This will permanently delete your account and all associated data.
          </Typography>
          <DeleteAccountDialog username={username} />
        </div>
      </CardContent>
    </Card>
  );
};
