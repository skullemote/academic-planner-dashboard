"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function normalizeOptional(value: FormDataEntryValue | null) {
  if (!value) return null;
  const trimmed = value.toString().trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function createTask(formData: FormData) {
  const supabase = await createClient();

  const title = formData.get("title")?.toString().trim() ?? "";
  const course_id = formData.get("course_id")?.toString().trim() ?? "";
  const due_date = normalizeOptional(formData.get("due_date"));

  if (!title || !course_id) {
    throw new Error("Task title and course are required.");
  }

  const { error } = await supabase.from("tasks").insert({
    title,
    course_id,
    due_date,
    is_completed: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
}

export async function toggleTaskCompletion(taskId: string, currentStatus: boolean) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("tasks")
    .update({ is_completed: !currentStatus })
    .eq("id", taskId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
}

export async function deleteTask(taskId: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("tasks").delete().eq("id", taskId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
}