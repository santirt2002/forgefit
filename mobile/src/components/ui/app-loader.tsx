import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme/tokens";

export function AppLoader({ label = "Loading ForgeFit..." }: { label?: string }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.accent} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    gap: 12,
    padding: 24
  },
  label: {
    color: colors.mutedOnDark,
    fontSize: 15
  }
});
