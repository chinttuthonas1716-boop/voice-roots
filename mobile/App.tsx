import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";
import { HomeScreen } from "./screens/HomeScreen";
import { RecordScreen } from "./screens/RecordScreen";
import { ArchiveScreen } from "./screens/ArchiveScreen";
import { ProfileScreen } from "./screens/ProfileScreen";

export default function App() {
  const [currentTab, setCurrentTab] = useState<"home" | "record" | "archive" | "profile">("home");

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0D0C" />

      {/* Screen Content */}
      <View style={styles.screenContainer}>
        {currentTab === "home" && <HomeScreen onNavigateRecord={() => setCurrentTab("record")} />}
        {currentTab === "record" && <RecordScreen />}
        {currentTab === "archive" && <ArchiveScreen />}
        {currentTab === "profile" && <ProfileScreen />}
      </View>

      {/* iOS 27 Liquid Glass Bottom Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setCurrentTab("home")}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabIcon, currentTab === "home" && styles.activeTab]}>🏠</Text>
          <Text style={[styles.tabLabel, currentTab === "home" && styles.activeTabLabel]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setCurrentTab("record")}
          activeOpacity={0.7}
        >
          <View style={styles.recordCircle}>
            <Text style={styles.recordIcon}>🎙️</Text>
          </View>
          <Text style={[styles.tabLabel, currentTab === "record" && styles.activeTabLabel]}>Record</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setCurrentTab("archive")}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabIcon, currentTab === "archive" && styles.activeTab]}>📚</Text>
          <Text style={[styles.tabLabel, currentTab === "archive" && styles.activeTabLabel]}>Archive</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setCurrentTab("profile")}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabIcon, currentTab === "profile" && styles.activeTab]}>👤</Text>
          <Text style={[styles.tabLabel, currentTab === "profile" && styles.activeTabLabel]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0D0C",
  },
  screenContainer: {
    flex: 1,
  },
  tabBar: {
    flexDirection: "row",
    height: 74,
    backgroundColor: "rgba(23, 27, 25, 0.9)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
    paddingBottom: 16,
    paddingTop: 8,
    alignItems: "center",
    justifyContent: "space-around",
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  tabIcon: {
    fontSize: 20,
    opacity: 0.6,
  },
  activeTab: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 11,
    color: "#A9B0AB",
    marginTop: 2,
    fontWeight: "500",
  },
  activeTabLabel: {
    color: "#A7D7B5",
    fontWeight: "600",
  },
  recordCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(111, 175, 143, 0.2)",
    borderWidth: 1,
    borderColor: "#6FAF8F",
    alignItems: "center",
    justifyContent: "center",
    marginTop: -12,
  },
  recordIcon: {
    fontSize: 22,
  },
});
