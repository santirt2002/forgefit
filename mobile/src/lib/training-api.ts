import { supabase } from "@/lib/supabase";
import type { GeneratorInput, SetLog, TrainingProgram } from "@/lib/types";

type ProgramRow = {
  id: string;
  title: string;
  summary: string;
  created_at: string;
  input: GeneratorInput;
};

type ProgramBlockRow = {
  id: string;
  program_id: string;
  sort_order: number;
  month_number: number;
  title: string;
  objective: string;
  intensity: string;
};

type ProgramWeekRow = {
  id: string;
  block_id: string;
  sort_order: number;
  week_number: number;
  is_deload: boolean;
  focus: string;
};

type ProgramDayRow = {
  id: string;
  week_id: string;
  sort_order: number;
  day_number: number;
  title: string;
  focus: string;
  warmup: string;
  finisher: string;
};

type PlannedExerciseRow = {
  id: string;
  program_day_id: string;
  sort_order: number;
  exercise_id: string;
  name: string;
  sets_target: number;
  rep_range: string;
  rest_seconds: number;
  target_rpe: number | string;
  notes: string;
};

type WorkoutSessionRow = {
  id: string;
  program_day_id: string | null;
  session_number: number;
  performed_on: string;
};

type SetLogRow = {
  id: string;
  session_id: string;
  exercise_id: string;
  exercise_name: string;
  set_number: number;
  reps: number;
  weight: number | string;
  rpe: number | string;
  performed_at: string;
};

export type CreateSetLogInput = {
  dayId: string;
  exerciseId: string;
  exerciseName: string;
  sessionNumber: number;
  setNumber: number;
  reps: number;
  weight: number;
  rpe: number;
};

function toErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong while syncing your training data.";
}

function mapProgram(
  program: ProgramRow,
  blocks: ProgramBlockRow[],
  weeks: ProgramWeekRow[],
  days: ProgramDayRow[],
  exercises: PlannedExerciseRow[]
): TrainingProgram {
  const weeksByBlock = new Map<string, ProgramWeekRow[]>();
  const daysByWeek = new Map<string, ProgramDayRow[]>();
  const exercisesByDay = new Map<string, PlannedExerciseRow[]>();

  weeks.forEach((week) => {
    weeksByBlock.set(week.block_id, [...(weeksByBlock.get(week.block_id) ?? []), week]);
  });

  days.forEach((day) => {
    daysByWeek.set(day.week_id, [...(daysByWeek.get(day.week_id) ?? []), day]);
  });

  exercises.forEach((exercise) => {
    exercisesByDay.set(exercise.program_day_id, [
      ...(exercisesByDay.get(exercise.program_day_id) ?? []),
      exercise
    ]);
  });

  return {
    id: program.id,
    title: program.title,
    summary: program.summary,
    createdAt: program.created_at,
    input: program.input,
    blocks: [...blocks]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((block) => ({
        id: block.id,
        monthNumber: block.month_number,
        title: block.title,
        objective: block.objective,
        intensity: block.intensity,
        weeks: [...(weeksByBlock.get(block.id) ?? [])]
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((week) => ({
            id: week.id,
            weekNumber: week.week_number,
            isDeload: week.is_deload,
            focus: week.focus,
            days: [...(daysByWeek.get(week.id) ?? [])]
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((day) => ({
                id: day.id,
                dayNumber: day.day_number,
                title: day.title,
                focus: day.focus,
                warmup: day.warmup,
                finisher: day.finisher,
                exercises: [...(exercisesByDay.get(day.id) ?? [])]
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map((exercise) => ({
                    id: exercise.id,
                    exerciseId: exercise.exercise_id,
                    name: exercise.name,
                    sets: exercise.sets_target,
                    repRange: exercise.rep_range,
                    restSeconds: exercise.rest_seconds,
                    targetRpe: Number(exercise.target_rpe),
                    notes: exercise.notes
                  }))
              }))
          }))
      }))
  };
}

function mapSetLogs(programId: string, sessions: WorkoutSessionRow[], setLogs: SetLogRow[]): SetLog[] {
  const sessionsById = new Map(sessions.map((session) => [session.id, session]));

  return setLogs
    .map((log) => {
      const session = sessionsById.get(log.session_id);

      if (!session?.program_day_id) {
        return null;
      }

      return {
        id: log.id,
        programId,
        dayId: session.program_day_id,
        exerciseId: log.exercise_id,
        exerciseName: log.exercise_name,
        sessionNumber: session.session_number,
        setNumber: log.set_number,
        reps: log.reps,
        weight: Number(log.weight),
        rpe: Number(log.rpe),
        performedOn: log.performed_at
      };
    })
    .filter((log): log is SetLog => Boolean(log))
    .sort((a, b) => b.performedOn.localeCompare(a.performedOn));
}

