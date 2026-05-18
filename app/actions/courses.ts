"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function normalizeOptional(value: FormDataEntryValue | null) {
  if (!value) return null;
  const trimmed = value.toString().trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function createCourse(formData: FormData) {
  const supabase = await createClient();

  const course_code = formData.get("course_code")?.toString().trim() ?? "";
  const title = formData.get("title")?.toString().trim() ?? "";
  const credits = Number(formData.get("credits") ?? 3);
  const faculty = formData.get("faculty")?.toString().trim() ?? "Other";
  const description = formData.get("description")?.toString().trim() ?? "";
  const prerequisites = formData.get("prerequisites")?.toString().trim() ?? "";
  const status = formData.get("status")?.toString().trim() ?? "Planned";
  const term = normalizeOptional(formData.get("term"));
  const user_notes = normalizeOptional(formData.get("user_notes"));

  if (!course_code || !title) {
    throw new Error("Course code and title are required.");
  }

  const { error } = await supabase.from("courses").insert({
    course_code,
    title,
    credits,
    faculty,
    description,
    prerequisites,
    status,
    term,
    user_notes,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
}