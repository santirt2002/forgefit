import { ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AppLoader } from "@/components/ui/app-loader";
import { Panel } from "@/components/ui/panel";
import { ProgressBar } from "@/components/ui/progress-bar";
import { SectionHeading } from "@/components/ui/section-heading";
import { useTrainingStore } from "@/lib/training-store";
import { useAuth } from "@/providers/auth-provider";
import { colors, radii, spacing } from "@/theme/tokens";

export function HomeScreen() {
  const { user } = useAuth();
  const activeProgram = useTrainingStore((state) => state.activeProgram);
  const setLogs = useTrainingStore((state) => state.setLogs);
  const isHydrating = useTrainingStore((state) => state.isHydrating);
  const syncError = useTrainingStore((state) => state.syncError);

  if (user && isHydrating) {
    return <AppLoader label="Syncing your latest training program..." />;
  }

  const currentBlock = activeProgram.blocks[0];
  const currentWeek = currentBlock.weeks[0];
  const nextSession = currentWeek.days[0];
  const uniqueSessions = new Set(setLogs.map((log) => `${log.dayId}-${log.sessionNumber}`)).size;
  const averageRpe =
    setLogs.length > 0 ? (setLogs.reduce((sum, log) => sum + log.rpe, 0) / setLogs.length).toFixed(1) : "0.0";
  const totalVolume = setLogs.reduce((sum, log) => sum + log.reps * log.weight, 0);

  const volumeBars = currentBlock.weeks.map((week) => {
    const weekIds = new Set(week.days.map((day) => day.id));
    const volume = setLogs
      .filter((log) => weekIds.has(log.dayId))
      .reduce((sum, log) => sum + log.reps * log.weight, 0);
    return { label: `W${week.weekNumber}`, value: volume };
  });

  const maxVolume = Math.max(...volumeBars.map((item) => item.value), 1);
  const totalPlannedSessions = activeProgram.input.targetMonths * 4 * activeProgram.input.daysPerWeek;
  const completionPercent = Math.min(100, (uniqueSessions / Math.max(totalPlannedSessions, 1)) * 100);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <SectionHeading
        eyebrow="Home"
        title={`Welcome back${user?.email ? `, ${user.email.split("@")[0]}` : ""}`}
        subtitle="See your current training phase, today's direction, and how your logged work is trending."
      />

      <LinearGradient
        colors={["#243328", "#121A14", "#FF6B35"]}
        locations={[0, 0.62, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        <View style={styles.heroOrbit} />
        <Text style={styles.heroKicker}>Training command center</Text>
        <Text style={styles.heroTitle}>{activeProgram.title}</Text>
        <Text style={styles.heroText}>{activeProgram.summary}</Text>
        <View style={styles.heroMeta}>
          <View style={styles.heroChip}>
            <Text style={styles.heroChipText}>{currentBlock.title}</Text>
          </View>
          <View style={styles.heroChip}>
            <Text style={styles.heroChipText}>Week {currentWeek.weekNumber}</Text>
          </View>
        </View>
        <View style={styles.heroProgressCard}>
          <View style={styles.heroProgressHeader}>
            <Text style={styles.heroProgressLabel}>Program completion</Text>
            <Text style={styles.heroProgressValue}>{Math.round(completionPercent)}%</Text>
          </View>
          <ProgressBar value={completionPercent} color={colors.gold} />
        </View>
      </LinearGradient>

      {syncError ? (
        <Panel>
          <Text style={styles.errorText}>{syncError}</Text>
        </Panel>
      ) : null}

      <View style={styles.statGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{uniqueSessions}</Text>
          <Text style={styles.statLabel}>Logged sessions</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{averageRpe}</Text>
          <Text style={styles.statLabel}>Average RPE</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{Math.round(totalVolume).toLocaleString()}</Text>
          <Text style={styles.statLabel}>Total volume</Text>
        </View>
      </View>

      <Panel>
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>Today's best next move</Text>
          <Text style={styles.panelBadge}>Day {nextSession.dayNumber}</Text>
        </View>
        <Text style={styles.paragraph}>{nextSession.title}</Text>
        <Text style={styles.metaLine}>{nextSession.exercises.length} exercises planned</Text>
      </Panel>

      <Panel>
        <Text style={styles.panelTitle}>Current block objective</Text>
        <Text style={styles.paragraph}>{currentBlock.objective}</Text>
        <Text style={styles.metaLine}>Intensity strategy: {currentBlock.intensity}</Text>
      </Panel>

      <Panel>
        <Text style={styles.panelTitle}>This week</Text>
        <Text style={styles.paragraph}>{currentWeek.focus}</Text>
        {currentWeek.days.map((day) => (
          <View key={day.id} style={styles.dayRow}>
            <View style={styles.dayIndex}>
              <Text style={styles.dayIndexText}>{day.dayNumber}</Text>
            </View>
            <View style={styles.dayTextWrap}>
              <Text style={styles.dayTitle}>{day.title}</Text>
              <Text style={styles.daySubtitle}>{day.exercises.length} planned exercises</Text>
            </View>
          </View>
        ))}
      </Panel>

      <Panel>
        <Text style={styles.panelTitle}>Weekly load trend</Text>
        <View style={styles.chartWrap}>
          {volumeBars.map((bar, index) => (
            <View key={bar.label} style={styles.chartRow}>
              <Text style={styles.chartLabel}>{bar.label}</Text>
              <View style={styles.chartBarWrap}>
                <ProgressBar
                  value={(bar.value / maxVolume) * 100}
                  color={index % 2 === 0 ? colors.chart1 : colors.chart2}
                />
              </View>
              <Text style={styles.chartValue}>{Math.round(bar.value)}</Text>
            </View>
          ))}
        </View>
      </Panel>
    </ScrollView>
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
  heroCard: {
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.borderOnDark
  },
  heroOrbit: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    right: -70,
    top: -72,
    backgroundColor: "rgba(255, 247, 234, 0.12)"
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
    fontSize: 32,
    lineHeight: 36,
    fontWeight: "900"
  },
  heroText: {
    color: colors.mutedOnDark,
    lineHeight: 21
  },
  heroMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: 6
  },
  heroChip: {
    backgroundColor: colors.glass,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.borderOnDark
  },
  heroChipText: {
    color: colors.textInverse,
    fontWeight: "800"
  },
  heroProgressCard: {
    marginTop: spacing.sm,
    borderRadius: radii.md,
    padding: 14,
    backgroundColor: "rgba(13, 18, 15, 0.54)",
    borderWidth: 1,
    borderColor: colors.borderOnDark,
    gap: spacing.sm
  },
  heroProgressHeader: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  heroProgressLabel: {
    color: colors.mutedOnDark,
    fontWeight: "700"
  },
  heroProgressValue: {
    color: colors.textInverse,
    fontWeight: "900"
  },
  statGrid: {
    flexDirection: "row",
    gap: spacing.sm
  },
  statCard: {
    flex: 1,
    minHeight: 104,
    borderRadius: radii.lg,
    padding: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "space-between",
    shadowColor: colors.shadow,
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 8
    },
    elevation: 3
  },
  statValue: {
    fontSize: 26,
    fontWeight: "900",
    color: colors.text
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700"
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  panelBadge: {
    overflow: "hidden",
    borderRadius: radii.pill,
    backgroundColor: colors.accentSoft,
    color: colors.accentDeep,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontWeight: "900"
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.text
  },
  paragraph: {
    color: colors.textMuted,
    lineHeight: 22
  },
  metaLine: {
    color: colors.text,
    fontWeight: "600"
  },
  dayRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  dayIndex: {
    width: 32,
    height: 32,
    borderRadius: radii.pill,
    backgroundColor: colors.backgroundStrong,
    alignItems: "center",
    justifyContent: "center"
  },
  dayIndexText: {
    fontWeight: "700",
    color: colors.text
  },
  dayTextWrap: {
    gap: 2
  },
  dayTitle: {
    color: colors.text,
    fontWeight: "600"
  },
  daySubtitle: {
    color: colors.textMuted,
    fontSize: 13
  },
  chartWrap: {
    gap: spacing.sm
  },
  chartRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  chartLabel: {
    width: 32,
    color: colors.textMuted,
    fontWeight: "600"
  },
  chartBarWrap: {
    flex: 1
  },
  chartValue: {
    width: 64,
    textAlign: "right",
    color: colors.text,
    fontWeight: "600"
  },
  errorText: {
    color: colors.accentDeep,
    lineHeight: 21
  }
});
