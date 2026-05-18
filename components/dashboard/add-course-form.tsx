"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { createCourse } from "@/app/actions/courses";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Adding..." : "Save course"}
    </button>
  );
}

export function AddCourseForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);

  async function action(formData: FormData) {
    await createCourse(formData);
    formRef.current?.reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="rounded-lg border border-border/60 px-3 py-2 text-sm transition hover:bg-accent">
          Add course
        </button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add course</DialogTitle>
          <DialogDescription>
            Add a new course directly to your academic planner.
          </DialogDescription>
        </DialogHeader>

        <form ref={formRef} action={action} className="grid gap-4 pt-2">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <label htmlFor="course_code" className="text-sm font-medium">
                Course code
              </label>
              <input
                id="course_code"
                name="course_code"
                placeholder="PSYCH 212"
                required
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>
              <input
                id="title"
                name="title"
                placeholder="Intro to Research Methods"
                required
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <label htmlFor="credits" className="text-sm font-medium">
                Credits
              </label>
              <input
                id="credits"
                name="credits"
                type="number"
                min="0"
                defaultValue="3"
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="faculty" className="text-sm font-medium">
                Faculty
              </label>
              <select
                id="faculty"
                name="faculty"
                defaultValue="Science"
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none"
              >
                <option value="Arts">Arts</option>
                <option value="Science">Science</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="grid gap-2">
              <label htmlFor="status" className="text-sm font-medium">
                Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue="Planned"
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none"
              >
                <option value="Completed">Completed</option>
                <option value="Planned">Planned</option>
                <option value="Idea Board">Idea Board</option>
              </select>
            </div>
          </div>

          <div className="grid gap-2">
            <label htmlFor="term" className="text-sm font-medium">
              Term
            </label>
            <input
              id="term"
              name="term"
              placeholder="Fall 2026"
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Optional course description"
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="prerequisites" className="text-sm font-medium">
              Prerequisites
            </label>
            <input
              id="prerequisites"
              name="prerequisites"
              placeholder="PSYCH 258 or 275"
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="user_notes" className="text-sm font-medium">
              User notes
            </label>
            <textarea
              id="user_notes"
              name="user_notes"
              rows={3}
              placeholder="Optional personal notes"
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          <div className="pt-2">
            <SubmitButton />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}