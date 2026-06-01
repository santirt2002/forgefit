import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Panel } from "@/components/ui/panel";
import { SectionHeading } from "@/components/ui/section-heading";
import { useTrainingStore } from "@/lib/training-store";
import { useAuth } from "@/providers/auth-provider";
import { colors, radii, spacing } from "@/theme/tokens";

export function TrackerScreen() {
  const { user } = useAuth();
  const activeProgram = useTrainingStore((state) => state.activeProgram);
  const setLogs = useTrainingStore((state) => state.setLogs);
  const isLoggingSet = useTrainingStore((state) => state.isLoggingSet);
  const deletingLogId = useTrainingStore((state) => state.deletingLogId);
  const syncError = useTrainingStore((state) => state.syncError);
  const logSet = useTrainingStore((state) => state.logSet);
  const deleteLog = useTrainingStore((state) => state.deleteLog);
  const [dayId, setDayId] = useState(activeProgram.blocks[0].weeks[0].days[0]?.id);
  const [entries, setEntries] = useState<Record<string, { reps: string; weight: string; rpe: string }>>({});

  const allDays = activeProgram.blocks.flatMap((block) => block.weeks.flatMap((week) => week.days));
  const activeDay = allDays.find((day) => day.id === dayId) ?? allDays[0];
  const today = new Date().toISOString().slice(0, 10);
  const activeDayLogs = useMemo(
    () => setLogs.filter((log) => log.dayId === activeDay?.id),
    [activeDay?.id, setLogs]
  );

  const recentLogs = useMemo(() => activeDayLogs.slice(0, 8), [activeDayLogs]);

  const currentSessionNumber = useMemo(() => {
    if (!activeDay) {
      return 1;
    }

    const todayLogs = activeDayLogs.filter((log) => log.performedOn.slice(0, 10) === today);

    if (todayLogs.length > 0) {
      return Math.max(...todayLogs.map((log) => log.sessionNumber));
    }

    return Math.max(0, ...activeDayLogs.map((log) => log.sessionNumber)) + 1;
  }, [activeDay, activeDayLogs, today]);

  function getCurrentSessionLogs(exerciseId: string) {
    return activeDayLogs.filter(
      (log) =>
        log.exerciseId === exerciseId &&
        log.sessionNumber === currentSessionNumber &&
        log.performedOn.slice(0, 10) === today
    );
  }

  function getLoggedSetCount(exerciseId: string) {
    return getCurrentSessionLogs(exerciseId).length;
  }

  function updateEntry(exerciseId: string, key: "reps" | "weight" | "rpe", value: string) {
    setEntries((current) => ({
      ...current,
      [exerciseId]: {
        reps: current[exerciseId]?.reps ?? "",
        weight: current[exerciseId]?.weight ?? "",
        rpe: current[exerciseId]?.rpe ?? "",
        [key]: value
      }
    }));
  }

  function getNextSetNumber(exerciseId: string) {
    return getLoggedSetCount(exerciseId) + 1;
  }

  async function handleLogSet(exerciseId: string, exerciseName: string) {
    if (!activeDay) {
      return;
    }

    const current = entries[exerciseId];

    if (!current?.reps || !current.weight || !current.rpe) {
      return;
    }

    await logSet({
      dayId: activeDay.id,
      exerciseId,
      exerciseName,
      sessionNumber: currentSessionNumber,
      setNumber: getNextSetNumber(exerciseId),
      reps: Number(current.reps),
      weight: Number(current.weight),
      rpe: Number(current.rpe)
    }, user?.id);

    setEntries((existing) => ({
      ...existing,
      [exerciseId]: {
        reps: "",
        weight: "",
        rpe: ""
      }
    }));
  }

  function handleDeleteLog(logId: string, exerciseName: string) {
    Alert.alert("Delete entry?", `Remove this ${exerciseName} set from your workout history?`, [
      {
        text: "Cancel",
        style: "cancel"
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => void deleteLog(logId, user?.id)
      }
    ]);
  }

  const completedExerciseCount = activeDay?.exercises.filter(
    (exercise) => getLoggedSetCount(exercise.exerciseId) >= exercise.sets
  ).length ?? 0;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <SectionHeading
        eyebrow="Tracker"
        title="Own every set"
        subtitle="Your generated plan becomes a live logbook for reps, load, RPE, dates, and progress charts."
      />

      <LinearGradient
        colors={["#253529", "#111813", "#FF6B35"]}
        locations={[0, 0.62, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.trackerHero}
      >
        <Text style={styles.heroKicker}>Live session</Text>
        <Text style={styles.heroTitle}>{activeDay?.title ?? "Workout session"}</Text>
        <Text style={styles.heroText}>
          Session {currentSessionNumber} is ready. Log each set as you train and your dashboard updates automatically.
        </Text>
        <View style={styles.heroMetricRow}>
          <View style={styles.heroMetric}>
            <Text style={styles.heroMetricValue}>{activeDay?.exercises.length ?? 0}</Text>
            <Text style={styles.heroMetricLabel}>Exercises</Text>
          </View>
          <View style={styles.heroMetric}>
            <Text style={styles.heroMetricValue}>{activeDayLogs.length}</Text>
            <Text style={styles.heroMetricLabel}>Sets logged</Text>
          </View>
          <View style={styles.heroMetric}>
            <Text style={styles.heroMetricValue}>{completedExerciseCount}</Text>
            <Text style={styles.heroMetricLabel}>Complete</Text>
          </View>
        </View>
      </LinearGradient>

      <Panel>
        <Text style={styles.sectionTitle}>Choose session</Text>
        <View style={styles.choiceWrap}>
          {allDays.slice(0, 6).map((day) => (
            <Pressable
              key={day.id}
              onPress={() => setDayId(day.id)}
              style={[styles.dayPill, day.id === activeDay?.id && styles.dayPillActive]}
            >
              <Text style={[styles.dayPillText, day.id === activeDay?.id && styles.dayPillTextActive]}>
                Day {day.dayNumber}
              </Text>
            </Pressable>
          ))}
        </View>
        {activeDay ? (
          <>
            <Text style={styles.activeDayTitle}>{activeDay.title}</Text>
            <Text style={styles.activeDaySubtitle}>{activeDay.warmup}</Text>
          </>
        ) : null}
      </Panel>

      {activeDay?.exercises.map((exercise) => {
        const entry = entries[exercise.exerciseId] ?? { reps: "", weight: "", rpe: "" };
        const loggedSetCount = getLoggedSetCount(exercise.exerciseId);
        const isComplete = loggedSetCount >= exercise.sets;
        const setNumber = Math.min(getNextSetNumber(exercise.exerciseId), exercise.sets);

        return (
          <View key={exercise.id} style={[styles.exerciseCard, isComplete && styles.exerciseCardComplete]}>
            <View style={styles.exerciseHeader}>
              <View style={[styles.exerciseBadge, isComplete && styles.exerciseBadgeComplete]}>
                <Text style={[styles.exerciseBadgeText, isComplete && styles.exerciseBadgeCompleteText]}>
                  {isComplete ? "OK" : `${exercise.sets}x`}
                </Text>
              </View>
              <View style={styles.exerciseHeaderText}>
                <Text style={styles.exerciseTitle}>{exercise.name}</Text>
                <Text style={styles.exerciseMeta}>
                  {exercise.repRange} reps | target RPE {exercise.targetRpe}
                </Text>
              </View>
              {isComplete ? (
                <View style={styles.completePill}>
                  <Text style={styles.completePillText}>Complete</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.setProgressWrap}>
              <View style={styles.setProgressDots}>
                {Array.from({ length: exercise.sets }, (_, index) => (
                  <View
                    key={`${exercise.id}-set-${index}`}
                    style={[styles.setDot, index < loggedSetCount && styles.setDotComplete]}
                  />
                ))}
              </View>
              <Text style={styles.setProgressText}>
                {Math.min(loggedSetCount, exercise.sets)} of {exercise.sets} planned sets logged
              </Text>
            </View>

            <View style={styles.inputRow}>
              <MiniInput
                label="Reps"
                value={entry.reps}
                onChangeText={(value) => updateEntry(exercise.exerciseId, "reps", value)}
              />
              <MiniInput
                label="Weight"
                value={entry.weight}
                onChangeText={(value) => updateEntry(exercise.exerciseId, "weight", value)}
              />
              <MiniInput
                label="RPE"
                value={entry.rpe}
                onChangeText={(value) => updateEntry(exercise.exerciseId, "rpe", value)}
              />
            </View>

            <Text style={styles.sessionNumber}>
              This will log as session {currentSessionNumber}, set {setNumber}
            </Text>

            <Pressable
              onPress={() => void handleLogSet(exercise.exerciseId, exercise.name)}
              style={[styles.logButton, (isLoggingSet || isComplete) && styles.logButtonDisabled]}
              disabled={isLoggingSet || isComplete}
            >
              <Text style={styles.logButtonText}>
                {isComplete ? "Exercise complete" : isLoggingSet ? "Saving..." : "Log set"}
              </Text>
            </Pressable>
          </View>
        );
      })}

      <Panel>
        <Text style={styles.sectionTitle}>Recent entries</Text>
        {recentLogs.length === 0 ? (
          <Text style={styles.emptyText}>No sets logged for this session yet.</Text>
        ) : (
          recentLogs.map((log) => (
            <View key={log.id} style={styles.logRow}>
              <View style={styles.logRowText}>
                <Text style={styles.logExercise}>{log.exerciseName}</Text>
                <Text style={styles.logMeta}>
                  Set {log.setNumber} | {log.reps} reps | {log.weight} weight | RPE {log.rpe}
                </Text>
              </View>
              <View style={styles.logActions}>
                <Text style={styles.logSessionLabel}>S{log.sessionNumber}</Text>
                <Pressable
                  onPress={() => handleDeleteLog(log.id, log.exerciseName)}
                  style={[styles.deleteButton, deletingLogId === log.id && styles.deleteButtonDisabled]}
                  disabled={deletingLogId === log.id}
                >
                  <Text style={styles.deleteButtonText}>
                    {deletingLogId === log.id ? "..." : "Delete"}
                  </Text>
                </Pressable>
              </View>
            </View>
          ))
        )}
        {syncError ? <Text style={styles.errorText}>{syncError}</Text> : null}
      </Panel>
    </ScrollView>
  );
}

function MiniInput({
  label,
  value,
  onChangeText
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
}) {
  return (
    <View style={styles.miniInputWrap}>
      <Text style={styles.miniLabel}>{label}</Text>
      <TextInput
        keyboardType="numeric"
        value={value}
        onChangeText={onChangeText}
        placeholder="0"
        placeholderTextColor={colors.textMuted}
        style={styles.miniInput}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xl
  },
  trackerHero: {
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderOnDark,
    overflow: "hidden"
  },
  heroKicker: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.1,
    textTransform: "uppercase"
  },
  heroTitle: {
    color: colors.textInverse,
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "900"
  },
  heroText: {
    color: colors.mutedOnDark,
    lineHeight: 21
  },
  heroMetricRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: 6
  },
  heroMetric: {
    flex: 1,
    borderRadius: radii.md,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.borderOnDark,
    padding: 12
  },
  heroMetricValue: {
    color: colors.textInverse,
    fontSize: 22,
    fontWeight: "900"
  },
  heroMetricLabel: {
    color: colors.mutedOnDark,
    fontSize: 12,
    fontWeight: "700"
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.text
  },
  choiceWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  dayPill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border
  },
  dayPillActive: {
    backgroundColor: colors.text,
    borderColor: colors.accent
  },
  dayPillText: {
    color: colors.textMuted,
    fontWeight: "600"
  },
  dayPillTextActive: {
    color: colors.textInverse
  },
  activeDayTitle: {
    fontSize: 20,
    color: colors.text,
    fontWeight: "700"
  },
  activeDaySubtitle: {
    color: colors.textMuted,
    lineHeight: 21
  },
  exerciseCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
    shadowColor: colors.shadow,
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 8
    },
    elevation: 3
  },
  exerciseCardComplete: {
    borderColor: "rgba(29, 155, 104, 0.5)",
    backgroundColor: "#F1FFF8"
  },
  exerciseHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  exerciseBadge: {
    width: 46,
    height: 46,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accentSoft
  },
  exerciseBadgeText: {
    color: colors.accentDeep,
    fontWeight: "800"
  },
  exerciseBadgeComplete: {
    backgroundColor: colors.success
  },
  exerciseBadgeCompleteText: {
    color: "white"
  },
  exerciseHeaderText: {
    flex: 1,
    gap: 2
  },
  exerciseTitle: {
    fontSize: 18,
    color: colors.text,
    fontWeight: "700"
  },
  exerciseMeta: {
    color: colors.textMuted
  },
  completePill: {
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: colors.success
  },
  completePillText: {
    color: "white",
    fontSize: 11,
    fontWeight: "900"
  },
  setProgressWrap: {
    gap: 7
  },
  setProgressDots: {
    flexDirection: "row",
    gap: 6
  },
  setDot: {
    flex: 1,
    height: 7,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMuted
  },
  setDotComplete: {
    backgroundColor: colors.success
  },
  setProgressText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "700"
  },
  inputRow: {
    flexDirection: "row",
    gap: spacing.sm
  },
  miniInputWrap: {
    flex: 1,
    gap: 6
  },
  miniLabel: {
    color: colors.textMuted,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8
  },
  miniInput: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: colors.text
  },
  sessionNumber: {
    color: colors.textMuted,
    fontSize: 13
  },
  logButton: {
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
    paddingVertical: 14,
    alignItems: "center"
  },
  logButtonDisabled: {
    opacity: 0.7
  },
  logButtonText: {
    color: "white",
    fontWeight: "700"
  },
  emptyText: {
    color: colors.textMuted
  },
  logRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  logRowText: {
    flex: 1,
    gap: 4
  },
  logExercise: {
    color: colors.text,
    fontWeight: "600"
  },
  logMeta: {
    color: colors.textMuted
  },
  logSessionLabel: {
    color: colors.accentDeep,
    fontWeight: "700"
  },
  logActions: {
    alignItems: "flex-end",
    gap: 6
  },
  deleteButton: {
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: colors.accentSoft
  },
  deleteButtonDisabled: {
    opacity: 0.6
  },
  deleteButtonText: {
    color: colors.accentDeep,
    fontWeight: "800",
    fontSize: 12
  },
  errorText: {
    color: colors.accentDeep,
    lineHeight: 20
  }
});
