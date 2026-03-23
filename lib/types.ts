export type FitnessGoal =
  | "muscle_gain"
  | "fat_loss"
  | "endurance"
  | "strength"
  | "general_fitness";

export type FitnessLevel = "beginner" | "intermediate" | "advanced";

export type WorkoutExercise = {
  name: string;
  sets: string;
  reps: string;
  rest: string;
  notes: string;
};

export type WorkoutDay = {
  day: number;
  focus: string;
  warmup: string;
  exercises: WorkoutExercise[];
  finisher: string;
  recovery: string;
};

export type WorkoutPlan = {
  title: string;
  summary: string;
  weeklyFocus: string;
  tips: string[];
  days: WorkoutDay[];
};

export type WorkoutRequest = {
  name: string;
  goal: FitnessGoal;
  level: FitnessLevel;
  daysPerWeek: number;
  sessionLength: number;
  equipment: string[];
  notes: string;
};

export type WorkoutRecord = {
  id: string;
  created_at: string;
  name: string;
  goal: FitnessGoal;
  level: FitnessLevel;
  days_per_week: number;
  session_length: number;
  equipment: string[];
  notes: string | null;
  plan: WorkoutPlan;
};
