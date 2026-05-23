"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { courseSchema, type CourseFormValues } from "@/lib/validations";
import { createCourse, updateCourse } from "@/app/actions/courses";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Course } from "@/types/database";

export function CourseDialog({
  course,
  open,
  onOpenChange,
  triggerLabel, // <-- Use triggerLabel instead of passing a whole button element
}: {
  course?: Course;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerLabel?: string;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined && onOpenChange !== undefined;
  const dialogOpen = isControlled ? open : internalOpen;
  const setDialogOpen = isControlled ? onOpenChange : setInternalOpen;

  const [isPending, startTransition] = useTransition();

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      course_code: course?.course_code || "",
      title: course?.title || "",
      credits: course?.credits || 3,
      faculty: course?.faculty || "Science",
      status: (course?.status as any) || "Planned",
      term: course?.term || "",
      description: course?.description || "",
      prerequisites: course?.prerequisites || "",
      user_notes: course?.user_notes || "",
    },
  });

  useEffect(() => {
    if (dialogOpen) {
      form.reset({
        course_code: course?.course_code || "",
        title: course?.title || "",
        credits: course?.credits || 3,
        faculty: course?.faculty || "Science",
        status: (course?.status as any) || "Planned",
        term: course?.term || "",
        description: course?.description || "",
        prerequisites: course?.prerequisites || "",
        user_notes: course?.user_notes || "",
      });
    }
  }, [dialogOpen, course, form]);

  function onSubmit(data: CourseFormValues) {
    startTransition(async () => {
      try {
        if (course) {
          await updateCourse(course.id, data);
          toast.success("Course updated successfully");
        } else {
          await createCourse(data);
          toast.success("Course added successfully");
        }
        setDialogOpen(false);
      } catch (error: any) {
        toast.error(`Failed to ${course ? "update" : "add"} course`, {
          description: error.message,
        });
      }
    });
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          {/* Render the button purely on the client side using the label */}
          <button className="rounded-lg border border-border/60 px-3 py-2 text-sm transition hover:bg-accent">
            {triggerLabel || "Add course"}
          </button>
        </DialogTrigger>
      )}

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{course ? "Edit course" : "Add course"}</DialogTitle>
          <DialogDescription>
            {course ? "Update your course details." : "Add a new course directly to your academic planner."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 pt-2">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Course code <span className="text-red-500">*</span></label>
              <input
                {...form.register("course_code")}
                placeholder="PSYCH 212"
                disabled={isPending}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none"
              />
              {form.formState.errors.course_code && (
                <span className="text-xs text-red-500">{form.formState.errors.course_code.message}</span>
              )}
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Title <span className="text-red-500">*</span></label>
              <input
                {...form.register("title")}
                placeholder="Intro to Research Methods"
                disabled={isPending}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none"
              />
              {form.formState.errors.title && (
                <span className="text-xs text-red-500">{form.formState.errors.title.message}</span>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Credits <span className="text-red-500">*</span></label>
              <input
                type="number"
                {...form.register("credits", { valueAsNumber: true })}
                disabled={isPending}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none"
              />
              {form.formState.errors.credits && (
                <span className="text-xs text-red-500">{form.formState.errors.credits.message}</span>
              )}
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Faculty <span className="text-red-500">*</span></label>
              <select
                {...form.register("faculty")}
                disabled={isPending}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none"
              >
                <option value="Arts">Arts</option>
                <option value="Science">Science</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Status <span className="text-red-500">*</span></label>
              <select
                {...form.register("status")}
                disabled={isPending}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none"
              >
                <option value="Completed">Completed</option>
                <option value="Planned">Planned</option>
                <option value="Idea Board">Idea Board</option>
              </select>
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium flex justify-between">
              Term <span className="text-muted-foreground font-normal">(Optional)</span>
            </label>
            <input
              {...form.register("term")}
              placeholder="Fall 2026"
              disabled={isPending}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium flex justify-between">
              Description <span className="text-muted-foreground font-normal">(Optional)</span>
            </label>
            <textarea
              {...form.register("description")}
              rows={3}
              placeholder="Optional course description"
              disabled={isPending}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium flex justify-between">
              Prerequisites <span className="text-muted-foreground font-normal">(Optional)</span>
            </label>
            <input
              {...form.register("prerequisites")}
              placeholder="PSYCH 258 or 275"
              disabled={isPending}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none"
            />
          </div>
          
          <div className="grid gap-2">
            <label className="text-sm font-medium flex justify-between">
              User notes <span className="text-muted-foreground font-normal">(Optional)</span>
            </label>
            <textarea
              {...form.register("user_notes")}
              rows={2}
              placeholder="Private notes for yourself"
              disabled={isPending}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
            >
              {isPending ? "Saving..." : course ? "Update course" : "Save course"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}