import { exerciseLibrary } from "@/data/exercise-library";
import type {
  ExerciseCategory,
  GeneratorInput,
  PlannedExercise,
  ProgramBlock,
  ProgramDay,
  ProgramWeek,
  TrainingProgram
} from "@/lib/types";

const focusTemplates: Record<GeneratorInput["focus"], string[]> = {
  upper_lower: ["Lower Strength", "Upper Strength", "Lower Volume", "Upper Volume", "Conditioning"],
  push_pull_legs: ["Push", "Pull", "Legs", "Upper Mix", "Conditioning"],
  full_body: ["Full Body A", "Full Body B", "Full Body C", "Full Body D", "Conditioning"],
  hybrid: ["Lower + Power", "Upper Strength", "Athletic Full Body", "Hypertrophy Mix", "Conditioning"]
};

const blockBlueprints: Record<
  GeneratorInput["primaryGoal"],
  Array<{ title: string; objective: string; intensity: string; repBias: string; deloadWeek: number }>
> = {
  hypertrophy: [
    {
      title: "Accumulation",
      objective: "Build work capacity and technical consistency.",
      intensity: "Moderate load, higher volume",
      repBias: "8-12",
      deloadWeek: 4
    },
    {
      title: "Development",
      objective: "Increase weekly volume with slightly heavier loading.",
      intensity: "Moderate to heavy",
      repBias: "6-10",
      deloadWeek: 4
    },
    {
      title: "Realization",
      objective: "Push top sets while preserving enough volume to grow.",
      intensity: "Heavy top sets, moderate back-off work",
      repBias: "5-8",
      deloadWeek: 4
    }
  ],
  strength: [
    {
      title: "Foundation",
      objective: "Groove competition-style lifts and positional strength.",
      intensity: "Moderate intensity, technical volume",
      repBias: "4-6",
      deloadWeek: 4
    },
    {
      title: "Intensification",
      objective: "Drive heavier top work and reduce fatigue.",
      intensity: "Heavy compound emphasis",
      repBias: "3-5",
      deloadWeek: 4
    },
    {
      title: "Peak",
      objective: "Convert strength into high-quality top sets.",
      intensity: "Heavy top sets with low fatigue",
      repBias: "2-4",
      deloadWeek: 4
    }
  ],
  fat_loss: [
    {
      title: "Base",
      objective: "Establish training consistency and calorie output.",
      intensity: "Moderate intensity, dense sessions",
      repBias: "8-12",
      deloadWeek: 4
    },
    {
      title: "Density",
      objective: "Increase work density and movement efficiency.",
      intensity: "Moderate with shorter rests",
      repBias: "10-15",
      deloadWeek: 4
    },
    {
      title: "Retention",
      objective: "Hold onto strength while sustaining conditioning work.",
      intensity: "Moderate-heavy lifts with conditioning finishers",
      repBias: "6-10",
      deloadWeek: 4
    }
  ],
  athleticism: [
    {
      title: "Movement Base",
      objective: "Build movement quality, coordination, and trunk control.",
      intensity: "Moderate with varied movement patterns",
      repBias: "6-10",
      deloadWeek: 4
    },
    {
      title: "Power Build",
      objective: "Add explosive work and unilateral capacity.",
      intensity: "Power + strength blend",
      repBias: "4-8",
      deloadWeek: 4
    },
    {
      title: "Transfer",
      objective: "Blend strength, speed, and conditioning for performance.",
      intensity: "Mixed intensities",
      repBias: "3-8",
      deloadWeek: 4
    }
  ],
  endurance: [
    {
      title: "Aerobic Base",
      objective: "Build repeatable work capacity and durable movement quality.",
      intensity: "Low to moderate steady work",
      repBias: "8-12",
      deloadWeek: 4
    },
    {
      title: "Threshold",
      objective: "Improve sustainable high-output training sessions.",
      intensity: "Moderate with interval focus",
      repBias: "6-10",
      deloadWeek: 4
    },
    {
      title: "Event Prep",
      objective: "Blend strength retention with repeat-effort conditioning.",
      intensity: "Moderate strength plus interval density",
      repBias: "5-8",
      deloadWeek: 4
    }
  ]
};

