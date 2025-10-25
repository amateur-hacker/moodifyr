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
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { capitalCase } from "change-case";

const formSchema = z.object({
  moodlistName: z
    .string({ error: "Moodlist name is required" })
    .min(1, { message: "Moodlist name is required" })
    .min(3, { message: "Must be at least 3 characters." })
    .max(50, { message: "Must be at most 50 characters." })
    .transform((val) => capitalCase(val)),
});

export const CreateMoodlist = ({ className }: { className?: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      moodlistName: "",
    },
    // mode: "onChange",
  });
  const { isSubmitting } = form.formState;

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const { moodlistName } = data;
    try {
      const response = await createUserMoodlist({ name: moodlistName });
      if (response.success) {
        toast.success("Moodlist created successfully!");
        setIsOpen(false);
        form.reset();
      } else if (response?.message?.includes("already")) {
        toast.warning("This moodlist already exists.");
      } else {
        toast.error("Couldn't create moodlist. Please try again.");
      }
    } catch (error) {
      console.error("Error creating moodlist:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <_>
  useEffect(() => {
    form.reset();
  }, [isOpen]);

  return (
    <div>
      <Typography variant="h3" className="mb-4 font-playful">
        Create Moodlist
      </Typography>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-max h-max p-0 gap-2 flex-col"
            title="Create Moodlist"
          >
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

          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <Controller
              name="moodlistName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="moodlistName">Moodlist Name</FieldLabel>
                  <Input
                    {...field}
                    id="moodlistName"
                    aria-invalid={fieldState.invalid}
                    placeholder="e.g. Chill Vibes, Gym Pump, Late Night Drive..."
                    autoComplete="off"
                    spellCheck={false}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
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
                type="submit"
                className="flex-1 cursor-pointer"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
