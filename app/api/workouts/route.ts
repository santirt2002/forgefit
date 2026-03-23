import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createWorkoutPlan, parseWorkoutRequest } from "@/lib/workout-generator";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ workouts: [] });
    }

    const { data, error } = await supabase
      .from("workouts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(6);

    if (error) {
      throw error;
    }

    return NextResponse.json({ workouts: data ?? [] });
  } catch {
    return NextResponse.json(
      { workouts: [], error: "Could not load workout history." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = parseWorkoutRequest(payload);
    const plan = createWorkoutPlan(parsed);
    const supabase = await createSupabaseServerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "You must be signed in to save workouts." }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("workouts")
      .insert({
        user_id: user.id,
        name: parsed.name,
        goal: parsed.goal,
        level: parsed.level,
        days_per_week: parsed.daysPerWeek,
        session_length: parsed.sessionLength,
        equipment: parsed.equipment,
        notes: parsed.notes,
        plan
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ workout: data, plan }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "The provided workout payload is invalid." }, { status: 400 });
    }

    return NextResponse.json({ error: "Saving the workout failed." }, { status: 500 });
  }
}
