import { create } from "zustand";
import { generateProgram } from "@/lib/program-generator";
import {
  createSetLog,
  deleteSetLog,
  ensureProfile,
  loadTrainingState,
  saveGeneratedProgram
} from "@/lib/training-api";
import type { GeneratorInput, SetLog, TrainingProgram } from "@/lib/types";

const defaultInput: GeneratorInput = {
  primaryGoal: "hypertrophy",
  secondaryGoal: "body_composition",
  trainingAge: "intermediate",
  daysPerWeek: 4,
  sessionLength: 60,
  focus: "upper_lower",
  limitations: "",
  equipment: ["barbell", "rack", "bench", "dumbbells", "pull_up_bar", "cardio_machine"],
  targetMonths: 3
};

function buildSeededProgram() {
  return generateProgram(defaultInput);
}

function buildSeededLogs(program: TrainingProgram): SetLog[] {
  return [
    {
      id: "log-1",
      programId: program.id,
      dayId: program.blocks[0].weeks[0].days[0].id,
      exerciseId: program.blocks[0].weeks[0].days[0].exercises[0].exerciseId,
      exerciseName: program.blocks[0].weeks[0].days[0].exercises[0].name,
      sessionNumber: 1,
      setNumber: 1,
      reps: 8,
      weight: 135,
      rpe: 8,
      performedOn: new Date().toISOString()
    },
    {
      id: "log-2",
      programId: program.id,
      dayId: program.blocks[0].weeks[0].days[1].id,
      exerciseId: program.blocks[0].weeks[0].days[1].exercises[0].exerciseId,
      exerciseName: program.blocks[0].weeks[0].days[1].exercises[0].name,
      sessionNumber: 1,
      setNumber: 1,
      reps: 10,
      weight: 55,
      rpe: 7,
      performedOn: new Date().toISOString()
    }
  ];
}

function createLocalState() {
  const activeProgram = buildSeededProgram();

  return {
    generatorInput: defaultInput,
    activeProgram,
    setLogs: buildSeededLogs(activeProgram)
  };
}

function toErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong while syncing your training data.";
}

type TrainingState = {
  generatorInput: GeneratorInput;
  activeProgram: TrainingProgram;
  setLogs: SetLog[];
  isHydrating: boolean;
  isSavingProgram: boolean;
  isLoggingSet: boolean;
  deletingLogId: string | null;
  syncError: string | null;
  syncedUserId: string | null;
  updateGeneratorInput: <K extends keyof GeneratorInput>(key: K, value: GeneratorInput[K]) => void;
  toggleEquipment: (equipment: string) => void;
  clearSyncError: () => void;
  resetForSignedOut: () => void;
  hydrateFromSupabase: (userId: string, email?: string | null) => Promise<void>;
  generateNewProgram: (userId?: string | null) => Promise<void>;
  logSet: (
    payload: Omit<SetLog, "id" | "programId" | "performedOn">,
    userId?: string | null
  ) => Promise<void>;
  deleteLog: (logId: string, userId?: string | null) => Promise<void>;
};

const seededState = createLocalState();

export const useTrainingStore = create<TrainingState>((set, get) => ({
  ...seededState,
  isHydrating: false,
  isSavingProgram: false,
  isLoggingSet: false,
  deletingLogId: null,
  syncError: null,
  syncedUserId: null,
  updateGeneratorInput: (key, value) =>
    set((state) => ({
      generatorInput: {
        ...state.generatorInput,
        [key]: value
      }
    })),
  toggleEquipment: (equipment) =>
    set((state) => {
      const exists = state.generatorInput.equipment.includes(equipment);
      const nextEquipment = exists
        ? state.generatorInput.equipment.filter((item) => item !== equipment)
        : [...state.generatorInput.equipment, equipment];

      return {
        generatorInput: {
          ...state.generatorInput,
          equipment: nextEquipment.length ? nextEquipment : ["bodyweight"]
        }
      };
    }),
  clearSyncError: () => set({ syncError: null }),
  resetForSignedOut: () => {
    const localState = createLocalState();

    set({
      ...localState,
      isHydrating: false,
      isSavingProgram: false,
      isLoggingSet: false,
      deletingLogId: null,
      syncError: null,
      syncedUserId: null
    });
  },
  hydrateFromSupabase: async (userId, email) => {
    set({ isHydrating: true, syncError: null });

    try {
      await ensureProfile(userId, email);
      const { activeProgram, setLogs } = await loadTrainingState(userId);

      if (!activeProgram) {
        const localState = createLocalState();

        set({
          ...localState,
          setLogs: [],
          isHydrating: false,
          syncedUserId: userId
        });

        return;
      }

      set({
        activeProgram,
        generatorInput: activeProgram.input,
        setLogs,
        isHydrating: false,
        syncError: null,
        syncedUserId: userId
      });
    } catch (error) {
      set({
        isHydrating: false,
        syncError: toErrorMessage(error)
      });
    }
  },
  generateNewProgram: async (userId) => {
    const nextProgram = generateProgram(get().generatorInput);

    set({
      activeProgram: nextProgram,
      setLogs: [],
      isSavingProgram: Boolean(userId),
      syncError: null
    });

    if (!userId) {
      set({ isSavingProgram: false });
      return;
    }

    try {
      const savedProgram = await saveGeneratedProgram(userId, get().generatorInput, nextProgram);

      set({
        activeProgram: savedProgram,
        generatorInput: savedProgram.input,
        setLogs: [],
        isSavingProgram: false,
        syncError: null,
        syncedUserId: userId
      });
    } catch (error) {
      set({
        isSavingProgram: false,
        syncError: toErrorMessage(error)
      });
    }
  },
  logSet: async (payload, userId) => {
    const optimisticLog: SetLog = {
      ...payload,
      id: `log-${Date.now()}`,
      programId: get().activeProgram.id,
      performedOn: new Date().toISOString()
    };

    if (!userId) {
      set((state) => ({
        setLogs: [optimisticLog, ...state.setLogs]
      }));
      return;
    }

    set({ isLoggingSet: true, syncError: null });

    try {
      const savedLog = await createSetLog(userId, get().activeProgram.id, payload);

      set((state) => ({
        setLogs: [savedLog, ...state.setLogs],
        isLoggingSet: false,
        syncError: null
      }));
    } catch (error) {
      set({
        isLoggingSet: false,
        syncError: toErrorMessage(error)
      });
    }
  },
  deleteLog: async (logId, userId) => {
    const previousLogs = get().setLogs;

    set((state) => ({
      setLogs: state.setLogs.filter((log) => log.id !== logId),
      deletingLogId: logId,
      syncError: null
    }));

    if (!userId) {
      set({ deletingLogId: null });
      return;
    }

    try {
      await deleteSetLog(userId, logId);
      set({ deletingLogId: null, syncError: null });
    } catch (error) {
      set({
        setLogs: previousLogs,
        deletingLogId: null,
        syncError: toErrorMessage(error)
      });
    }
  }
}));
