import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Panel } from "@/components/ui/panel";
import { SectionHeading } from "@/components/ui/section-heading";
import { colors, radii, spacing } from "@/theme/tokens";

const repoUrl = "https://github.com/santirt2002/forgefit";
const githubDevUrl = "https://github.dev/santirt2002/forgefit";
const codespacesUrl = "https://github.com/codespaces";
const expoDashboardUrl = "https://expo.dev/accounts/santirt2002/projects/forgefit-mobile";
const supabaseDashboardUrl = "https://supabase.com/dashboard/project/omdyukyxwetkkxggjlas";

const workflowSteps = [
  {
    title: "Edit from your phone",
    body: "Open GitHub.dev for small changes, or Codespaces when you need a terminal."
  },
  {
    title: "Run the mobile app remotely",
    body: "In a Codespace terminal, use the mobile folder and start Expo with tunnel mode."
  },
  {
    title: "Test on iPhone",
    body: "Open the ForgeFit development build and connect it to the tunnel URL."
  },
  {
    title: "Ship the change",
    body: "Commit, push, then use EAS Update or a new EAS build depending on what changed."
  }
];

const commands = [
  "cd mobile",
  "npm.cmd install",
  "npx expo start --dev-client --tunnel",
  "npx eas update --branch preview --message \"mobile edit\""
];

export function DevScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <SectionHeading
        eyebrow="Dev"
        title="Phone coding console"
        subtitle="A practical launchpad for editing, testing, and shipping ForgeFit when your computer is not available."
      />

      <LinearGradient
        colors={["#243328", "#111813", "#FF6B35"]}
        locations={[0, 0.62, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        <Text style={styles.heroKicker}>Remote workflow</Text>
        <Text style={styles.heroTitle}>Code in the cloud. Test on this phone.</Text>
        <Text style={styles.heroText}>
          For serious edits without your computer, use a browser-based cloud IDE, then load the app through the installed development build.
        </Text>
      </LinearGradient>

      <Panel>
        <Text style={styles.sectionTitle}>Open tools</Text>
        <View style={styles.actionGrid}>
          <ToolButton title="GitHub Repo" subtitle="Source code" url={repoUrl} />
          <ToolButton title="GitHub.dev" subtitle="Quick edits" url={githubDevUrl} />
          <ToolButton title="Codespaces" subtitle="Terminal IDE" url={codespacesUrl} />
          <ToolButton title="Expo" subtitle="Builds & updates" url={expoDashboardUrl} />
          <ToolButton title="Supabase" subtitle="Database" url={supabaseDashboardUrl} />
        </View>
      </Panel>

      <Panel>
        <Text style={styles.sectionTitle}>Phone workflow</Text>
        <View style={styles.stepList}>
          {workflowSteps.map((step, index) => (
            <View key={step.title} style={styles.stepRow}>
              <View style={styles.stepIndex}>
                <Text style={styles.stepIndexText}>{index + 1}</Text>
              </View>
              <View style={styles.stepTextWrap}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepBody}>{step.body}</Text>
              </View>
            </View>
          ))}
        </View>
      </Panel>

      <Panel>
        <Text style={styles.sectionTitle}>Commands for Codespaces</Text>
        <View style={styles.commandList}>
          {commands.map((command) => (
            <View key={command} style={styles.commandRow}>
              <Text style={styles.commandText}>{command}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.noteText}>
          Use EAS Update for JavaScript-only changes. Use a new EAS build after adding native dependencies, plugins, permissions, or app config changes.
        </Text>
      </Panel>
    </ScrollView>
  );
}

function ToolButton({
  title,
  subtitle,
  url
}: {
  title: string;
  subtitle: string;
  url: string;
}) {
  return (
    <Pressable
      style={styles.toolButton}
      onPress={() => {
        void Linking.openURL(url);
      }}
    >
      <Text style={styles.toolTitle}>{title}</Text>
      <Text style={styles.toolSubtitle}>{subtitle}</Text>
    </Pressable>
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
    fontSize: 31,
    lineHeight: 35,
    fontWeight: "900"
  },
  heroText: {
    color: colors.mutedOnDark,
    lineHeight: 21
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900"
  },
  actionGrid: {
    gap: spacing.sm
  },
  toolButton: {
    borderRadius: radii.md,
    padding: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4
  },
  toolTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900"
  },
  toolSubtitle: {
    color: colors.textMuted,
    fontWeight: "700"
  },
  stepList: {
    gap: spacing.md
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm
  },
  stepIndex: {
    width: 34,
    height: 34,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accentSoft
  },
  stepIndexText: {
    color: colors.accentDeep,
    fontWeight: "900"
  },
  stepTextWrap: {
    flex: 1,
    gap: 3
  },
  stepTitle: {
    color: colors.text,
    fontWeight: "900"
  },
  stepBody: {
    color: colors.textMuted,
    lineHeight: 20
  },
  commandList: {
    gap: spacing.sm
  },
  commandRow: {
    borderRadius: radii.sm,
    backgroundColor: colors.backgroundStrong,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.borderOnDark
  },
  commandText: {
    color: colors.textInverse,
    fontWeight: "800"
  },
  noteText: {
    color: colors.textMuted,
    lineHeight: 20
  }
});
