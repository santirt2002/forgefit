export type GoalType =
  | "hypertrophy"
  | "strength"
  | "fat_loss"
  | "athleticism"
  | "endurance";

export type SecondaryGoal =
  | "movement_quality"
  | "conditioning"
  | "body_composition"
  | "muscle_gain"
  | "performance";

export type TrainingAge = "beginner" | "intermediate" | "advanced";

export type ProgramFocus = "upper_lower" | "push_pull_legs" | "full_body" | "hybrid";

export type ExerciseCategory =
  | "squat"
  | "hinge"
  | "push"
  | "pull"
  | "core"
  | "conditioning"
  | "carry";

export type ExerciseDemoPattern =
  | "squat"
  | "hinge"
  | "horizontal_push"
  | "vertical_pull"
  | "row"
  | "lunge"
  | "bridge"
  | "plank"
  | "dead_bug"
  | "mountain_climber"
  | "bike"
  | "run"
  | "carry";

export type InstructionalVideo = {
  title: string;
  source: string;
  url: string;
};

export type GeneratorInput = {
  primaryGoal: GoalType;
  secondaryGoal: SecondaryGoal;
  trainingAge: TrainingAge;
  daysPerWeek: number;
  sessionLength: number;
  focus: ProgramFocus;
  limitations: string;
  equipment: string[];
  targetMonths: number;
};

export type ExerciseDefinition = {
  id: string;
  name: string;
  category: ExerciseCategory;
  focusTags: string[];
  equipment: string[];
  cues: string[];
  commonMistakes: string[];
  demoPattern: ExerciseDemoPattern;
  instructionalVideo: InstructionalVideo;
  videoUrl?: string;
};

export type PlannedExercise = {
  id: string;
  exerciseId: string;
  name: string;
  sets: number;
  repRange: string;
  restSeconds: number;
  targetRpe: number;
  notes: string;
};

export type ProgramDay = {
  id: string;
  dayNumber: number;
  title: string;
  focus: string;
  warmup: string;
  exercises: PlannedExercise[];
  finisher: string;
};

export type ProgramWeek = {
  id: string;
  weekNumber: number;
  isDeload: boolean;
  focus: string;
  days: ProgramDay[];
};

export type ProgramBlock = {
  id: string;
  monthNumber: number;
  title: string;
  objective: string;
  intensity: string;
  weeks: ProgramWeek[];
};

export type TrainingProgram = {
  id: string;
  title: string;
  summary: string;
  createdAt: string;
  input: GeneratorInput;
  blocks: ProgramBlock[];
};

export type SetLog = {
  id: string;
  programId: string;
  dayId: string;
  exerciseId: string;
  exerciseName: string;
  sessionNumber: number;
  setNumber: number;
  reps: number;
  weight: number;
  rpe: number;
  performedOn: string;
};

export type ProgressSnapshot = {
  label: string;
  value: number;
};
