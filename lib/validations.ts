import { z } from "zod";

export const courseSchema = z.object({
  course_code: z.string().min(1, "Course code is required"),
  title: z.string().min(1, "Title is required"),
  credits: z.number().min(0, "Credits must be 0 or more"),
  faculty: z.string().min(1, "Faculty is required"),
  status: z.enum(["Completed", "Planned", "Idea Board"]),
  term: z.string().optional(),
  description: z.string().optional(),
  prerequisites: z.string().optional(),
  user_notes: z.string().optional(),
});

export type CourseFormValues = z.infer<typeof courseSchema>;