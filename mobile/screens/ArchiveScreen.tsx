import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SpatialIcon } from "../components/SpatialIcon";

export function ArchiveScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.badgePill}>
        <SpatialIcon name="archive" size={13} color="#8BCF8B" />
        <Text style={styles.badge}>VOICE ROOTS</Text>
      </View>
      <Text style={styles.title}>Your archive</Text>
      <Text style={styles.subtitle}>
        This mobile app is not connected to a shared archive yet. Stories saved in the web prototype stay in the browser where they were recorded.
      </Text>
      <View style={styles.glassCard}>
        <SpatialIcon name="globe" size={22} color="#8BCF8B" />
        <Text style={styles.cardTitle}>No shared stories yet</Text>
        <Text style={styles.cardBody}>
          Connect a storage service to make stories available across devices. Until then, use the same browser and device where a recording was created.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#101511",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  badgePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 99,
    marginBottom: 14,
  },
  badge: {
    color: "#A9D9A9",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
  title: {
    fontSize: 29,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: "#B7C0B7",
    marginTop: 8,
    marginBottom: 20,
    lineHeight: 21,
  },
  glassCard: {
    backgroundColor: "rgba(255, 255, 255, 0.055)",
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.11)",
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#FFFFFF",
    marginTop: 14,
  },
  cardBody: {
    fontSize: 13,
    color: "#B7C0B7",
    marginTop: 7,
    lineHeight: 20,
  },
});
