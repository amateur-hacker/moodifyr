import { getUserSession } from "@/app/(app)/queries";
import { Settings } from "@/app/(app)/settings/_components/settings";
import { Typography } from "@/components/ui/typography";

const SettingsPage = async () => {
  const session = (await getUserSession()) ?? null;

  if (!session?.user) {
    return (
      <div className="w-full">
        <Typography variant="lead">
          Please sign in to see your settings page.
        </Typography>
      </div>
    );
  }
  return (
    <div>
      <Typography variant="h2" className="font-playful text-center mb-4">
        Settings
      </Typography>
      <Settings username={session.user.name} />
    </div>
  );
};

export default SettingsPage;
