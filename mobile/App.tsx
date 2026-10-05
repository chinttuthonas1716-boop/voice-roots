import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { HomeScreen } from "./screens/HomeScreen";
import { RecordScreen } from "./screens/RecordScreen";
import { ArchiveScreen } from "./screens/ArchiveScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { LoginScreen } from "./screens/LoginScreen";

export default function App() {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [currentTab, setCurrentTab] = useState<"home" | "record" | "archive" | "profile">("home");

  // Show login screen if user is not authenticated
  if (!currentUser) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#141414" />
        <LoginScreen
          onLoginSuccess={(user) => setCurrentUser(user)}
          onSkip={() => setCurrentUser({ name: "Community Guest", role: "guest" })}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#141414" />

      {/* Screen Content */}
      <View style={styles.screenContainer}>
        {currentTab === "home" && <HomeScreen onNavigateRecord={() => setCurrentTab("record")} />}
        {currentTab === "record" && <RecordScreen />}
        {currentTab === "archive" && <ArchiveScreen />}
        {currentTab === "profile" && (
          <ProfileScreen
            user={currentUser}
            onLogout={() => setCurrentUser(null)}
          />
        )}
      </View>

      {/* Netflix Cinematic Glass Bottom Bar */}
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
    backgroundColor: "#141414",
  },
  screenContainer: {
    flex: 1,
  },
  tabBar: {
    flexDirection: "row",
    height: 74,
    backgroundColor: "rgba(20, 20, 20, 0.95)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
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
    color: "#AAAAAA",
    marginTop: 2,
    fontWeight: "500",
  },
  activeTabLabel: {
    color: "#E50914",
    fontWeight: "700",
  },
  recordCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#E50914",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginTop: -14,
    shadowColor: "#E50914",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 6,
  },
  recordIcon: {
    fontSize: 22,
  },
});
