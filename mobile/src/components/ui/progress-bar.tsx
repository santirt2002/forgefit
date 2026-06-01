import { StyleSheet, View } from "react-native";
import { colors, radii } from "@/theme/tokens";

export function ProgressBar({
  value,
  color = colors.chart1
}: {
  value: number;
  color?: string;
}) {
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${Math.max(0, Math.min(100, value))}%`, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 10,
    borderRadius: radii.pill,
    backgroundColor: colors.backgroundStrong,
    overflow: "hidden"
  },
  fill: {
    height: "100%",
    borderRadius: radii.pill
  }
});