function pickExercises(
  focusLabel: string,
  equipment: string[],
  repBias: string,
  weekNumber: number
): PlannedExercise[] {
  const categoryMap: Record<string, ExerciseCategory[]> = {
    lower: ["squat", "hinge", "squat", "core", "conditioning"],
    upper: ["push", "pull", "push", "pull", "core"],
    push: ["push", "push", "core", "conditioning", "carry"],
    pull: ["pull", "pull", "hinge", "core", "conditioning"],
    legs: ["squat", "hinge", "squat", "core", "conditioning"],
    conditioning: ["conditioning", "squat", "push", "core", "carry"],
    full: ["squat", "push", "pull", "hinge", "core"],
    athletic: ["squat", "hinge", "push", "conditioning", "core"]
  };

  const focusKey = focusLabel.toLowerCase();
  const desiredCategories =
    (focusKey.includes("lower") && categoryMap.lower) ||
    (focusKey.includes("upper") && categoryMap.upper) ||
    (focusKey.includes("push") && categoryMap.push) ||
    (focusKey.includes("pull") && categoryMap.pull) ||
    (focusKey.includes("legs") && categoryMap.legs) ||
    (focusKey.includes("conditioning") && categoryMap.conditioning) ||
    (focusKey.includes("athletic") && categoryMap.athletic) ||
    categoryMap.full;

  const targetExerciseCount = focusKey.includes("conditioning") ? 4 : 5;
  const available = exerciseLibrary.filter((exercise) =>
    exercise.equipment.some((item) => equipment.includes(item) || item === "bodyweight")
  );
  const selectedIds = new Set<string>();
  const selected: typeof exerciseLibrary = [];

  function addExercise(category?: ExerciseCategory) {
    const source = available.length ? available : exerciseLibrary;
    const fromPreferredEquipment = source.find(
      (exercise) => !selectedIds.has(exercise.id) && (!category || exercise.category === category)
    );
    const fallback = exerciseLibrary.find(
      (exercise) => !selectedIds.has(exercise.id) && (!category || exercise.category === category)
    );
    const nextExercise = fromPreferredEquipment ?? fallback;

    if (nextExercise) {
      selectedIds.add(nextExercise.id);
      selected.push(nextExercise);
    }
  }

  desiredCategories.forEach((category) => {
    if (selected.length < targetExerciseCount) {
      addExercise(category);
    }
  });

  while (selected.length < targetExerciseCount) {
    const before = selected.length;
    addExercise();

    if (selected.length === before) {
      break;
    }
  }

  return selected.map((exercise, index) => ({
    id: `${exercise.id}-${weekNumber}-${index}`,
    exerciseId: exercise.id,
    name: exercise.name,
    sets: exercise.category === "conditioning" || focusKey.includes("conditioning") ? 3 : index === 0 ? 4 : 3,
    repRange: exercise.category === "conditioning" ? "30-45 sec" : repBias,
    restSeconds: exercise.category === "conditioning" || focusKey.includes("conditioning") ? 45 : 90,
    targetRpe: exercise.category === "conditioning" || focusKey.includes("conditioning") ? 7 : 8,
    notes:
      index === 0
        ? "Top exercise of the day. Push load or reps if readiness is high."
        : "Stay 1 to 2 reps in reserve unless technique breaks down."
  }));
}

function createDay(
  focusLabel: string,
  dayNumber: number,
  equipment: string[],
  repBias: string,
  weekNumber: number
): ProgramDay {
  return {
    id: `${focusLabel.toLowerCase().replace(/\s+/g, "-")}-${weekNumber}-${dayNumber}`,
    dayNumber,
    title: focusLabel,
    focus: focusLabel,
    warmup: "5 to 8 minutes of pulse-raising cardio, mobility, and 2 ramp-up sets on the first movement.",
    exercises: pickExercises(focusLabel, equipment, repBias, weekNumber),
    finisher: focusLabel.toLowerCase().includes("conditioning")
      ? "Finish with 8 to 12 minutes of intervals."
      : "Finish with trunk work or loaded carries if time remains."
  };
}

function createWeeks(
  blockId: string,
  monthNumber: number,
  daysPerWeek: number,
  focus: GeneratorInput["focus"],
  equipment: string[],
  repBias: string,
  deloadWeek: number
): ProgramWeek[] {
  const focusRotation = focusTemplates[focus].slice(0, daysPerWeek);

  return Array.from({ length: 4 }, (_, weekIndex) => {
    const weekNumber = (monthNumber - 1) * 4 + weekIndex + 1;
    const isDeload = weekIndex + 1 === deloadWeek;

    return {
      id: `${blockId}-week-${weekNumber}`,
      weekNumber,
      isDeload,
      focus: isDeload ? "Recovery and resensitization" : `Progress week ${weekIndex + 1}`,
      days: focusRotation.map((focusLabel, dayIndex) =>
        createDay(
          focusLabel,
          dayIndex + 1,
          equipment,
          isDeload ? "6-8 easy" : repBias,
          weekNumber
        )
      )
    };
  });
}

export function generateProgram(input: GeneratorInput): TrainingProgram {
  const blocks = blockBlueprints[input.primaryGoal].slice(0, input.targetMonths);

  const programBlocks: ProgramBlock[] = blocks.map((block, index) => {
    const monthNumber = index + 1;
    const blockId = `block-${monthNumber}`;

    return {
      id: blockId,
      monthNumber,
      title: `Month ${monthNumber}: ${block.title}`,
      objective: block.objective,
      intensity: block.intensity,
      weeks: createWeeks(
        blockId,
        monthNumber,
        input.daysPerWeek,
        input.focus,
        input.equipment,
        block.repBias,
        block.deloadWeek
      )
    };
  });

  return {
    id: `program-${input.primaryGoal}-${Date.now()}`,
    title: `${input.targetMonths}-Month ${input.primaryGoal.replace("_", " ")} plan`,
    summary: `Built for ${input.trainingAge} training age, ${input.daysPerWeek} sessions per week, and ${input.sessionLength}-minute sessions.`,
    createdAt: new Date().toISOString(),
    input,
    blocks: programBlocks
  };
}
