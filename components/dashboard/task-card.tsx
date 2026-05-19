"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { CircleCheck, Circle, Trash2 } from "lucide-react";
import { toggleTaskCompletion, deleteTask } from "@/app/actions/tasks";

// This infers the type exactly as passed from the parent component
type TaskCardProps = {
  task: {
    id: string;
    title: string;
    due_date: string | null;
    is_completed: boolean;
    courses: { course_code: string; title: string } | { course_code: string; title: string }[] | null;
  };
};

function formatDueDate(value: string | null) {
  if (!value) return "No date";
  const date = new Date(value);
  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function TaskCard({ task }: TaskCardProps) {
  const [isPending, startTransition] = useTransition();

  const relatedCourse = Array.isArray(task.courses)
    ? task.courses[0]
    : task.courses;

  const handleToggle = () => {
    startTransition(async () => {
      try {
        await toggleTaskCompletion(task.id, task.is_completed);
        toast.success(
          task.is_completed ? "Task marked open" : "Task completed"
        );
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

          {/* Delete button appears on hover */}
          <button
            onClick={handleDelete}
            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all p-1"
            title="Delete task"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}