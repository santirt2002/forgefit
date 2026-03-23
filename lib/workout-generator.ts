import { z } from "zod";
import type { WorkoutDay, WorkoutExercise, WorkoutPlan, WorkoutRequest } from "@/lib/types";

const workoutRequestSchema = z.object({
  name: z.string().trim().min(1).max(80),
  goal: z.enum(["muscle_gain", "fat_loss", "endurance", "strength", "general_fitness"]),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  daysPerWeek: z.number().int().min(2).max(6),
  sessionLength: z.number().int().min(20).max(120),
  equipment: z.array(z.string()).min(1),
  notes: z.string().max(500).optional().default("")
});

export function parseWorkoutRequest(input: WorkoutRequest): WorkoutRequest {
  return workoutRequestSchema.parse(input);
}

type ExerciseTemplate = {
  name: string;
  focus: string;
  equipment: string[];
  beginner: string;
  intermediate: string;
  advanced: string;
  rest: string;
  notes: string;
};

const exercisePool: ExerciseTemplate[] = [
  {
    name: "Goblet Squat",
    focus: "lower body",
    equipment: ["dumbbells", "kettlebells"],
    beginner: "3 x 10",
    intermediate: "4 x 10",
    advanced: "5 x 8",
    rest: "75 sec",
    notes: "Keep your ribs stacked over your hips."
  },
  {
    name: "Push-Up",
    focus: "push",
    equipment: ["bodyweight"],
    beginner: "3 x 8",
    intermediate: "4 x 12",
    advanced: "5 x 15",
    rest: "60 sec",
    notes: "Elevate your hands if you need cleaner reps."
  },
  {
    name: "Romanian Deadlift",
    focus: "posterior chain",
    equipment: ["dumbbells", "barbell"],
    beginner: "3 x 10",
    intermediate: "4 x 8",
    advanced: "5 x 6",
    rest: "90 sec",
    notes: "Push hips back and keep the weights close."
  },
  {
    name: "Bent-Over Row",
    focus: "pull",
    equipment: ["dumbbells", "barbell"],
    beginner: "3 x 10",
    intermediate: "4 x 10",
    advanced: "5 x 8",
    rest: "75 sec",
    notes: "Pause at the top for one clean beat."
  },
  {
    name: "Walking Lunge",
    focus: "lower body",
    equipment: ["bodyweight", "dumbbells"],
    beginner: "2 x 10 / leg",
    intermediate: "3 x 12 / leg",
    advanced: "4 x 14 / leg",
    rest: "60 sec",
    notes: "Step long enough to keep the front heel grounded."
  },
  {
    name: "Overhead Press",
    focus: "push",
    equipment: ["dumbbells", "barbell"],
    beginner: "3 x 8",
    intermediate: "4 x 8",
    advanced: "5 x 6",
    rest: "90 sec",
    notes: "Squeeze glutes to protect your lower back."
  },
  {
    name: "Plank Shoulder Tap",
    focus: "core",
    equipment: ["bodyweight"],
    beginner: "3 x 20 taps",
    intermediate: "3 x 30 taps",
    advanced: "4 x 30 taps",
    rest: "45 sec",
    notes: "Fight rotation through your torso."
  },
  {
    name: "Bike Erg Sprint",
    focus: "conditioning",
    equipment: ["cardio_machine"],
    beginner: "6 x 20 sec",
    intermediate: "8 x 20 sec",
    advanced: "10 x 20 sec",
    rest: "40 sec easy pedal",
    notes: "Hit hard efforts without letting form collapse."
  },
  {
    name: "Pull-Up",
    focus: "pull",
    equipment: ["pull_up_bar"],
    beginner: "3 x 5 assisted",
    intermediate: "4 x 6",
    advanced: "5 x 8",
    rest: "90 sec",
    notes: "Pull elbows down toward your back pockets."
  },
  {
    name: "Kettlebell Swing",
    focus: "power",
    equipment: ["kettlebells"],
    beginner: "3 x 12",
    intermediate: "4 x 15",
    advanced: "5 x 18",
    rest: "60 sec",
    notes: "Snap the hips instead of lifting with the arms."
  },
  {
    name: "Treadmill Tempo Run",
    focus: "conditioning",
    equipment: ["cardio_machine"],
    beginner: "12 min steady",
    intermediate: "18 min steady",
    advanced: "24 min steady",
    rest: "N/A",
    notes: "Aim for a pace that feels challenging but sustainable."
  },
  {
    name: "Bulgarian Split Squat",
    focus: "lower body",
    equipment: ["bodyweight", "dumbbells"],
    beginner: "3 x 8 / leg",
    intermediate: "4 x 10 / leg",
    advanced: "4 x 12 / leg",
    rest: "75 sec",
    notes: "Descend with control and keep the front knee stable."
  }
];

