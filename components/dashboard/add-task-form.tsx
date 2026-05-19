"use client";

import { useRef, useState, useTransition } from "react";
import { createTask } from "@/app/actions/tasks";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type TaskCourseOption = {
  id: string;
  course_code: string;
  title: string;
};

interface AddTaskFormProps {
  courses: TaskCourseOption[];
}

export function AddTaskForm({ courses }: AddTaskFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await createTask(formData);
        toast.success("Task added successfully");
        formRef.current?.reset();
        setOpen(false);
      } catch (error: any) {
        toast.error("Failed to add task", {
          description: error.message,
        });
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="rounded-lg border border-border/60 px-3 py-2 text-sm transition hover:bg-accent">
          Add task
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Add task</DialogTitle>
          <DialogDescription>
            Add a new task and link it to one of your tracked courses.
          </DialogDescription>
        </DialogHeader>

        <form ref={formRef} action={handleSubmit} className="grid gap-4 pt-2">
          <div className="grid gap-2">
            <label htmlFor="title" className="text-sm font-medium">
              Task title
            </label>
            <input
              id="title"
              name="title"
              placeholder="Midterm reflection paper"
              required
              disabled={isPending}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="course_id" className="text-sm font-medium">
              Course
            </label>
            <select
              id="course_id"
              name="course_id"
              required
              defaultValue=""
              disabled={isPending}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none disabled:opacity-50"
            >
              <option value="" disabled>
                Select a course
              </option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.course_code} · {course.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <label htmlFor="due_date" className="text-sm font-medium">
              Due date
            </label>
            <input
              id="due_date"
              name="due_date"
              type="date"
              disabled={isPending}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none disabled:opacity-50"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Adding..." : "Save task"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}