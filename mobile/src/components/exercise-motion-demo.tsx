import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import type { ExerciseDemoPattern } from "@/lib/types";
import { colors, radii, spacing } from "@/theme/tokens";

type DemoCopy = {
  label: string;
  cue: string;
  range: string;
};

const demoCopy: Record<ExerciseDemoPattern, DemoCopy> = {
  squat: {
    label: "Squat pattern",
    cue: "Sit between the hips, keep the chest proud, and drive through the midfoot.",
    range: "Hips descend"
  },
  hinge: {
    label: "Hip hinge",
    cue: "Push the hips back, keep the spine long, and load the hamstrings.",
    range: "Hips travel back"
  },
  horizontal_push: {
    label: "Pressing pattern",
    cue: "Lower under control, keep the ribs down, and press the floor or handles away.",
    range: "Chest lowers"
  },
  vertical_pull: {
    label: "Pulling pattern",
    cue: "Start long, drive the elbows down, and keep the trunk quiet.",
    range: "Body rises"
  },
  row: {
    label: "Row pattern",
    cue: "Reach long, pull toward the ribs, and pause with the shoulder blades set.",
    range: "Elbows pull back"
  },
  lunge: {
    label: "Lunge pattern",
    cue: "Step with control, keep the front knee tracking, and push through the lead foot.",
    range: "Back knee lowers"
  },
  bridge: {
    label: "Bridge pattern",
    cue: "Drive through the heels, squeeze the glutes, and avoid arching the low back.",
    range: "Hips lift"
  },
  plank: {
    label: "Anti-rotation core",
    cue: "Brace the trunk, keep the hips quiet, and move slowly.",
    range: "Hand reaches"
  },
  dead_bug: {
    label: "Dead bug control",
    cue: "Exhale, keep the low back connected, and move the opposite arm and leg.",
    range: "Limbs extend"
  },
  mountain_climber: {
    label: "Mountain climber",
    cue: "Keep shoulders stacked, drive the knees with control, and hold a strong plank.",
    range: "Knee drives"
  },
  bike: {
    label: "Bike sprint",
    cue: "Start powerful, hold posture, and recover fully between efforts.",
    range: "Cadence builds"
  },
  run: {
    label: "Tempo run",
    cue: "Stay tall, relax the shoulders, and hold a pace you can repeat.",
    range: "Stride cycles"
  },
  carry: {
    label: "Loaded carry",
    cue: "Walk tall, keep the ribs stacked, and control every step.",
    range: "Steps repeat"
  }
};

