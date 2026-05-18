import { Suspense } from "react";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import Link from "next/link";

function DashboardSkeleton() {
  return (
    <div className="flex-1 space-y-8 p-4 md:p-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-2xl border border-border/60 bg-card"
          />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="h-[420px] animate-pulse rounded-2xl border border-border/60 bg-card" />
        <div className="space-y-6">
          <div className="h-[320px] animate-pulse rounded-2xl border border-border/60 bg-card" />
          <div className="h-[220px] animate-pulse rounded-2xl border border-border/60 bg-card" />
        </div>
      </section>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-7xl">
        <aside className="hidden w-72 border-r border-border/60 bg-muted/30 lg:flex lg:flex-col">
          <div className="border-b border-border/60 p-6">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Academic Planner
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">Dashboard</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Organize classes, deadlines, exams, and study sessions in one place.
            </p>
          </div>

          <nav className="flex flex-1 flex-col gap-2 p-4 text-sm">
            <Link
              href="/"
              className="rounded-lg bg-primary px-4 py-3 text-primary-foreground"
            >
              Overview
            </Link>
            <Link
              href="/"
              className="rounded-lg px-4 py-3 text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
            >
              Courses
            </Link>
            <Link
              href="/"
              className="rounded-lg px-4 py-3 text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
            >
              Calendar
            </Link>
            <Link
              href="/"
              className="rounded-lg px-4 py-3 text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
            >
              Assignments
            </Link>
            <Link
              href="/"
              className="rounded-lg px-4 py-3 text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
            >
              Exams
            </Link>
            <Link
              href="/"
              className="rounded-lg px-4 py-3 text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
            >
              Study Planner
            </Link>
          </nav>

          <div className="border-t border-border/60 p-4">
            <div className="rounded-xl border border-border/60 bg-card p-4">
              <p className="text-sm font-medium">Live planner</p>
              <p className="mt-1 text-2xl font-semibold">Connected</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Supabase data is now powering this dashboard.
              </p>
            </div>
          </div>
        </aside>

        <section className="flex min-h-screen flex-1 flex-col">
          <header className="border-b border-border/60 bg-background/95 px-4 py-4 backdrop-blur md:px-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Welcome back</p>
                <h2 className="text-2xl font-semibold tracking-tight">Semester overview</h2>
              </div>

              <div className="flex items-center gap-3">
                <ThemeSwitcher />
                {hasEnvVars ? (
                  <Suspense fallback={null}>
                    <AuthButton />
                  </Suspense>
                ) : (
                  <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
                    Add Supabase env vars
                  </div>
                )}
              </div>
            </div>
          </header>

          <Suspense fallback={<DashboardSkeleton />}>
            <DashboardContent />
          </Suspense>
        </section>
      </div>
    </main>
  );
}