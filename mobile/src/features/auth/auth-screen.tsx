import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@/providers/auth-provider";
import { colors, radii, spacing } from "@/theme/tokens";

export function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const normalizedEmail = email.trim().toLowerCase();

      if (!normalizedEmail) {
        throw new Error("Enter your email address.");
      }

      if (password.length < 6) {
        throw new Error("Use a password with at least 6 characters.");
      }

      if (mode === "signup") {
        await signUp(normalizedEmail, password);
        setMessage("Account created. If email confirmation is enabled, check your inbox.");
      } else {
        await signIn(normalizedEmail, password);
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardShell}
      >
        <View style={styles.container}>
          <View pointerEvents="none" style={styles.glowOne} />
          <View pointerEvents="none" style={styles.glowTwo} />

          <LinearGradient
            colors={["#26362A", "#111813", "#FF6B35"]}
            locations={[0, 0.62, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <Text style={styles.heroEyebrow}>ForgeFit Mobile</Text>
            <Text style={styles.heroTitle}>A smarter training plan in your pocket.</Text>
            <Text style={styles.heroText}>
              Generate periodized programs, track real sets, learn each movement, and watch your progress compound.
            </Text>
          </LinearGradient>

          <View style={styles.formCard}>
            <View style={styles.toggleRow}>
              <Pressable
                onPress={() => setMode("signin")}
                style={[styles.toggle, mode === "signin" && styles.toggleActive]}
              >
                <Text style={[styles.toggleText, mode === "signin" && styles.toggleTextActive]}>Sign in</Text>
              </Pressable>
              <Pressable
                onPress={() => setMode("signup")}
                style={[styles.toggle, mode === "signup" && styles.toggleActive]}
              >
                <Text style={[styles.toggleText, mode === "signup" && styles.toggleTextActive]}>
                  Create account
                </Text>
              </Pressable>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                placeholder="name@example.com"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                placeholder="At least 6 characters"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
              />
            </View>

            <Pressable onPress={handleSubmit} style={styles.cta} disabled={loading}>
              <Text style={styles.ctaText}>
                {loading ? "Working..." : mode === "signup" ? "Create account" : "Sign in"}
              </Text>
            </Pressable>

            {message ? <Text style={styles.message}>{message}</Text> : null}
            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Text style={styles.helper}>
              During early Expo development, email confirmation is easiest if it is temporarily disabled until
              deep-link callbacks are added.
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  keyboardShell: {
    flex: 1
  },
  container: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: "center",
    gap: spacing.lg,
    overflow: "hidden"
  },
  glowOne: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    right: -110,
    top: 40,
    backgroundColor: "rgba(255, 107, 53, 0.18)"
  },
  glowTwo: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    left: -110,
    bottom: 64,
    backgroundColor: "rgba(248, 198, 106, 0.12)"
  },
  heroCard: {
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderOnDark,
    overflow: "hidden"
  },
  heroEyebrow: {
    color: colors.gold,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    fontSize: 12,
    fontWeight: "900"
  },
  heroTitle: {
    color: colors.textInverse,
    fontSize: 34,
    lineHeight: 38,
    fontWeight: "900"
  },
  heroText: {
    color: colors.mutedOnDark,
    fontSize: 15,
    lineHeight: 23
  },
  formCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.md
  },
  toggleRow: {
    flexDirection: "row",
    gap: spacing.sm
  },
  toggle: {
    flex: 1,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: colors.surfaceElevated
  },
  toggleActive: {
    backgroundColor: colors.text,
    borderColor: colors.accent
  },
  toggleText: {
    color: colors.textMuted,
    fontWeight: "600"
  },
  toggleTextActive: {
    color: colors.textInverse
  },
  fieldGroup: {
    gap: 8
  },
  label: {
    color: colors.textMuted,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    fontSize: 12
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.surfaceElevated,
    color: colors.text,
    fontSize: 16
  },
  cta: {
    borderRadius: radii.pill,
    paddingVertical: 16,
    alignItems: "center",
    backgroundColor: colors.accent,
    shadowColor: colors.accent,
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 8
    },
    elevation: 4
  },
  ctaText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16
  },
  message: {
    color: colors.success,
    lineHeight: 22
  },
  error: {
    color: "#9B2C2C",
    lineHeight: 22
  },
  helper: {
    color: colors.textMuted,
    lineHeight: 21,
    fontSize: 13
  }
});
