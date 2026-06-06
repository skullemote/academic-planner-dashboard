"use client";

import { useTransition, useState, useRef } from "react";
import { toast } from "sonner";
import { CircleCheck, Circle, Trash2, Pencil } from "lucide-react";
import { toggleTaskCompletion, deleteTask, updateTask } from "@/app/actions/tasks";
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

type TaskCardProps = {
  task: {
    id: string;
    title: string;
    due_date: string | null;
    is_completed: boolean;
    course_id: string;
    courses: { course_code: string; title: string } | { course_code: string; title: string }[] | null;
  };
  courses: TaskCourseOption[];
};

function formatDueDate(value: string | null) {
  if (!value) return "No date";
  const date = new Date(value);
  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  }).format(date);
}

export function TaskCard({ task, courses }: TaskCardProps) {
  const [isPending, startTransition] = useTransition();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const relatedCourse = Array.isArray(task.courses)
    ? task.courses[0]
    : task.courses;

  const handleToggle = () => {
    startTransition(async () => {
      try {
        await toggleTaskCompletion(task.id, task.is_completed);
        toast.success(task.is_completed ? "Task marked open" : "Task completed");
      } catch (error: any) {
        toast.error("Failed to update task", { description: error.message });
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteTask(task.id);
        toast.success("Task deleted");
      } catch (error: any) {
        toast.error("Failed to delete task", { description: error.message });
      }
    });
  };

  const handleEditSubmit = (formData: FormData) => {
    startTransition(async () => {
      try {
        await updateTask(task.id, formData);
        toast.success("Task updated");
        setIsEditDialogOpen(false);
      } catch (error: any) {
        toast.error("Failed to update task", { description: error.message });
      }
    });
  };

  const defaultDueDate = task.due_date ? task.due_date.split("T")[0] : "";

  return (
    <div
      className={`group relative rounded-xl border border-border/60 p-4 transition-all ${
        isPending ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={handleToggle}
          className="mt-0.5 text-muted-foreground hover:text-primary transition-colors"
        >
          {task.is_completed ? (
            <CircleCheck className="h-5 w-5 text-primary" />
          ) : (
            <Circle className="h-5 w-5" />
          )}
        </button>

        <div className="flex-1">
          <h4
            className={`font-medium ${
              task.is_completed ? "line-through text-muted-foreground" : ""
            }`}
          >
            {task.title}
          </h4>
          <p className="text-sm text-muted-foreground">
            {relatedCourse
              ? `${relatedCourse.course_code} · ${relatedCourse.title}`
              : "Unassigned course"}
          </p>

          <p className="mt-2 text-sm">
            Due:{" "}
            <span className="text-muted-foreground">
              {formatDueDate(task.due_date)}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!task.is_completed && (
            <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
              Open
            </span>
          )}

          <div className="opacity-0 group-hover:opacity-100 flex items-center transition-all">
            
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <button
                  className="text-muted-foreground hover:text-primary p-1"
                  title="Edit task"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </DialogTrigger>
              
              <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                  <DialogTitle>Edit task</DialogTitle>
                  <DialogDescription>
                    Update the details for this task.
                  </DialogDescription>
                </DialogHeader>

                <form ref={formRef} action={handleEditSubmit} className="grid gap-4 pt-2">
                  <div className="grid gap-2">
                    <label htmlFor={`edit-title-${task.id}`} className="text-sm font-medium">
                      Task title
                    </label>
                    <input
                      id={`edit-title-${task.id}`}
                      name="title"
                      defaultValue={task.title}
                      required
                      disabled={isPending}
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
                    />
                  </div>

                  <div className="grid gap-2">
                    <label htmlFor={`edit-course-${task.id}`} className="text-sm font-medium">
                      Course
                    </label>
                    <select
                      id={`edit-course-${task.id}`}
                      name="course_id"
                      required
                      defaultValue={task.course_id || ""}
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
                    <label htmlFor={`edit-due-${task.id}`} className="text-sm font-medium">
                      Due date
                    </label>
                    <input
                      id={`edit-due-${task.id}`}
                      name="due_date"
                      type="date"
                      defaultValue={defaultDueDate}
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
                      {isPending ? "Saving..." : "Save changes"}
                    </button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <button
              onClick={handleDelete}
              className="text-muted-foreground hover:text-destructive p-1"
              title="Delete task"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}