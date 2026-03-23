import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function DELETE(
  _request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await context.params;
    const supabase = await createSupabaseServerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "You must be signed in to delete workouts." }, { status: 401 });
    }

    const { error } = await supabase.from("workouts").delete().eq("id", id).eq("user_id", user.id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Could not delete the workout." }, { status: 500 });
  }
}
