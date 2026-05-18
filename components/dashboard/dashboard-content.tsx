import { createClient } from "@/lib/supabase/server";
import type { QueryData } from "@supabase/supabase-js";
import type {
  Course,
  Task,
  DashboardStats,
  ProgressSummary,
} from "@/types/database";

function formatDueDate(value: string) {
  const date = new Date(value);

  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function buildStats(
  courses: Course[],
  tasks: Pick<Task, "is_completed">[]
): DashboardStats {
  return {
    totalCourses: courses.length,
    plannedCourses: courses.filter((course) => course.status === "Planned").length,
    completedCourses: courses.filter((course) => course.status === "Completed").length,
    openTasks: tasks.filter((task) => !task.is_completed).length,
  };
}

function buildProgress(courses: Course[]): ProgressSummary {
  const creditsCompleted = courses
    .filter((course) => course.status === "Completed")
    .reduce((sum, course) => sum + course.credits, 0);

  const totalCreditsRequired = 120;
  const creditsNeeded = Math.max(totalCreditsRequired - creditsCompleted, 0);

  return {
    totalCreditsRequired,
    creditsCompleted,
    creditsNeeded,
    major: "MJ Psych",
  };
}

export async function DashboardContent() {
  const supabase = await createClient();

  const coursesQuery = supabase
    .from("courses")
    .select("*")
    .order("course_code", { ascending: true });

  const tasksQuery = supabase
    .from("tasks")
    .select(`
      id,
      course_id,
      title,
      due_date,
      is_completed,
      created_at,
      updated_at,
      courses (
        id,
        course_code,
        title
      )
    `)
    .order("due_date", { ascending: true });

  type TasksWithCourses = QueryData<typeof tasksQuery>;

  const [{ data: coursesData, error: coursesError }, { data: tasksData, error: tasksError }] =
    await Promise.all([coursesQuery, tasksQuery]);

  if (coursesError) {
    throw new Error(`Failed to load courses: ${coursesError.message}`);
  }

  if (tasksError) {
    throw new Error(`Failed to load tasks: ${tasksError.message}`);
  }

  const courses = (coursesData ?? []) as Course[];
  const tasks: TasksWithCourses = tasksData ?? [];

  const stats = buildStats(courses, tasks);
  const progress = buildProgress(courses);

  const upcomingTasks = tasks.filter((task) => !task.is_completed).slice(0, 5);
  const plannedCourses = courses.filter((course) => course.status === "Planned").slice(0, 5);
  const ideaBoardCourses = courses.filter((course) => course.status === "Idea Board").slice(0, 5);

  return (
    <div className="flex-1 space-y-8 p-4 md:p-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Courses</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight">{stats.totalCourses}</p>
          <p className="mt-2 text-sm text-muted-foreground">Tracked in your planner</p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Planned</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight">{stats.plannedCourses}</p>
          <p className="mt-2 text-sm text-muted-foreground">Courses planned next</p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Completed</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight">{stats.completedCourses}</p>
          <p className="mt-2 text-sm text-muted-foreground">Finished courses logged</p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Open Tasks</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight">{stats.openTasks}</p>
          <p className="mt-2 text-sm text-muted-foreground">Upcoming work items</p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Planned courses</h3>
              <p className="text-sm text-muted-foreground">
                Courses currently marked as planned in your academic roadmap.
              </p>
            </div>
            <button className="rounded-lg border border-border/60 px-3 py-2 text-sm transition hover:bg-accent">
              Add course
            </button>
          </div>

          <div className="space-y-4">
            {plannedCourses.length > 0 ? (
              plannedCourses.map((course) => (
                <div
                  key={course.id}
                  className="flex flex-col gap-3 rounded-xl border border-border/60 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {course.term ?? "No term assigned"}
                    </p>
                    <h4 className="mt-1 font-semibold">{course.course_code}</h4>
                    <p className="text-sm text-muted-foreground">{course.title}</p>
                  </div>

                  <span className="inline-flex w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {course.faculty}
                  </span>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-border/60 p-4 text-sm text-muted-foreground">
                No planned courses yet.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Upcoming tasks</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Due dates pulled directly from your task database.
            </p>

            <div className="mt-5 space-y-4">
              {upcomingTasks.length > 0 ? (
                upcomingTasks.map((task) => {
                  const relatedCourse = Array.isArray(task.courses)
                    ? task.courses[0]
                    : task.courses;

                  return (
                    <div key={task.id} className="rounded-xl border border-border/60 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="font-medium">{task.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {relatedCourse
                              ? `${relatedCourse.course_code} · ${relatedCourse.title}`
                              : "Unassigned course"}
                          </p>
                        </div>
                        <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                          Open
                        </span>
                      </div>
                      <p className="mt-3 text-sm">
                        Due:{" "}
                        <span className="text-muted-foreground">
                          {formatDueDate(task.due_date)}
                        </span>
                      </p>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-xl border border-dashed border-border/60 p-4 text-sm text-muted-foreground">
                  No open tasks yet.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Idea board</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Courses you may want to take later.
            </p>

            <div className="mt-5 space-y-3">
              {ideaBoardCourses.length > 0 ? (
                ideaBoardCourses.map((course) => (
                  <div key={course.id} className="rounded-xl bg-muted p-4">
                    <p className="text-sm text-muted-foreground">{course.course_code}</p>
                    <p className="mt-1 font-semibold">{course.title}</p>
                    {course.prerequisites ? (
                      <p className="mt-2 text-sm text-muted-foreground">
                        Prerequisites: {course.prerequisites}
                      </p>
                    ) : null}
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-border/60 p-4 text-sm text-muted-foreground">
                  No idea board courses yet.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Degree progress</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Based on completed-course credits currently in the planner.
            </p>

            <div className="mt-5 rounded-xl bg-muted p-4">
              <p className="text-sm text-muted-foreground">Credits needed</p>
              <p className="mt-2 text-xl font-semibold">{progress.creditsNeeded}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {progress.creditsCompleted} credits completed toward {progress.totalCreditsRequired}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}