import React, { useState } from "react";
import { SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { HomeScreen } from "./screens/HomeScreen";
import { RecordScreen } from "./screens/RecordScreen";
import { ArchiveScreen } from "./screens/ArchiveScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { LoginScreen } from "./screens/LoginScreen";
import { TranslateScreen } from "./screens/TranslateScreen";

type Tab = "home" | "record" | "archive" | "language" | "profile";

export default function App() {
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [currentTab, setCurrentTab] = useState<Tab>("home");

  if (!isPreviewing) {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor="#101511" />
        <LoginScreen onLoginSuccess={() => setIsPreviewing(true)} onSkip={() => setIsPreviewing(true)} />
      </SafeAreaView>
    );
  }

  const screen = {
    home: <HomeScreen onNavigateRecord={() => setCurrentTab("record")} onNavigateTranslate={() => setCurrentTab("language")} />,
    record: <RecordScreen />,
    archive: <ArchiveScreen />,
    language: <TranslateScreen />,
    profile: <ProfileScreen user={{ name: "Guest preview" }} onLogout={() => setIsPreviewing(false)} />,
  }[currentTab];

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#101511" />
      <View style={styles.header}>
        <Text style={styles.brand}>Voice Roots</Text>
        <Text style={styles.preview}>LOCAL PREVIEW</Text>
      </View>
      <View style={styles.screen}>{screen}</View>
      <View accessibilityRole="tablist" style={styles.navigation}>
        {([
          ["home", "Home"],
          ["archive", "Archive"],
          ["record", "Record"],
          ["language", "Language"],
          ["profile", "Profile"],
        ] as const).map(([tab, label]) => {
          const active = currentTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              onPress={() => setCurrentTab(tab)}
              activeOpacity={0.75}
              style={styles.tab}
            >
              <Text style={[styles.tabText, active && styles.activeTabText]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#101511" },
  header: {
    minHeight: 50,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
  },
  brand: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  preview: { color: "#A9D9A9", fontSize: 9, fontWeight: "700", letterSpacing: 1 },
  screen: { flex: 1 },
  navigation: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "space-around",
    paddingHorizontal: 4,
    paddingBottom: 4,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
    backgroundColor: "#121914",
  },
  tab: { flex: 1, minWidth: 0, alignItems: "center", justifyContent: "center", paddingHorizontal: 2 },
  tabText: { color: "#AEB7AE", fontSize: 10, fontWeight: "500" },
  activeTabText: { color: "#A9D9A9", fontWeight: "700" },
});
