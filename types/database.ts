export type CourseStatus = "Completed" | "Planned" | "Idea Board";
export type Faculty = "Arts" | "Science" | "Other";

export interface Course {
  id: string;
  course_code: string;
  title: string;
  credits: number;
  faculty: Faculty;
  description: string;
  prerequisites: string;
  status: CourseStatus;
  term: string | null;
  user_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  course_id: string;
  title: string;
  due_date: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  totalCourses: number;
  plannedCourses: number;
  completedCourses: number;
  openTasks: number;
}

export interface ProgressSummary {
  totalCreditsRequired: number;
  creditsCompleted: number;
  creditsNeeded: number;
  major: string;
}