import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { createWorkoutPlan, parseWorkoutRequest } from "@/lib/workout-generator";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = parseWorkoutRequest(payload);
    const plan = createWorkoutPlan(parsed);

    return NextResponse.json({ plan });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Your workout inputs are invalid.",
          details: error.flatten()
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Workout generation failed."
      },
      { status: 500 }
    );
  }
}
