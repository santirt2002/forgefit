import type { ExerciseDefinition } from "@/lib/types";

const muscleAndStrength = (title: string, url: string) => ({
  title,
  source: "Muscle & Strength",
  url
});

const runna = (title: string, url: string) => ({
  title,
  source: "Runna",
  url
});

const concept2 = (title: string, url: string) => ({
  title,
  source: "Concept2",
  url
});

const youtube = (title: string, url: string) => ({
  title,
  source: "YouTube",
  url
});

export const exerciseLibrary: ExerciseDefinition[] = [
  {
    id: "front-squat",
    name: "Front Squat",
    category: "squat",
    focusTags: ["lower", "quad", "strength"],
    equipment: ["barbell", "rack"],
    cues: ["Brace before every rep.", "Drive elbows high.", "Keep midfoot pressure."],
    commonMistakes: ["Elbows dropping", "Knees collapsing inward"],
    demoPattern: "squat",
    instructionalVideo: muscleAndStrength(
      "Front Squat Video Exercise Guide",
      "https://cdn.muscleandstrength.com/exercises/front-squat.html"
    )
  },
  {
    id: "goblet-squat",
    name: "Goblet Squat",
    category: "squat",
    focusTags: ["lower", "quad", "hypertrophy"],
    equipment: ["dumbbells", "kettlebells"],
    cues: ["Sit between your hips.", "Keep your torso tall.", "Use a controlled descent."],
    commonMistakes: ["Losing heel pressure", "Rushing the eccentric"],
    demoPattern: "squat",
    instructionalVideo: muscleAndStrength(
      "Dumbbell Goblet Box Squat Video Exercise Guide",
      "https://cdn.muscleandstrength.com/exercises/dumbbell-goblet-box-squat"
    )
  },
  {
    id: "romanian-deadlift",
    name: "Romanian Deadlift",
    category: "hinge",
    focusTags: ["posterior", "hamstrings", "strength"],
    equipment: ["barbell", "dumbbells"],
    cues: ["Push the hips back.", "Keep the bar close.", "Feel the hamstring stretch."],
    commonMistakes: ["Rounding the back", "Turning it into a squat"],
    demoPattern: "hinge",
    instructionalVideo: muscleAndStrength(
      "Romanian Deadlift Video Exercise Guide",
      "https://cdn.muscleandstrength.com/exercises/romanian-deadlift"
    )
  },
  {
    id: "bench-press",
    name: "Bench Press",
    category: "push",
    focusTags: ["upper", "push", "strength"],
    equipment: ["barbell", "bench"],
    cues: ["Pin shoulders down.", "Drive feet into the floor.", "Control the pause."],
    commonMistakes: ["Flared elbows", "Loose upper back"],
    demoPattern: "horizontal_push",
    instructionalVideo: muscleAndStrength(
      "Paused Barbell Bench Press Video Exercise Guide",
      "https://cdn.muscleandstrength.com/exercises/paused-barbell-bench-press"
    )
  },
  {
    id: "incline-dumbbell-press",
    name: "Incline Dumbbell Press",
    category: "push",
    focusTags: ["upper", "chest", "hypertrophy"],
    equipment: ["bench", "dumbbells"],
    cues: ["Lower with control.", "Stack wrists over elbows.", "Keep shoulder blades set."],
    commonMistakes: ["Shortening range", "Shrugging shoulders"],
    demoPattern: "horizontal_push",
    instructionalVideo: muscleAndStrength(
      "Neutral Grip Incline Dumbbell Bench Press Video Exercise Guide",
      "https://cdn.muscleandstrength.com/exercises/palms-in-incline-dumbbell-bench-press.html"
    )
  },
  {
    id: "pull-up",
    name: "Pull-Up",
    category: "pull",
    focusTags: ["upper", "back", "strength"],
    equipment: ["pull_up_bar"],
    cues: ["Start from a dead hang.", "Drive elbows down.", "Stay tight through the trunk."],
    commonMistakes: ["Half reps", "Kipping unintentionally"],
    demoPattern: "vertical_pull",
    instructionalVideo: muscleAndStrength(
      "Pull Up With Leg Raise Video Exercise Guide",
      "https://cdn.muscleandstrength.com/exercises/pull-up-with-leg-raise"
    )
  },
  {
    id: "chest-supported-row",
    name: "Chest-Supported Row",
    category: "pull",
    focusTags: ["upper", "back", "hypertrophy"],
    equipment: ["bench", "dumbbells"],
    cues: ["Reach long at the bottom.", "Pull toward the hip.", "Pause at peak contraction."],
    commonMistakes: ["Jerking the weight", "No scapular movement"],
    demoPattern: "row",
    instructionalVideo: muscleAndStrength(
      "Chest Supported Dumbbell Row Video Exercise Guide",
      "https://cdn.muscleandstrength.com/exercises/chest-supported-dumbbell-row-with-isohold"
    )
  },
  {
    id: "walking-lunge",
    name: "Walking Lunge",
    category: "squat",
    focusTags: ["lower", "unilateral", "hypertrophy"],
    equipment: ["bodyweight", "dumbbells"],
    cues: ["Step long enough for balance.", "Stay stacked.", "Push through the front foot."],
    commonMistakes: ["Torso tipping forward", "Short strides"],
    demoPattern: "lunge",
    instructionalVideo: muscleAndStrength(
      "Walking Lunge Video Exercise Guide",
      "https://cdn.muscleandstrength.com/exercises/walking-lunge"
    )
  },
  {
    id: "bodyweight-squat",
    name: "Bodyweight Squat",
    category: "squat",
    focusTags: ["lower", "quad", "bodyweight"],
    equipment: ["bodyweight"],
    cues: ["Reach hips down between the knees.", "Keep heels connected.", "Stand tall at the top."],
    commonMistakes: ["Collapsing knees", "Cutting depth short"],
    demoPattern: "squat",
    instructionalVideo: muscleAndStrength(
      "Bodyweight Squat Video Exercise Guide",
      "https://cdn.muscleandstrength.com/exercises/bodyweight-squat"
    )
  },
  {
    id: "glute-bridge",
    name: "Glute Bridge",
    category: "hinge",
    focusTags: ["posterior", "glutes", "bodyweight"],
    equipment: ["bodyweight"],
    cues: ["Drive through the heels.", "Pause at full hip extension.", "Keep ribs down."],
    commonMistakes: ["Overarching the low back", "Rushing through the pause"],
    demoPattern: "bridge",
    instructionalVideo: muscleAndStrength(
      "Glute Bridge Video Exercise Guide",
      "https://cdn.muscleandstrength.com/exercises/glute-bridge"
    )
  },
  {
    id: "push-up",
    name: "Push-Up",
    category: "push",
    focusTags: ["upper", "chest", "bodyweight"],
    equipment: ["bodyweight"],
    cues: ["Keep a straight line from head to heel.", "Lower with control.", "Press the floor away."],
    commonMistakes: ["Hips sagging", "Elbows flaring too wide"],
    demoPattern: "horizontal_push",
    instructionalVideo: muscleAndStrength(
      "Wide Grip Push Ups Video Exercise Guide",
      "https://cdn.muscleandstrength.com/exercises/wide-grip-push-ups.html"
    )
  },
  {
    id: "inverted-row",
    name: "Inverted Row",
    category: "pull",
    focusTags: ["upper", "back", "bodyweight"],
    equipment: ["bodyweight", "rack"],
    cues: ["Pull the chest toward the bar.", "Keep the body rigid.", "Control the lowering phase."],
    commonMistakes: ["Shrugging shoulders", "Letting hips drop"],
    demoPattern: "row",
    instructionalVideo: muscleAndStrength(
      "Weighted Inverted Row Video Exercise Guide",
      "https://cdn.muscleandstrength.com/exercises/weight-vest-weighted-inverted-row"
    )
  },
  {
    id: "plank-drag",
    name: "Plank Drag",
    category: "core",
    focusTags: ["core", "stability"],
    equipment: ["dumbbells"],
    cues: ["Minimize hip rotation.", "Keep ribs down.", "Move slowly."],
    commonMistakes: ["Rocking hips", "Holding breath"],
    demoPattern: "plank",
    instructionalVideo: youtube(
      "Plank Drag Tutorial Search",
      "https://www.youtube.com/results?search_query=plank+drag+exercise+proper+form"
    )
  },
  {
    id: "dead-bug",
    name: "Dead Bug",
    category: "core",
    focusTags: ["core", "control", "bodyweight"],
    equipment: ["bodyweight"],
    cues: ["Press the low back gently into the floor.", "Move opposite arm and leg slowly.", "Exhale as you extend."],
    commonMistakes: ["Arching the back", "Moving too quickly"],
    demoPattern: "dead_bug",
    instructionalVideo: muscleAndStrength(
      "Dead Bug With Plates Video Exercise Guide",
      "https://cdn.muscleandstrength.com/exercises/dead-bug-with-plates"
    )
  },
  {
    id: "mountain-climber",
    name: "Mountain Climber",
    category: "conditioning",
    focusTags: ["conditioning", "core", "bodyweight"],
    equipment: ["bodyweight"],
    cues: ["Keep shoulders stacked over wrists.", "Drive knees with control.", "Stay quiet through the hips."],
    commonMistakes: ["Bouncing hips", "Losing plank position"],
    demoPattern: "mountain_climber",
    instructionalVideo: muscleAndStrength(
      "Mountain Climbers Video Exercise Guide",
      "https://cdn.muscleandstrength.com/exercises/mountain-climbers"
    )
  },
  {
    id: "bike-erg-sprint",
    name: "Bike Erg Sprint",
    category: "conditioning",
    focusTags: ["conditioning", "power"],
    equipment: ["cardio_machine"],
    cues: ["Explode early in the sprint.", "Recover fully between efforts."],
    commonMistakes: ["Starting too hard too early", "Incomplete recovery"],
    demoPattern: "bike",
    instructionalVideo: concept2(
      "BikeErg How To Videos",
      "https://www.concept2.com/support/bikeerg/how-to-videos"
    )
  },
  {
    id: "farmers-carry",
    name: "Farmer's Carry",
    category: "carry",
    focusTags: ["conditioning", "grip", "core"],
    equipment: ["dumbbells", "kettlebells"],
    cues: ["Walk tall.", "Keep shoulders packed.", "Take short quick steps."],
    commonMistakes: ["Leaning to one side", "Loose grip posture"],
    demoPattern: "carry",
    instructionalVideo: muscleAndStrength(
      "Kettlebell Racked Crossover Walk Video Exercise Guide",
      "https://cdn.muscleandstrength.com/exercises/kettlebell-racked-crossover-walk"
    )
  },
  {
    id: "tempo-run",
    name: "Tempo Run",
    category: "conditioning",
    focusTags: ["conditioning", "endurance"],
    equipment: ["bodyweight", "cardio_machine"],
    cues: ["Hold a sustainable hard pace.", "Stay relaxed through shoulders."],
    commonMistakes: ["Starting too fast", "Breaking form under fatigue"],
    demoPattern: "run",
    instructionalVideo: runna(
      "7 Steps to Great Running Form",
      "https://support.runna.com/en/articles/6205901-7-steps-to-great-running-form"
    )
  }
];
