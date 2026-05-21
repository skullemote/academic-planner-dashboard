"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { courseSchema, type CourseFormValues } from "@/lib/validations";

export async function createCourse(data: CourseFormValues) {
  const supabase = await createClient();
  const parsed = courseSchema.parse(data);

  const { error } = await supabase.from("courses").insert({
    ...parsed,
    term: parsed.term || null,
    description: parsed.description || null,
    prerequisites: parsed.prerequisites || null,
    user_notes: parsed.user_notes || null,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/");
}

export async function updateCourse(id: string, data: CourseFormValues) {
  const supabase = await createClient();
  const parsed = courseSchema.parse(data);

  const { error } = await supabase
    .from("courses")
    .update({
      ...parsed,
      term: parsed.term || null,
      description: parsed.description || null,
      prerequisites: parsed.prerequisites || null,
      user_notes: parsed.user_notes || null,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/");
}

export async function deleteCourse(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase.from("courses").delete().eq("id", id);
  if (error) throw new Error(error.message);
  
  revalidatePath("/");
}