export async function ensureProfile(userId: string, email?: string | null) {
  const { error } = await supabase.from("profiles").upsert(
    {
      id: userId,
      email: email ?? null
    },
    {
      onConflict: "id"
    }
  );

  if (error) {
    throw new Error(toErrorMessage(error));
  }
}

export async function loadTrainingState(userId: string) {
  const { data: program, error: programError } = await supabase
    .from("training_programs")
    .select("id, title, summary, created_at, input")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (programError) {
    throw new Error(toErrorMessage(programError));
  }

  if (!program) {
    return {
      activeProgram: null,
      setLogs: [] as SetLog[]
    };
  }

  const { data: blocks, error: blocksError } = await supabase
    .from("program_blocks")
    .select("id, program_id, sort_order, month_number, title, objective, intensity")
    .eq("program_id", program.id)
    .order("sort_order", { ascending: true });

  if (blocksError) {
    throw new Error(toErrorMessage(blocksError));
  }

  const blockIds = (blocks ?? []).map((block) => block.id);

  const { data: weeks, error: weeksError } = blockIds.length
    ? await supabase
        .from("program_weeks")
        .select("id, block_id, sort_order, week_number, is_deload, focus")
        .in("block_id", blockIds)
        .order("sort_order", { ascending: true })
    : { data: [], error: null };

  if (weeksError) {
    throw new Error(toErrorMessage(weeksError));
  }

  const weekIds = (weeks ?? []).map((week) => week.id);

  const { data: days, error: daysError } = weekIds.length
    ? await supabase
        .from("program_days")
        .select("id, week_id, sort_order, day_number, title, focus, warmup, finisher")
        .in("week_id", weekIds)
        .order("sort_order", { ascending: true })
    : { data: [], error: null };

  if (daysError) {
    throw new Error(toErrorMessage(daysError));
  }

  const dayIds = (days ?? []).map((day) => day.id);

  const { data: exercises, error: exercisesError } = dayIds.length
    ? await supabase
        .from("planned_exercises")
        .select(
          "id, program_day_id, sort_order, exercise_id, name, sets_target, rep_range, rest_seconds, target_rpe, notes"
        )
        .in("program_day_id", dayIds)
        .order("sort_order", { ascending: true })
    : { data: [], error: null };

  if (exercisesError) {
    throw new Error(toErrorMessage(exercisesError));
  }

  const { data: sessions, error: sessionsError } = await supabase
    .from("workout_sessions")
    .select("id, program_day_id, session_number, performed_on")
    .eq("user_id", userId)
    .eq("program_id", program.id)
    .order("performed_on", { ascending: false });

  if (sessionsError) {
    throw new Error(toErrorMessage(sessionsError));
  }

  const sessionIds = (sessions ?? []).map((session) => session.id);

  const { data: setLogs, error: setLogsError } = sessionIds.length
    ? await supabase
        .from("set_logs")
        .select("id, session_id, exercise_id, exercise_name, set_number, reps, weight, rpe, performed_at")
        .in("session_id", sessionIds)
        .order("performed_at", { ascending: false })
    : { data: [], error: null };

  if (setLogsError) {
    throw new Error(toErrorMessage(setLogsError));
  }

  return {
    activeProgram: mapProgram(
      program as ProgramRow,
      (blocks ?? []) as ProgramBlockRow[],
      (weeks ?? []) as ProgramWeekRow[],
      (days ?? []) as ProgramDayRow[],
      (exercises ?? []) as PlannedExerciseRow[]
    ),
    setLogs: mapSetLogs(program.id, (sessions ?? []) as WorkoutSessionRow[], (setLogs ?? []) as SetLogRow[])
  };
}

