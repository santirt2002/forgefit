import { Tabs } from "expo-router";
import { StyleSheet, View } from "react-native";
import { colors, radii } from "@/theme/tokens";

type TabIconName = "home" | "plan" | "log" | "learn" | "dev" | "me";

function TabIcon({ name, focused }: { name: TabIconName; focused: boolean }) {
  const iconColor = focused ? colors.textInverse : colors.mutedOnDark;

  return (
    <View style={[styles.iconBadge, focused && styles.iconBadgeActive]}>
      {name === "home" ? (
        <View style={styles.homeIcon}>
          <View style={[styles.homeRoof, { borderBottomColor: iconColor }]} />
          <View style={[styles.homeBase, { borderColor: iconColor }]} />
        </View>
      ) : null}

      {name === "plan" ? (
        <View style={styles.stackIcon}>
          <View style={[styles.stackLine, { backgroundColor: iconColor, width: 17 }]} />
          <View style={[styles.stackLine, { backgroundColor: iconColor, width: 12 }]} />
          <View style={[styles.stackLine, { backgroundColor: iconColor, width: 15 }]} />
        </View>
      ) : null}

      {name === "log" ? (
        <View style={styles.logIcon}>
          <View style={[styles.logDot, { backgroundColor: iconColor }]} />
          <View style={[styles.logBar, { backgroundColor: iconColor }]} />
          <View style={[styles.logDot, { backgroundColor: iconColor }]} />
          <View style={[styles.logBar, { backgroundColor: iconColor }]} />
        </View>
      ) : null}

      {name === "learn" ? (
        <View style={[styles.playIcon, { borderLeftColor: iconColor }]} />
      ) : null}

      {name === "dev" ? (
        <View style={styles.devIcon}>
          <View style={[styles.devDot, { backgroundColor: iconColor }]} />
          <View style={[styles.devBracketLeft, { borderColor: iconColor }]} />
          <View style={[styles.devBracketRight, { borderColor: iconColor }]} />
        </View>
      ) : null}

      {name === "me" ? (
        <View style={styles.userIcon}>
          <View style={[styles.userHead, { borderColor: iconColor }]} />
          <View style={[styles.userBody, { borderColor: iconColor }]} />
        </View>
      ) : null}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.textInverse,
        tabBarInactiveTintColor: colors.mutedOnDark,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "800"
        },
        tabBarStyle: {
          height: 82,
          paddingTop: 9,
          paddingBottom: 10,
          backgroundColor: colors.surfaceDark,
          borderTopWidth: 1,
          borderTopColor: colors.borderOnDark
        }
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />
        }}
      />
      <Tabs.Screen
        name="generator"
        options={{
          title: "Plan",
          tabBarIcon: ({ focused }) => <TabIcon name="plan" focused={focused} />
        }}
      />
      <Tabs.Screen
        name="tracker"
        options={{
          title: "Log",
          tabBarIcon: ({ focused }) => <TabIcon name="log" focused={focused} />
        }}
      />
      <Tabs.Screen
        name="videos"
        options={{
          title: "Learn",
          tabBarIcon: ({ focused }) => <TabIcon name="learn" focused={focused} />
        }}
      />
      <Tabs.Screen
        name="dev"
        options={{
          title: "Dev",
          tabBarIcon: ({ focused }) => <TabIcon name="dev" focused={focused} />
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Me",
          tabBarIcon: ({ focused }) => <TabIcon name="me" focused={focused} />
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconBadge: {
    width: 34,
    height: 30,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 247, 234, 0.08)",
    borderWidth: 1,
    borderColor: colors.borderOnDark
  },
  iconBadgeActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent
  },
  homeIcon: {
    alignItems: "center",
    justifyContent: "center",
    gap: 2
  },
  homeRoof: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 7,
    borderLeftColor: "transparent",
    borderRightColor: "transparent"
  },
  homeBase: {
    width: 14,
    height: 10,
    borderWidth: 2,
    borderTopWidth: 0,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4
  },
  stackIcon: {
    gap: 3,
    alignItems: "center"
  },
  stackLine: {
    height: 3,
    borderRadius: 3
  },
  logIcon: {
    width: 18,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    rowGap: 5,
    columnGap: 4
  },
  logDot: {
    width: 4,
    height: 4,
    borderRadius: 2
  },
  logBar: {
    width: 10,
    height: 3,
    borderRadius: 3
  },
  playIcon: {
    width: 0,
    height: 0,
    borderTopWidth: 7,
    borderBottomWidth: 7,
    borderLeftWidth: 12,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    marginLeft: 3
  },
  devIcon: {
    width: 20,
    height: 18,
    alignItems: "center",
    justifyContent: "center"
  },
  devDot: {
    width: 5,
    height: 5,
    borderRadius: 3
  },
  devBracketLeft: {
    position: "absolute",
    left: 1,
    width: 6,
    height: 14,
    borderLeftWidth: 2,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderRightWidth: 0,
    borderTopLeftRadius: 3,
    borderBottomLeftRadius: 3
  },
  devBracketRight: {
    position: "absolute",
    right: 1,
    width: 6,
    height: 14,
    borderRightWidth: 2,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderLeftWidth: 0,
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3
  },
  userIcon: {
    alignItems: "center",
    gap: 3
  },
  userHead: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2
  },
  userBody: {
    width: 16,
    height: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderWidth: 2,
    borderBottomWidth: 0
  }
});
