import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme/tokens";

export function SectionHeading({
  eyebrow,
  title,
  subtitle
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.wrapper}>
      {eyebrow ? (
        <View style={styles.eyebrowPill}>
          <Text style={styles.eyebrow}>{eyebrow}</Text>
        </View>
      ) : null}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 8
  },
  eyebrowPill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.borderOnDark
  },
  eyebrow: {
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: colors.gold,
    fontWeight: "800"
  },
  title: {
    fontSize: 30,
    lineHeight: 34,
    color: colors.textInverse,
    fontWeight: "900"
  },
  subtitle: {
    fontSize: 15,
    color: colors.mutedOnDark,
    lineHeight: 22
  }
});
