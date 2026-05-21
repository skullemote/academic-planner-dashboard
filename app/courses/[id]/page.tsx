import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, FileText, CheckSquare, AlignLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { CourseDialog } from "@/components/dashboard/course-dialog";
import { TaskCard } from "@/components/dashboard/task-card";
import { AddTaskForm } from "@/components/dashboard/add-task-form";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // Next.js 15+ handles params as a Promise
  const supabase = await createClient();

  // Fetch the course details
  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)
    .single();

  if (!course) {
    notFound();
  }

  // Fetch only the tasks for this course
  const { data: tasksData } = await supabase
    .from("tasks")
    .select(`
      id,
      title,
      due_date,
      is_completed,
      courses (
        course_code,
        title
      )
    `)
    .eq("course_id", id)
    .order("is_completed", { ascending: true }) // Open tasks first
    .order("due_date", { ascending: true });

  const tasks = tasksData || [];
  
  // Format the course for the AddTaskForm
  const taskCourseOptions = [
    {
      id: course.id,
      course_code: course.course_code,
      title: course.title,
    },
  ];

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 lg:max-w-6xl mx-auto w-full">
      {/* Back Button */}
      <Link
        href="/"
        className="inline-flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {course.faculty}
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              {course.term || "No term set"}
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{course.course_code}</h1>
          <p className="mt-1 text-lg text-muted-foreground">{course.title}</p>
          
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-foreground">Status:</span> {course.status}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-foreground">Credits:</span> {course.credits}
            </div>
            {course.prerequisites && (
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-foreground">Prereqs:</span> {course.prerequisites}
              </div>
            )}
          </div>
        </div>

        {/* Reuse our Course Dialog to allow editing right from this page */}
        <CourseDialog
          course={course}
          trigger={
            <button className="rounded-lg border border-border/60 px-4 py-2 text-sm font-medium transition hover:bg-accent">
              Edit course
            </button>
          }
        />
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_400px]">
        {/* Left Column: Notes & Details */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <AlignLeft className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Course Description</h2>
            </div>
            {course.description ? (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {course.description}
              </p>
            ) : (
              <p className="text-sm italic text-muted-foreground/60">No description provided.</p>
            )}
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">My Notes</h2>
            </div>
            {course.user_notes ? (
              <div className="rounded-xl bg-muted p-4">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {course.user_notes}
                </p>
              </div>
            ) : (
              <p className="text-sm italic text-muted-foreground/60">No notes added.</p>
            )}
          </div>
        </div>

        {/* Right Column: Tasks */}
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm h-fit">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Tasks</h2>
            </div>
            <AddTaskForm courses={taskCourseOptions} />
          </div>

          <div className="space-y-4">
            {tasks.length > 0 ? (
              tasks.map((task) => <TaskCard key={task.id} task={task as any} />)
            ) : (
              <div className="rounded-xl border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
                No tasks assigned to this course.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}