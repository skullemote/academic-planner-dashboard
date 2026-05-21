"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CourseDialog } from "@/components/dashboard/course-dialog";
import { deleteCourse } from "@/app/actions/courses";
import type { Course } from "@/types/database";
import Link from "next/link";

interface CourseCardProps {
  course: Course;
  variant?: "default" | "compact";
}

export function CourseCard({ course, variant = "default" }: CourseCardProps) {
  const [isPending, startTransition] = useTransition();
  const [showEdit, setShowEdit] = useState(false);

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteCourse(course.id);
        toast.success("Course deleted");
      } catch (error: any) {
        toast.error("Failed to delete course", { description: error.message });
      }
    });
  }

  // The compact layout is used in the Idea Board
  if (variant === "compact") {
    return (
      <>
        <div className={`group relative rounded-xl bg-muted p-4 transition-all ${isPending ? "opacity-50 pointer-events-none" : ""}`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <Link href={`/courses/${course.id}`} className="hover:underline">
                <p className="text-sm text-muted-foreground">{course.course_code}</p>
            </Link>
            <p className="mt-1 font-semibold">{course.title}</p>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-md p-1.5 text-muted-foreground hover:bg-background hover:text-foreground">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => setShowEdit(true)}>
                  <Pencil className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {course.prerequisites && (
            <p className="mt-2 text-sm text-muted-foreground">
              Prerequisites: {course.prerequisites}
            </p>
          )}
        </div>
        <CourseDialog course={course} open={showEdit} onOpenChange={setShowEdit} />
      </>
    );
  }

  // The default layout is used in the Planned Courses section
  return (
    <>
      <div className={`flex flex-col gap-3 rounded-xl border border-border/60 p-4 md:flex-row md:items-center md:justify-between transition-all ${isPending ? "opacity-50 pointer-events-none" : ""}`}>
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {course.term ?? "No term assigned"}
          </p>
          <Link href={`/courses/${course.id}`} className="hover:underline">
            <h4 className="mt-1 font-semibold">{course.course_code}</h4>
        </Link>
        <p className="text-sm text-muted-foreground">{course.title}</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {course.faculty}
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setShowEdit(true)}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <CourseDialog course={course} open={showEdit} onOpenChange={setShowEdit} />
    </>
  );
}