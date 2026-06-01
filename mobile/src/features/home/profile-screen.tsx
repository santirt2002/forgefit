import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Panel } from "@/components/ui/panel";
import { SectionHeading } from "@/components/ui/section-heading";
import { useTrainingStore } from "@/lib/training-store";
import { useAuth } from "@/providers/auth-provider";
import { colors, radii, spacing } from "@/theme/tokens";

export function ProfileScreen() {
  const { user, signOut } = useAuth();
  const syncedUserId = useTrainingStore((state) => state.syncedUserId);
  const syncError = useTrainingStore((state) => state.syncError);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <SectionHeading
        eyebrow="Profile"
        title="Your athlete hub"
        subtitle="Manage sync, account access, and the product milestones that turn ForgeFit into a complete training platform."
      />

      <LinearGradient
        colors={["#27392B", "#111813", "#FF6B35"]}
        locations={[0, 0.64, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.profileHero}
      >
        <Text style={styles.heroKicker}>Account</Text>
        <Text style={styles.heroTitle}>{user?.email?.split("@")[0] ?? "Athlete"}</Text>
        <Text style={styles.heroText}>
          Keep your program, workout logs, and progress history connected across devices.
        </Text>
      </LinearGradient>

      <Panel>
        <Text style={styles.label}>Signed in as</Text>
        <Text style={styles.value}>{user?.email ?? "No active user"}</Text>
        <Text style={styles.status}>
          {user && syncedUserId === user.id && !syncError
            ? "Supabase sync is active for this account."
            : "The app is currently using local data or still needs a sync refresh."}
        </Text>
      </Panel>

      <Panel>
        <Text style={styles.label}>Next product milestones</Text>
        {[
          "Persist generated programs to Supabase tables",
          "Sync tracker logs across devices",
          "Add real progress graphs from session and body-metric history",
          "Replace placeholder exercise clips with real video library assets"
        ].map((item) => (
          <View key={item} style={styles.milestoneRow}>
            <View style={styles.milestoneDot} />
            <Text style={styles.bullet}>{item}</Text>
          </View>
        ))}
      </Panel>

      {syncError ? (
        <Panel>
          <Text style={styles.label}>Sync issue</Text>
          <Text style={styles.errorText}>{syncError}</Text>
        </Panel>
      ) : null}

      <Pressable style={styles.signOutButton} onPress={() => void signOut()}>
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>
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
  profileHero: {
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderOnDark
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
  label: {
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: colors.textMuted,
    fontWeight: "700"
  },
  value: {
    fontSize: 18,
    color: colors.text,
    fontWeight: "700"
  },
  status: {
    color: colors.textMuted,
    lineHeight: 21
  },
  bullet: {
    flex: 1,
    color: colors.textMuted,
    lineHeight: 22
  },
  milestoneRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm
  },
  milestoneDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
    marginTop: 7
  },
  errorText: {
    color: colors.accentDeep,
    lineHeight: 21
  },
  signOutButton: {
    borderRadius: radii.pill,
    paddingVertical: 16,
    alignItems: "center",
    backgroundColor: colors.accent
  },
  signOutText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16
  }
});
