import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Platform,
} from "react-native";
import { HomeScreen } from "./screens/HomeScreen";
import { RecordScreen } from "./screens/RecordScreen";
import { ArchiveScreen } from "./screens/ArchiveScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { LoginScreen } from "./screens/LoginScreen";
import { TranslateScreen } from "./screens/TranslateScreen";
import { SpatialIcon } from "./components/SpatialIcon";

export default function App() {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [currentTab, setCurrentTab] = useState<
    "home" | "record" | "archive" | "translate" | "profile"
  >("home");

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

      {/* Dynamic Island Status Capsule */}
      <View style={styles.dynamicIslandWrapper}>
        <View style={styles.dynamicIsland}>
          <View style={styles.islandPulseDot} />
          <Text style={styles.islandText}>ARCHIVE LIVE</Text>
          <Text style={styles.islandSeparator}>•</Text>
          <Text style={styles.islandSubtext}>24 LANGUAGES</Text>
        </View>
      </View>

      {/* Screen Content */}
      <View style={styles.screenContainer}>
        {currentTab === "home" && (
          <HomeScreen
            onNavigateRecord={() => setCurrentTab("record")}
            onNavigateTranslate={() => setCurrentTab("translate")}
          />
        )}
        {currentTab === "record" && <RecordScreen />}
        {currentTab === "archive" && <ArchiveScreen />}
        {currentTab === "translate" && <TranslateScreen />}
        {currentTab === "profile" && (
          <ProfileScreen
            user={currentUser}
            onLogout={() => setCurrentUser(null)}
          />
        )}
      </View>

      {/* Floating Apple Fitness Style Bottom Bar */}
      <View style={styles.floatingBarContainer}>
        <View style={styles.glassFloatingBar}>
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setCurrentTab("home")}
            activeOpacity={0.7}
          >
            <View style={[styles.tabIconWrapper, currentTab === "home" && { backgroundColor: "rgba(250, 17, 79, 0.2)" }]}>
              <SpatialIcon
                name="home"
                size={17}
                color={currentTab === "home" ? "#FA114F" : "#8E8E93"}
              />
            </View>
            <Text style={[styles.tabLabel, currentTab === "home" && { color: "#FA114F", fontWeight: "800" }]}>Summary</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setCurrentTab("archive")}
            activeOpacity={0.7}
          >
            <View style={[styles.tabIconWrapper, currentTab === "archive" && { backgroundColor: "rgba(161, 254, 5, 0.2)" }]}>
              <SpatialIcon
                name="archive"
                size={17}
                color={currentTab === "archive" ? "#A1FE05" : "#8E8E93"}
              />
            </View>
            <Text style={[styles.tabLabel, currentTab === "archive" && { color: "#A1FE05", fontWeight: "800" }]}>Fitness+ Lore</Text>
          </TouchableOpacity>

          {/* Central Elevated Spatial Mic Button */}
          <TouchableOpacity
            style={styles.centerTabItem}
            onPress={() => setCurrentTab("record")}
            activeOpacity={0.85}
          >
            <View style={[styles.recordOrbOuter, { borderColor: "rgba(250, 17, 79, 0.4)" }]}>
              <View style={[styles.recordOrbInner, { backgroundColor: "#FA114F" }]}>
                <SpatialIcon name="mic" size={20} color="#FFFFFF" />
              </View>
            </View>
            <Text style={[styles.tabLabel, currentTab === "record" && { color: "#FA114F", fontWeight: "800" }]}>Record</Text>
          </TouchableOpacity>

          {/* Day-to-Day Translate Tab */}
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setCurrentTab("translate")}
            activeOpacity={0.7}
          >
            <View style={[styles.tabIconWrapper, currentTab === "translate" && { backgroundColor: "rgba(0, 216, 246, 0.2)" }]}>
              <SpatialIcon
                name="globe"
                size={17}
                color={currentTab === "translate" ? "#00D8F6" : "#8E8E93"}
              />
            </View>
            <Text style={[styles.tabLabel, currentTab === "translate" && { color: "#00D8F6", fontWeight: "800" }]}>Translate</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setCurrentTab("profile")}
            activeOpacity={0.7}
          >
            <View style={[styles.tabIconWrapper, currentTab === "profile" && styles.activeTabWrapper]}>
              <SpatialIcon
                name="profile"
                size={17}
                color={currentTab === "profile" ? "#E50914" : "#8E8E93"}
              />
            </View>
            <Text style={[styles.tabLabel, currentTab === "profile" && styles.activeTabLabel]}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#141414",
  },
  dynamicIslandWrapper: {
    alignItems: "center",
    paddingTop: Platform.OS === "android" ? 12 : 4,
    paddingBottom: 4,
    zIndex: 50,
  },
  dynamicIsland: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000000",
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 6,
  },
  islandPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#E50914",
    marginRight: 6,
  },
  islandText: {
    color: "#E50914",
    fontSize: 10,
    fontWeight: "800",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    letterSpacing: 0.5,
  },
  islandSeparator: {
    color: "#666666",
    fontSize: 10,
    marginHorizontal: 5,
  },
  islandSubtext: {
    color: "#E5E5E5",
    fontSize: 10,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    letterSpacing: 0.5,
  },
  screenContainer: {
    flex: 1,
  },
  floatingBarContainer: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 18 : 14,
    left: 14,
    right: 14,
    alignItems: "center",
  },
  glassFloatingBar: {
    flexDirection: "row",
    width: "100%",
    height: 68,
    backgroundColor: "rgba(26, 26, 26, 0.88)",
    borderRadius: 34,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.16)",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 10,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.9,
    shadowRadius: 28,
    elevation: 16,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  tabIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  activeTabWrapper: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  tabIcon: {
    fontSize: 17,
  },
  tabLabel: {
    fontSize: 10,
    color: "#8E8E93",
    marginTop: 2,
    fontWeight: "600",
  },
  activeTabLabel: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  centerTabItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginTop: -20,
  },
  recordOrbOuter: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(229, 9, 20, 0.25)",
    borderWidth: 1.5,
    borderColor: "rgba(229, 9, 20, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#E50914",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.7,
    shadowRadius: 14,
    elevation: 10,
  },
  recordOrbInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E50914",
    alignItems: "center",
    justifyContent: "center",
  },
  recordIcon: {
    fontSize: 20,
  },
});
