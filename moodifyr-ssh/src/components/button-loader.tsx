const ButtonLoader = ({
  loadingText = "Loading...",
}: {
  loadingText?: string;
}) => {
  return (
    <div className="flex items-center gap-2">
      <div className="h-4 w-4 animate-spin rounded-full border-black border-b-2 dark:border-white" />
      {loadingText}
    </div>
  );
};

export { ButtonLoader };