export async function saveGeneratedProgram(
  userId: string,
  input: GeneratorInput,
  draftProgram: TrainingProgram
) {
  const { error: deactivateError } = await supabase
    .from("training_programs")
    .update({ is_active: false })
    .eq("user_id", userId)
    .eq("is_active", true);

  if (deactivateError) {
    throw new Error(toErrorMessage(deactivateError));
  }

  const { data: insertedProgram, error: insertProgramError } = await supabase
    .from("training_programs")
    .insert({
      user_id: userId,
      title: draftProgram.title,
      summary: draftProgram.summary,
      input,
      is_active: true
    })
    .select("id")
    .single();

  if (insertProgramError || !insertedProgram) {
    throw new Error(toErrorMessage(insertProgramError));
  }

  for (const [blockIndex, block] of draftProgram.blocks.entries()) {
    const { data: insertedBlock, error: blockError } = await supabase
      .from("program_blocks")
      .insert({
        program_id: insertedProgram.id,
        sort_order: blockIndex,
        month_number: block.monthNumber,
        title: block.title,
        objective: block.objective,
        intensity: block.intensity
      })
      .select("id")
      .single();

    if (blockError || !insertedBlock) {
      throw new Error(toErrorMessage(blockError));
    }

    for (const [weekIndex, week] of block.weeks.entries()) {
      const { data: insertedWeek, error: weekError } = await supabase
        .from("program_weeks")
        .insert({
          block_id: insertedBlock.id,
          sort_order: weekIndex,
          week_number: week.weekNumber,
          is_deload: week.isDeload,
          focus: week.focus
        })
        .select("id")
        .single();

      if (weekError || !insertedWeek) {
        throw new Error(toErrorMessage(weekError));
      }

      for (const [dayIndex, day] of week.days.entries()) {
        const { data: insertedDay, error: dayError } = await supabase
          .from("program_days")
          .insert({
            week_id: insertedWeek.id,
            sort_order: dayIndex,
            day_number: day.dayNumber,
            title: day.title,
            focus: day.focus,
            warmup: day.warmup,
            finisher: day.finisher
          })
          .select("id")
          .single();

        if (dayError || !insertedDay) {
          throw new Error(toErrorMessage(dayError));
        }

        for (const [exerciseIndex, exercise] of day.exercises.entries()) {
          const { error: exerciseError } = await supabase.from("planned_exercises").insert({
            program_day_id: insertedDay.id,
            sort_order: exerciseIndex,
            exercise_id: exercise.exerciseId,
            name: exercise.name,
            sets_target: exercise.sets,
            rep_range: exercise.repRange,
            rest_seconds: exercise.restSeconds,
            target_rpe: exercise.targetRpe,
            notes: exercise.notes
          });

          if (exerciseError) {
            throw new Error(toErrorMessage(exerciseError));
          }
        }
      }
    }
  }

  const { activeProgram } = await loadTrainingState(userId);

  if (!activeProgram) {
    throw new Error("The new program was saved, but the app could not reload it.");
  }

  return activeProgram;
}

export async function createSetLog(userId: string, programId: string, payload: CreateSetLogInput) {
  const performedDate = new Date().toISOString().slice(0, 10);

  const { data: existingSession, error: existingSessionError } = await supabase
    .from("workout_sessions")
    .select("id, program_day_id, session_number, performed_on")
    .eq("user_id", userId)
    .eq("program_id", programId)
    .eq("program_day_id", payload.dayId)
    .eq("session_number", payload.sessionNumber)
    .maybeSingle();

  if (existingSessionError) {
    throw new Error(toErrorMessage(existingSessionError));
  }

  let sessionId = existingSession?.id;

  if (!sessionId) {
    const { data: insertedSession, error: insertSessionError } = await supabase
      .from("workout_sessions")
      .insert({
        user_id: userId,
        program_id: programId,
        program_day_id: payload.dayId,
        session_number: payload.sessionNumber,
        performed_on: performedDate
      })
      .select("id")
      .single();

    if (insertSessionError || !insertedSession) {
      throw new Error(toErrorMessage(insertSessionError));
    }

    sessionId = insertedSession.id;
  }

  const performedAt = new Date().toISOString();

  const { data: insertedSetLog, error: insertSetLogError } = await supabase
    .from("set_logs")
    .insert({
      user_id: userId,
      session_id: sessionId,
      exercise_id: payload.exerciseId,
      exercise_name: payload.exerciseName,
      set_number: payload.setNumber,
      reps: payload.reps,
      weight: payload.weight,
      rpe: payload.rpe,
      performed_at: performedAt
    })
    .select("id, session_id, exercise_id, exercise_name, set_number, reps, weight, rpe, performed_at")
    .single();

  if (insertSetLogError || !insertedSetLog) {
    throw new Error(toErrorMessage(insertSetLogError));
  }

  return {
    id: insertedSetLog.id,
    programId,
    dayId: payload.dayId,
    exerciseId: insertedSetLog.exercise_id,
    exerciseName: insertedSetLog.exercise_name,
    sessionNumber: payload.sessionNumber,
    setNumber: insertedSetLog.set_number,
    reps: insertedSetLog.reps,
    weight: Number(insertedSetLog.weight),
    rpe: Number(insertedSetLog.rpe),
    performedOn: insertedSetLog.performed_at
  };
}

export async function deleteSetLog(userId: string, setLogId: string) {
  const { data: existingLog, error: lookupError } = await supabase
    .from("set_logs")
    .select("id, session_id")
    .eq("id", setLogId)
    .eq("user_id", userId)
    .maybeSingle();

  if (lookupError) {
    throw new Error(toErrorMessage(lookupError));
  }

  if (!existingLog) {
    return;
  }

  const { error: deleteError } = await supabase
    .from("set_logs")
    .delete()
    .eq("id", setLogId)
    .eq("user_id", userId);

  if (deleteError) {
    throw new Error(toErrorMessage(deleteError));
  }

  const { count, error: countError } = await supabase
    .from("set_logs")
    .select("id", { count: "exact", head: true })
    .eq("session_id", existingLog.session_id);

  if (countError) {
    throw new Error(toErrorMessage(countError));
  }

  if (count === 0) {
    await supabase
      .from("workout_sessions")
      .delete()
      .eq("id", existingLog.session_id)
      .eq("user_id", userId);
  }
}
