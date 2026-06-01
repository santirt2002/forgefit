import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Panel } from "@/components/ui/panel";
import { SectionHeading } from "@/components/ui/section-heading";
import { useTrainingStore } from "@/lib/training-store";
import type { GoalType, ProgramFocus, SecondaryGoal, TrainingAge } from "@/lib/types";
import { useAuth } from "@/providers/auth-provider";
import { colors, radii, spacing } from "@/theme/tokens";

const goalOptions: GoalType[] = ["hypertrophy", "strength", "fat_loss", "athleticism", "endurance"];
const secondaryGoalOptions: SecondaryGoal[] = [
  "body_composition",
  "movement_quality",
  "conditioning",
  "muscle_gain",
  "performance"
];
const ageOptions: TrainingAge[] = ["beginner", "intermediate", "advanced"];
const focusOptions: ProgramFocus[] = ["upper_lower", "push_pull_legs", "full_body", "hybrid"];
const equipmentOptions = ["bodyweight", "barbell", "rack", "bench", "dumbbells", "pull_up_bar", "cardio_machine"];

export function GeneratorScreen() {
  const { user } = useAuth();
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);
  const input = useTrainingStore((state) => state.generatorInput);
  const activeProgram = useTrainingStore((state) => state.activeProgram);
  const isSavingProgram = useTrainingStore((state) => state.isSavingProgram);
  const syncError = useTrainingStore((state) => state.syncError);
  const updateGeneratorInput = useTrainingStore((state) => state.updateGeneratorInput);
  const toggleEquipment = useTrainingStore((state) => state.toggleEquipment);
  const generateNewProgram = useTrainingStore((state) => state.generateNewProgram);
  const totalWeeks = activeProgram.blocks.reduce((sum, block) => sum + block.weeks.length, 0);
  const totalWorkouts = activeProgram.blocks.reduce(
    (sum, block) => sum + block.weeks.reduce((weekSum, week) => weekSum + week.days.length, 0),
    0
  );
  const totalExercises = activeProgram.blocks.reduce(
    (sum, block) =>
      sum +
      block.weeks.reduce(
        (weekSum, week) => weekSum + week.days.reduce((daySum, day) => daySum + day.exercises.length, 0),
        0
      ),
    0
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <SectionHeading
        eyebrow="Generator"
        title="Design your next training block"
        subtitle="Answer a few coaching questions and ForgeFit turns them into months, weeks, days, and trackable sets."
      />

      <LinearGradient
        colors={["#263F36", "#101713", "#FF6B35"]}
        locations={[0, 0.58, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        <View style={styles.heroHalo} />
        <Text style={styles.heroKicker}>Coach-grade planning</Text>
        <Text style={styles.heroTitle}>Full workouts for every training day</Text>
        <Text style={styles.heroText}>
          Build a plan with primary lifts, accessories, core work, conditioning, deloads, and progression logic.
        </Text>
        <View style={styles.heroStats}>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>{input.targetMonths}</Text>
            <Text style={styles.heroStatLabel}>Months</Text>
          </View>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>{input.daysPerWeek}</Text>
            <Text style={styles.heroStatLabel}>Days / wk</Text>
          </View>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>{input.sessionLength}</Text>
            <Text style={styles.heroStatLabel}>Minutes</Text>
          </View>
        </View>
      </LinearGradient>

      <Panel>
        <Text style={styles.sectionTitle}>Primary goal</Text>
        <View style={styles.choiceWrap}>
          {goalOptions.map((goal) => (
            <PillButton
              key={goal}
              label={goal.replace("_", " ")}
              active={input.primaryGoal === goal}
              onPress={() => updateGeneratorInput("primaryGoal", goal)}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Secondary goal</Text>
        <View style={styles.choiceWrap}>
          {secondaryGoalOptions.map((goal) => (
            <PillButton
              key={goal}
              label={goal.replace("_", " ")}
              active={input.secondaryGoal === goal}
              onPress={() => updateGeneratorInput("secondaryGoal", goal)}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Training age</Text>
        <View style={styles.choiceWrap}>
          {ageOptions.map((age) => (
            <PillButton
              key={age}
              label={age}
              active={input.trainingAge === age}
              onPress={() => updateGeneratorInput("trainingAge", age)}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Training split</Text>
        <View style={styles.choiceWrap}>
          {focusOptions.map((focus) => (
            <PillButton
              key={focus}
              label={focus.replaceAll("_", " ")}
              active={input.focus === focus}
              onPress={() => updateGeneratorInput("focus", focus)}
            />
          ))}
        </View>

        <View style={styles.inlineInputs}>
          <NumericStepper
            label="Days / week"
            value={input.daysPerWeek}
            min={2}
            max={5}
            onChange={(value) => updateGeneratorInput("daysPerWeek", value)}
          />
          <NumericStepper
            label="Minutes / session"
            value={input.sessionLength}
            min={30}
            max={120}
            step={15}
            onChange={(value) => updateGeneratorInput("sessionLength", value)}
          />
        </View>

        <NumericStepper
          label="Program length (months)"
          value={input.targetMonths}
          min={2}
          max={4}
          onChange={(value) => updateGeneratorInput("targetMonths", value)}
        />

        <Text style={styles.sectionTitle}>Available equipment</Text>
        <View style={styles.choiceWrap}>
          {equipmentOptions.map((item) => (
            <PillButton
              key={item}
              label={item.replaceAll("_", " ")}
              active={input.equipment.includes(item)}
              onPress={() => toggleEquipment(item)}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Limitations / notes</Text>
        <TextInput
          value={input.limitations}
          onChangeText={(value) => updateGeneratorInput("limitations", value)}
          placeholder="Injuries, movements to avoid, competition date, recovery notes..."
          placeholderTextColor={colors.textMuted}
          multiline
          style={styles.textarea}
        />

        <Text style={styles.helperText}>
          {user ? "Generate will save the active program to your Supabase account." : "Sign in to sync programs across devices."}
        </Text>

        <Pressable
          onPress={() => void generateNewProgram(user?.id)}
          style={[styles.generateButton, isSavingProgram && styles.generateButtonDisabled]}
          disabled={isSavingProgram}
        >
          <Text style={styles.generateButtonText}>
            {isSavingProgram ? "Saving program..." : "Generate new program"}
          </Text>
        </Pressable>

        {syncError ? <Text style={styles.errorText}>{syncError}</Text> : null}
      </Panel>

      <Panel>
        <View style={styles.previewHeader}>
          <View style={styles.previewHeaderText}>
            <Text style={styles.sectionTitle}>Program preview</Text>
            <Text style={styles.previewTitle}>{activeProgram.title}</Text>
          </View>
          <Pressable
            onPress={() => setIsPreviewExpanded((current) => !current)}
            style={styles.expandButton}
          >
            <Text style={styles.expandButtonText}>{isPreviewExpanded ? "Collapse" : "Expand"}</Text>
          </Pressable>
        </View>
        <Text style={styles.previewText}>{activeProgram.summary}</Text>

        <View style={styles.previewStats}>
          <View style={styles.previewStat}>
            <Text style={styles.previewStatValue}>{totalWeeks}</Text>
            <Text style={styles.previewStatLabel}>Weeks</Text>
          </View>
          <View style={styles.previewStat}>
            <Text style={styles.previewStatValue}>{totalWorkouts}</Text>
            <Text style={styles.previewStatLabel}>Workouts</Text>
          </View>
          <View style={styles.previewStat}>
            <Text style={styles.previewStatValue}>{totalExercises}</Text>
            <Text style={styles.previewStatLabel}>Exercises</Text>
          </View>
        </View>

        {activeProgram.blocks.map((block) => (
          <View key={block.id} style={styles.blockCard}>
            <Text style={styles.blockTitle}>{block.title}</Text>
            <Text style={styles.blockObjective}>{block.objective}</Text>
            <Text style={styles.blockMeta}>{block.intensity}</Text>
            <Text style={styles.blockMeta}>
              Weeks: {block.weeks[0].weekNumber}-{block.weeks[block.weeks.length - 1].weekNumber}
            </Text>
            <Text style={styles.blockMeta}>
              First session: {block.weeks[0].days[0].exercises.length} exercises
            </Text>
            {isPreviewExpanded ? (
              <View style={styles.expandedBlockContent}>
                {block.weeks.map((week) => (
                  <View key={week.id} style={styles.weekCard}>
                    <View style={styles.weekHeader}>
                      <Text style={styles.weekTitle}>Week {week.weekNumber}</Text>
                      <Text style={[styles.weekBadge, week.isDeload && styles.weekBadgeDeload]}>
                        {week.isDeload ? "Deload" : week.focus}
                      </Text>
                    </View>
                    {week.days.map((day) => (
                      <View key={day.id} style={styles.dayPreviewCard}>
                        <View style={styles.dayPreviewHeader}>
                          <Text style={styles.dayPreviewTitle}>Day {day.dayNumber}: {day.title}</Text>
                          <Text style={styles.dayPreviewMeta}>{day.exercises.length} exercises</Text>
                        </View>

                        <View style={styles.planSection}>
                          <Text style={styles.planSectionTitle}>Warm up</Text>
                          <Text style={styles.planSectionText}>{day.warmup}</Text>
                        </View>

                        <View style={styles.exercisePreviewList}>
                          {day.exercises.map((exercise) => (
                            <View key={exercise.id} style={styles.exercisePreviewRow}>
                              <View style={styles.exercisePreviewIndex}>
                                <Text style={styles.exercisePreviewIndexText}>{exercise.sets}x</Text>
                              </View>
                              <View style={styles.exercisePreviewText}>
                                <Text style={styles.exercisePreviewName}>{exercise.name}</Text>
                                <Text style={styles.exercisePreviewMeta}>
                                  {exercise.repRange} reps | RPE {exercise.targetRpe} | {exercise.restSeconds}s rest
                                </Text>
                                <Text style={styles.exercisePreviewNote}>{exercise.notes}</Text>
                              </View>
                            </View>
                          ))}
                        </View>

                        <View style={styles.planSection}>
                          <Text style={styles.planSectionTitle}>Finisher</Text>
                          <Text style={styles.planSectionText}>{day.finisher}</Text>
                        </View>

                        <View style={styles.planSection}>
                          <Text style={styles.planSectionTitle}>Cool down</Text>
                          <Text style={styles.planSectionText}>{buildCooldownDescription(day.focus)}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        ))}
      </Panel>
    </ScrollView>
  );
}

function buildCooldownDescription(focus: string) {
  if (focus.toLowerCase().includes("conditioning")) {
    return "Walk or cycle easily for 5 minutes, then breathe slowly until your heart rate settles.";
  }

  if (focus.toLowerCase().includes("lower") || focus.toLowerCase().includes("legs")) {
    return "Spend 5 to 8 minutes on easy walking, hip flexor mobility, hamstring breathing, and relaxed quad stretches.";
  }

  if (focus.toLowerCase().includes("upper") || focus.toLowerCase().includes("push") || focus.toLowerCase().includes("pull")) {
    return "Finish with 5 minutes of nasal breathing, pec/lat mobility, and gentle shoulder range of motion.";
  }

  return "Finish with 5 to 8 minutes of easy movement, breathing drills, and gentle mobility for the muscles trained.";
}

function PillButton({
  label,
  active,
  onPress
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.pill, active && styles.pillActive]}>
      <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
    </Pressable>
  );
}

function NumericStepper({
  label,
  value,
  min,
  max,
  step = 1,
  onChange
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  return (
    <View style={styles.stepperWrap}>
      <Text style={styles.stepperLabel}>{label}</Text>
      <View style={styles.stepperRow}>
        <Pressable onPress={() => onChange(Math.max(min, value - step))} style={styles.stepperButton}>
          <Text style={styles.stepperButtonText}>-</Text>
        </Pressable>
        <Text style={styles.stepperValue}>{value}</Text>
        <Pressable onPress={() => onChange(Math.min(max, value + step))} style={styles.stepperButton}>
          <Text style={styles.stepperButtonText}>+</Text>
        </Pressable>
      </View>
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text
  },
  heroCard: {
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.borderOnDark
  },
  heroHalo: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    right: -90,
    top: -92,
    backgroundColor: "rgba(248, 198, 106, 0.16)"
  },
  heroKicker: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  heroTitle: {
    color: colors.textInverse,
    fontSize: 31,
    lineHeight: 35,
    fontWeight: "900"
  },
  heroText: {
    color: colors.mutedOnDark,
    lineHeight: 21
  },
  heroStats: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: 8
  },
  heroStat: {
    flex: 1,
    borderRadius: radii.md,
    padding: 12,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.borderOnDark
  },
  heroStatValue: {
    color: colors.textInverse,
    fontSize: 20,
    fontWeight: "900"
  },
  heroStatLabel: {
    color: colors.mutedOnDark,
    fontSize: 12,
    fontWeight: "700"
  },
  choiceWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  pill: {
    borderRadius: radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border
  },
  pillActive: {
    backgroundColor: colors.text,
    borderColor: colors.accent
  },
  pillText: {
    color: colors.textMuted,
    fontWeight: "600",
    textTransform: "capitalize"
  },
  pillTextActive: {
    color: colors.textInverse
  },
  inlineInputs: {
    gap: spacing.md
  },
  stepperWrap: {
    gap: 10
  },
  stepperLabel: {
    color: colors.textMuted,
    fontWeight: "700",
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 0.8
  },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 8,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border
  },
  stepperButton: {
    width: 42,
    height: 42,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.text
  },
  stepperButtonText: {
    fontSize: 22,
    color: colors.textInverse,
    fontWeight: "900"
  },
  stepperValue: {
    fontSize: 18,
    color: colors.text,
    fontWeight: "700"
  },
  textarea: {
    minHeight: 96,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceElevated,
    padding: 14,
    textAlignVertical: "top",
    color: colors.text
  },
  generateButton: {
    marginTop: 8,
    backgroundColor: colors.accent,
    borderRadius: radii.pill,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: colors.accent,
    shadowOpacity: 0.26,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 8
    },
    elevation: 4
  },
  generateButtonDisabled: {
    opacity: 0.7
  },
  generateButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700"
  },
  helperText: {
    color: colors.textMuted,
    lineHeight: 20
  },
  errorText: {
    color: colors.accentDeep,
    lineHeight: 20
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  previewHeaderText: {
    flex: 1,
    gap: 4
  },
  expandButton: {
    borderRadius: radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.text
  },
  expandButtonText: {
    color: colors.textInverse,
    fontWeight: "900"
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.text
  },
  previewText: {
    color: colors.textMuted,
    lineHeight: 21
  },
  previewStats: {
    flexDirection: "row",
    gap: spacing.sm
  },
  previewStat: {
    flex: 1,
    borderRadius: radii.md,
    backgroundColor: colors.backgroundStrong,
    padding: 12,
    gap: 2
  },
  previewStatValue: {
    color: colors.textInverse,
    fontSize: 20,
    fontWeight: "900"
  },
  previewStatLabel: {
    color: colors.mutedOnDark,
    fontSize: 12,
    fontWeight: "800"
  },
  blockCard: {
    borderRadius: radii.md,
    padding: 16,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6
  },
  blockTitle: {
    fontWeight: "700",
    color: colors.text
  },
  blockObjective: {
    color: colors.textMuted,
    lineHeight: 21
  },
  blockMeta: {
    color: colors.text,
    fontSize: 13
  },
  expandedBlockContent: {
    gap: spacing.sm,
    marginTop: spacing.sm
  },
  weekCard: {
    borderRadius: radii.md,
    padding: 12,
    backgroundColor: colors.surfaceMuted,
    gap: spacing.sm
  },
  weekHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  weekTitle: {
    color: colors.text,
    fontWeight: "900"
  },
  weekBadge: {
    flexShrink: 1,
    overflow: "hidden",
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceElevated,
    color: colors.textMuted,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    fontWeight: "800"
  },
  weekBadgeDeload: {
    backgroundColor: colors.accentSoft,
    color: colors.accentDeep
  },
  dayPreviewCard: {
    borderRadius: radii.md,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    gap: spacing.sm
  },
  dayPreviewHeader: {
    gap: 3
  },
  dayPreviewTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900"
  },
  dayPreviewMeta: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "700"
  },
  planSection: {
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceMuted,
    padding: 10,
    gap: 4
  },
  planSectionTitle: {
    color: colors.accentDeep,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase"
  },
  planSectionText: {
    color: colors.textMuted,
    lineHeight: 20
  },
  exercisePreviewList: {
    gap: spacing.sm
  },
  exercisePreviewRow: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "flex-start"
  },
  exercisePreviewIndex: {
    width: 42,
    height: 42,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accentSoft
  },
  exercisePreviewIndexText: {
    color: colors.accentDeep,
    fontWeight: "900"
  },
  exercisePreviewText: {
    flex: 1,
    gap: 3
  },
  exercisePreviewName: {
    color: colors.text,
    fontWeight: "900"
  },
  exercisePreviewMeta: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "700"
  },
  exercisePreviewNote: {
    color: colors.textMuted,
    lineHeight: 18,
    fontSize: 12
  }
});