export function ExerciseMotionDemo({
  pattern,
  title
}: {
  pattern: ExerciseDemoPattern;
  title: string;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);
  const copy = demoCopy[pattern];
  const motionValues = useMotionValues(pattern, progress);

  useEffect(() => {
    loopRef.current?.stop();

    if (isPlaying) {
      loopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(progress, {
            toValue: 1,
            duration: motionValues.duration,
            useNativeDriver: true
          }),
          Animated.timing(progress, {
            toValue: 0,
            duration: motionValues.duration,
            useNativeDriver: true
          })
        ])
      );
      loopRef.current.start();
    }

    return () => loopRef.current?.stop();
  }, [isPlaying, motionValues.duration, progress]);

  function handlePlayPress() {
    if (!isPlaying) {
      progress.setValue(0);
    }

    setIsPlaying((current) => !current);
  }

  return (
    <View style={styles.card}>
      <View style={styles.stage}>
        <View style={styles.gridLineTop} />
        <View style={styles.gridLineBottom} />
        <Animated.View style={[styles.rangeBeam, { transform: motionValues.rangeTransform }]} />
        <Animated.View style={[styles.athlete, { transform: motionValues.athleteTransform }]}>
          <View style={styles.head} />
          <Animated.View style={[styles.torso, { transform: motionValues.torsoTransform }]} />
          <View style={styles.hip} />
          <Animated.View style={[styles.leftArm, { transform: motionValues.armTransform }]} />
          <Animated.View style={[styles.rightArm, { transform: motionValues.oppositeArmTransform }]} />
          <Animated.View style={[styles.leftLeg, { transform: motionValues.legTransform }]} />
          <Animated.View style={[styles.rightLeg, { transform: motionValues.oppositeLegTransform }]} />
        </Animated.View>
        <View style={styles.floorLine} />
      </View>

      <View style={styles.details}>
        <View style={styles.detailsHeader}>
          <View style={styles.detailsTitleWrap}>
            <Text style={styles.kicker}>{copy.label}</Text>
            <Text style={styles.title}>{title}</Text>
          </View>
          <View style={[styles.statusPill, isPlaying && styles.statusPillActive]}>
            <Text style={[styles.statusText, isPlaying && styles.statusTextActive]}>
              {isPlaying ? "Playing" : "Ready"}
            </Text>
          </View>
        </View>
        <Text style={styles.cue}>{copy.cue}</Text>
        <View style={styles.footerRow}>
          <Text style={styles.rangeLabel}>{copy.range}</Text>
          <Pressable onPress={handlePlayPress} style={styles.playButton}>
            <Text style={styles.playButtonText}>{isPlaying ? "Pause demo" : "Play demo"}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function useMotionValues(pattern: ExerciseDemoPattern, progress: Animated.Value) {
  return useMemo(() => {
    const dip = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 42]
    });
    const rise = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [34, -8]
    });
    const lean = progress.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", pattern === "hinge" || pattern === "row" ? "34deg" : "0deg"]
    });
    const armSwing = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [
        pattern === "run" || pattern === "carry" ? "-28deg" : "-12deg",
        pattern === "vertical_pull" || pattern === "row" ? "-78deg" : "34deg"
      ]
    });
    const oppositeArmSwing = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [
        pattern === "run" || pattern === "carry" ? "28deg" : "16deg",
        pattern === "vertical_pull" || pattern === "row" ? "78deg" : "-34deg"
      ]
    });
    const legSwing = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [
        pattern === "lunge" ? "28deg" : pattern === "bike" || pattern === "run" ? "-34deg" : "14deg",
        pattern === "lunge" ? "62deg" : pattern === "bike" || pattern === "run" ? "44deg" : "-28deg"
      ]
    });
    const oppositeLegSwing = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [
        pattern === "lunge" ? "-30deg" : pattern === "bike" || pattern === "run" ? "42deg" : "-14deg",
        pattern === "lunge" ? "-64deg" : pattern === "bike" || pattern === "run" ? "-36deg" : "28deg"
      ]
    });
    const horizontal = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, pattern === "carry" || pattern === "run" || pattern === "bike" ? 52 : pattern === "hinge" ? -18 : 0]
    });
    const scaleY = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [1, pattern === "bridge" ? 0.82 : 1]
    });
    const rangeX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [-36, 56]
    });

    const yByPattern: Record<ExerciseDemoPattern, Animated.AnimatedInterpolation<string | number> | number> = {
      squat: dip,
      hinge: 16,
      horizontal_push: dip,
      vertical_pull: rise,
      row: 12,
      lunge: dip,
      bridge: rise,
      plank: 18,
      dead_bug: 18,
      mountain_climber: 18,
      bike: 0,
      run: 0,
      carry: 0
    };

    return {
      duration: pattern === "bike" || pattern === "run" || pattern === "mountain_climber" ? 650 : 1050,
      athleteTransform: [
        { translateX: horizontal },
        { translateY: yByPattern[pattern] },
        { scaleY }
      ],
      torsoTransform: [{ rotate: lean }],
      armTransform: [{ rotate: armSwing }],
      oppositeArmTransform: [{ rotate: oppositeArmSwing }],
      legTransform: [{ rotate: legSwing }],
      oppositeLegTransform: [{ rotate: oppositeLegSwing }],
      rangeTransform: [{ translateX: rangeX }]
    };
  }, [pattern, progress]);
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    backgroundColor: colors.backgroundStrong,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.borderOnDark
  },
  stage: {
    height: 220,
    backgroundColor: colors.backgroundSoft,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center"
  },
  gridLineTop: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 62,
    height: 1,
    backgroundColor: colors.borderOnDark
  },
  gridLineBottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 58,
    height: 1,
    backgroundColor: colors.borderOnDark
  },
  rangeBeam: {
    position: "absolute",
    bottom: 40,
    width: 74,
    height: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.accent
  },
  athlete: {
    width: 126,
    height: 150,
    alignItems: "center",
    justifyContent: "center"
  },
  head: {
    position: "absolute",
    top: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.gold
  },
  torso: {
    position: "absolute",
    top: 34,
    width: 26,
    height: 58,
    borderRadius: 13,
    backgroundColor: colors.textInverse
  },
  hip: {
    position: "absolute",
    top: 88,
    width: 36,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.accent
  },
  leftArm: {
    position: "absolute",
    top: 44,
    left: 32,
    width: 11,
    height: 66,
    borderRadius: 8,
    backgroundColor: colors.mutedOnDark
  },
  rightArm: {
    position: "absolute",
    top: 44,
    right: 32,
    width: 11,
    height: 66,
    borderRadius: 8,
    backgroundColor: colors.mutedOnDark
  },
  leftLeg: {
    position: "absolute",
    top: 100,
    left: 40,
    width: 12,
    height: 76,
    borderRadius: 8,
    backgroundColor: colors.textInverse
  },
  rightLeg: {
    position: "absolute",
    top: 100,
    right: 40,
    width: 12,
    height: 76,
    borderRadius: 8,
    backgroundColor: colors.textInverse
  },
  floorLine: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    bottom: 30,
    height: 2,
    borderRadius: 2,
    backgroundColor: colors.borderOnDark
  },
  details: {
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.surface
  },
  detailsHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  detailsTitleWrap: {
    flex: 1,
    gap: 2
  },
  kicker: {
    color: colors.accentDeep,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase"
  },
  title: {
    color: colors.text,
    fontSize: 19,
    fontWeight: "900"
  },
  statusPill: {
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  statusPillActive: {
    backgroundColor: colors.success
  },
  statusText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "900"
  },
  statusTextActive: {
    color: "white"
  },
  cue: {
    color: colors.textMuted,
    lineHeight: 20
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  rangeLabel: {
    color: colors.text,
    fontWeight: "800"
  },
  playButton: {
    borderRadius: radii.pill,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.accent
  },
  playButtonText: {
    color: "white",
    fontWeight: "900"
  }
});
