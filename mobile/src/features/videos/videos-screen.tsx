import { useMemo, useState } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ExerciseMotionDemo } from "@/components/exercise-motion-demo";
import { Panel } from "@/components/ui/panel";
import { SectionHeading } from "@/components/ui/section-heading";
import { exerciseLibrary } from "@/data/exercise-library";
import { useTrainingStore } from "@/lib/training-store";
import type { ExerciseDefinition } from "@/lib/types";
import { colors, radii, spacing } from "@/theme/tokens";

export function VideosScreen() {
  const activeProgram = useTrainingStore((state) => state.activeProgram);
  const exerciseIds = useMemo(
    () =>
      Array.from(
        new Set(
          activeProgram.blocks.flatMap((block) =>
            block.weeks.flatMap((week) =>
              week.days.flatMap((day) => day.exercises.map((exercise) => exercise.exerciseId))
            )
          )
        )
      ),
    [activeProgram]
  );

  const exercises = exerciseLibrary.filter((exercise) => exerciseIds.includes(exercise.id));
  const [selectedExerciseId, setSelectedExerciseId] = useState(exercises[0]?.id);
  const selectedExercise = exercises.find((exercise) => exercise.id === selectedExerciseId) ?? exercises[0];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <SectionHeading
        eyebrow="Videos"
        title="Master every movement"
        subtitle="Watch the exercises in your active plan, then review the cues that keep each rep clean and repeatable."
      />

      <Panel>
        <Text style={styles.sectionTitle}>Plan exercises</Text>
        <View style={styles.exerciseWrap}>
          {exercises.map((exercise) => (
            <Pressable
              key={exercise.id}
              onPress={() => setSelectedExerciseId(exercise.id)}
              style={[styles.exercisePill, exercise.id === selectedExercise?.id && styles.exercisePillActive]}
            >
              <Text
                style={[
                  styles.exercisePillText,
                  exercise.id === selectedExercise?.id && styles.exercisePillTextActive
                ]}
              >
                {exercise.name}
              </Text>
            </Pressable>
          ))}
        </View>
      </Panel>

      {selectedExercise ? (
        <>
          <Panel>
            <Text style={styles.exerciseName}>{selectedExercise.name}</Text>
            <Text style={styles.exerciseCategory}>{selectedExercise.category.toUpperCase()}</Text>
            <ExerciseDemoCard key={selectedExercise.id} exercise={selectedExercise} />
          </Panel>

          <Panel>
            <Text style={styles.sectionTitle}>Execution cues</Text>
            {selectedExercise.cues.map((cue) => (
              <Text key={cue} style={styles.listItem}>
                - {cue}
              </Text>
            ))}
          </Panel>

          <Panel>
            <Text style={styles.sectionTitle}>Common mistakes</Text>
            {selectedExercise.commonMistakes.map((mistake) => (
              <Text key={mistake} style={styles.listItem}>
                - {mistake}
              </Text>
            ))}
          </Panel>
        </>
      ) : null}
    </ScrollView>
  );
}

function ExerciseDemoCard({ exercise }: { exercise: ExerciseDefinition }) {
  const tutorialSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    `${exercise.name} exercise tutorial proper form`
  )}`;

  return (
    <View style={styles.demoCard}>
      <View style={styles.instructionCard}>
        <View style={styles.instructionHeader}>
          <View style={styles.instructionTextWrap}>
            <Text style={styles.instructionKicker}>{exercise.instructionalVideo.source}</Text>
            <Text style={styles.instructionTitle}>{exercise.instructionalVideo.title}</Text>
          </View>
          <View style={styles.videoBadge}>
            <Text style={styles.videoBadgeText}>Video</Text>
          </View>
        </View>
        <Pressable
          style={styles.watchButton}
          onPress={() => {
            void Linking.openURL(exercise.instructionalVideo.url);
          }}
        >
          <Text style={styles.watchButtonText}>Watch video guide</Text>
        </Pressable>
      </View>

      <ExerciseMotionDemo pattern={exercise.demoPattern} title={exercise.name} />
      <View style={styles.demoActions}>
        <Pressable
          style={styles.searchButton}
          onPress={() => {
            void Linking.openURL(tutorialSearchUrl);
          }}
        >
          <Text style={styles.searchButtonText}>Search more videos</Text>
        </Pressable>
        <Text style={styles.demoHint}>
          The motion demo is a quick form preview; the video guide opens the full teaching resource.
        </Text>
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
    fontSize: 18,
    fontWeight: "900",
    color: colors.text
  },
  exerciseWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  exercisePill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border
  },
  exercisePillActive: {
    backgroundColor: colors.text,
    borderColor: colors.accent
  },
  exercisePillText: {
    color: colors.textMuted,
    fontWeight: "600"
  },
  exercisePillTextActive: {
    color: colors.textInverse
  },
  exerciseName: {
    fontSize: 26,
    fontWeight: "900",
    color: colors.text
  },
  exerciseCategory: {
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: "uppercase",
    fontSize: 12,
    fontWeight: "700"
  },
  demoCard: {
    gap: spacing.sm,
    overflow: "hidden"
  },
  instructionCard: {
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.backgroundStrong,
    borderWidth: 1,
    borderColor: colors.borderOnDark
  },
  instructionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  instructionTextWrap: {
    flex: 1,
    gap: 3
  },
  instructionKicker: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  instructionTitle: {
    color: colors.textInverse,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "900"
  },
  videoBadge: {
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.borderOnDark
  },
  videoBadgeText: {
    color: colors.textInverse,
    fontSize: 12,
    fontWeight: "900"
  },
  watchButton: {
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center"
  },
  watchButtonText: {
    color: "white",
    fontWeight: "900"
  },
  demoActions: {
    gap: spacing.sm
  },
  searchButton: {
    alignSelf: "flex-start",
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  searchButtonText: {
    color: "white",
    fontWeight: "800"
  },
  demoHint: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18
  },
  listItem: {
    color: colors.textMuted,
    lineHeight: 22
  }
});