const goalMap: Record<WorkoutRequest["goal"], { title: string; focus: string }> = {
  muscle_gain: {
    title: "Hypertrophy Builder",
    focus: "progressive overload with extra volume"
  },
  fat_loss: {
    title: "Lean Conditioning",
    focus: "full-body work with elevated heart rate"
  },
  endurance: {
    title: "Engine Upgrade",
    focus: "repeatable efforts and aerobic capacity"
  },
  strength: {
    title: "Strength Circuit",
    focus: "heavy compounds and longer recovery"
  },
  general_fitness: {
    title: "Balanced Athlete",
    focus: "strength, movement quality, and stamina"
  }
};

const focusRotation = [
  "Lower body and trunk",
  "Upper push and pull",
  "Conditioning and core",
  "Posterior chain and power",
  "Athletic full body",
  "Recovery-based volume"
];

function pickExercises(request: WorkoutRequest, focus: string, count: number): WorkoutExercise[] {
  const available = exercisePool.filter((exercise) => {
    const hasMatchingEquipment = exercise.equipment.some((item) => request.equipment.includes(item));
    const bodyweightCompatible =
      request.equipment.includes("bodyweight") && exercise.equipment.includes("bodyweight");

    return hasMatchingEquipment || bodyweightCompatible;
  });

  const focusMatches = available.filter((exercise) => focus.toLowerCase().includes(exercise.focus));
  const selectionBase = focusMatches.length >= count ? focusMatches : available;
  const rotated = [...selectionBase].sort((a, b) => a.name.localeCompare(b.name));

  return rotated.slice(0, count).map((exercise) => ({
    name: exercise.name,
    sets: request.level === "beginner" ? "3" : request.level === "intermediate" ? "4" : "5",
    reps:
      request.level === "beginner"
        ? exercise.beginner
        : request.level === "intermediate"
          ? exercise.intermediate
          : exercise.advanced,
    rest: exercise.rest,
    notes: exercise.notes
  }));
}

function buildDays(request: WorkoutRequest): WorkoutDay[] {
  return Array.from({ length: request.daysPerWeek }, (_, index) => {
    const focus = focusRotation[index % focusRotation.length];
    const exerciseCount = request.sessionLength >= 50 ? 4 : 3;

    return {
      day: index + 1,
      focus,
      warmup: "5 to 8 minutes of mobility, pulse-raising cardio, and activation drills.",
      exercises: pickExercises(request, focus, exerciseCount),
      finisher:
        request.goal === "fat_loss" || request.goal === "endurance"
          ? "Finish with 6 rounds of 30 seconds hard effort, 30 seconds easy effort."
          : "Finish with a 5-minute controlled challenge: carries, bike, or core work.",
      recovery: "Cool down with nasal breathing and 3 minutes of lower-intensity stretching."
    };
  });
}

export function createWorkoutPlan(input: WorkoutRequest): WorkoutPlan {
  const request = parseWorkoutRequest(input);
  const goal = goalMap[request.goal];

  return {
    title: `${goal.title} for ${request.name}`,
    summary: `A ${request.daysPerWeek}-day plan built for a ${request.level} athlete training ${request.sessionLength} minutes per session.`,
    weeklyFocus: `This week emphasizes ${goal.focus}.`,
    tips: [
      "Leave 1 to 2 reps in reserve on most strength movements.",
      "Track loads or pace so the next week has a clear progression target.",
      request.notes
        ? `Remember your personal note: ${request.notes}`
        : "Use one full rest day after every 2 to 3 training days."
    ],
    days: buildDays(request)
  };
}
