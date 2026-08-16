import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CourseDialog } from "@/components/dashboard/course-dialog";
import { TaskCard } from "@/components/dashboard/task-card";
import { AddTaskForm } from "@/components/dashboard/add-task-form";
import Link from "next/link";
import { ChevronLeft, Calendar, GraduationCap } from "lucide-react";

export default async function CourseDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const courseId = resolvedParams.id;
  const supabase = await createClient();

  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .single();

  if (courseError || !course) {
    notFound();
  }

  const { data: tasks, error: tasksError } = await supabase
    .from("tasks")
    .select(`
      id,
      title,
      due_date,
      is_completed,
      course_id,
      courses (
        course_code,
        title
      )
    `)
    .eq("course_id", courseId)
    .order("due_date", { ascending: true });

  if (tasksError) {
    throw new Error(`Failed to load tasks: ${tasksError.message}`);
  }

  const completedTasks = tasks.filter((t) => t.is_completed).length;
  const totalTasks = tasks.length;
  const progressPercentage =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const singleCourseOption = [
    {
      id: course.id,
      course_code: course.course_code,
      title: course.title,
    },
  ];

  return (
    <div className="flex-1 p-4 md:p-6 max-w-5xl mx-auto w-full space-y-8">
      <Link
        href="/"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back to Dashboard
      </Link>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-xs font-medium">
              {course.course_code}
            </span>
            <span className="bg-muted px-2.5 py-0.5 rounded-full text-xs font-medium text-muted-foreground">
              {course.credits} Credits
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
        </div>
        <CourseDialog course={course} />
      </div>

      <section className="grid sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-lg text-primary">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="font-semibold">{course.status}</p>
          </div>
        </div>
        
        <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-lg text-primary">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Semester</p>
            <p className="font-semibold">
              {course.semester ? course.semester : "Unscheduled"}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-muted-foreground">Task Progress</p>
            <span className="text-sm font-medium">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-in-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </section>

      {course.description && (
        <section className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
          <h3 className="font-semibold mb-2">Description</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {course.description}
          </p>
        </section>
      )}

      <section className="rounded-xl border border-border/60 bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">Course Tasks</h3>
            <p className="text-sm text-muted-foreground">
              Manage assignments and reading for this class.
            </p>
          </div>
          <AddTaskForm courses={singleCourseOption} />
        </div>

        <div className="space-y-4">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <TaskCard 
                key={task.id} 
                task={task as any} 
                courses={singleCourseOption} 
              />
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
              No tasks added for this course yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}