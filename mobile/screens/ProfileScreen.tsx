import React from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from "react-native";

interface ProfileScreenProps {
  user?: any;
  onLogout?: () => void;
}

export function ProfileScreen({ user, onLogout }: ProfileScreenProps) {
  const userName = user?.name || "Elder Speaker";
  const userRole = user?.role || "contributor";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.badgePill}>
        <Text style={styles.badge}>VERIFIED CITIZEN ARCHIVIST</Text>
      </View>

      <Text style={styles.title}>{userName}</Text>
      <Text style={styles.roleTag}>
        {userRole.toUpperCase()} • VOICE ROOTS ARCHIVE
      </Text>

      {/* Impact Liquid Glass Card */}
      <View style={styles.glassCard}>
        <View style={styles.specularShine} />
        <Text style={styles.cardTitle}>Your Preserved Contributions</Text>
        <Text style={styles.metric}>24 Stories Recorded • 8.4 Hours Archived</Text>
        <Text style={styles.desc}>
          All 24 recordings include formal informed consent and are accessible to linguistic researchers studying indigenous phonetic shifts.
        </Text>
      </View>

      {/* Sovereignty Card */}
      <View style={styles.glassCard}>
        <Text style={styles.cardTitle}>Ethical Data Sovereignty</Text>
        <Text style={styles.desc}>
          You retain full ownership of your oral contributions. You can revoke, unlist, or modify access permissions to your audio files at any time.
        </Text>
      </View>

      {/* Logout Button */}
      {onLogout && (
        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout} activeOpacity={0.8}>
          <Text style={styles.logoutText}>Sign Out of Archive</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#141414",
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 110, // clearance for floating glass tab bar
  },
  badgePill: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.14)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 99,
    marginBottom: 8,
  },
  badge: {
    color: "#E50914",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    fontFamily: "monospace",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.6,
  },
  roleTag: {
    fontSize: 11,
    color: "#E5A93C",
    fontFamily: "monospace",
    marginTop: 4,
    marginBottom: 20,
    letterSpacing: 1,
  },
  glassCard: {
    backgroundColor: "rgba(28, 28, 28, 0.72)",
    borderRadius: 22,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    position: "relative",
    overflow: "hidden",
  },
  specularShine: {
    position: "absolute",
    top: 0,
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  metric: {
    fontSize: 13,
    color: "#E50914",
    fontWeight: "700",
    marginBottom: 6,
  },
  desc: {
    fontSize: 12,
    color: "#AAAAAA",
    lineHeight: 18,
  },
  logoutBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    paddingVertical: 14,
    borderRadius: 99,
    alignItems: "center",
    marginTop: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  logoutText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
});
