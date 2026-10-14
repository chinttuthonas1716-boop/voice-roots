import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SpatialIcon } from "../components/SpatialIcon";

export function HomeScreen({
  onNavigateRecord,
  onNavigateTranslate,
}: {
  onNavigateRecord: () => void;
  onNavigateTranslate: () => void;
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>VOICE ROOTS</Text>
      <Text style={styles.title}>Keep the original voice at the center.</Text>
      <Text style={styles.description}>
        This mobile companion is a prototype. Recording storage, shared stories, and AI services are not connected here yet.
      </Text>

      <TouchableOpacity style={styles.card} onPress={onNavigateRecord} activeOpacity={0.8}>
        <View style={styles.icon}>
          <SpatialIcon name="mic" size={20} color="#A9D9A9" />
        </View>
        <View style={styles.cardCopy}>
          <Text style={styles.cardTitle}>Recording</Text>
          <Text style={styles.cardBody}>Open the recording screen to see what is currently available.</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={onNavigateTranslate} activeOpacity={0.8}>
        <View style={styles.icon}>
          <SpatialIcon name="globe" size={20} color="#A9D9A9" />
        </View>
        <View style={styles.cardCopy}>
          <Text style={styles.cardTitle}>Language tools</Text>
          <Text style={styles.cardBody}>Automatic translation is not connected to a verified provider.</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.notice}>
        <Text style={styles.noticeTitle}>Storage stays local</Text>
        <Text style={styles.noticeBody}>
          Stories saved in the web prototype remain in that browser and are not synced to this app.
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
    paddingTop: 26,
  },
  eyebrow: {
    color: "#A9D9A9",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.3,
    marginBottom: 10,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -0.7,
    lineHeight: 38,
    maxWidth: 360,
  },
  description: {
    color: "#B7C0B7",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
    marginBottom: 24,
  },
  card: {
    minHeight: 82,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.055)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.11)",
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(139, 207, 139, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardCopy: { flex: 1, paddingRight: 8 },
  cardTitle: { color: "#FFFFFF", fontSize: 15, fontWeight: "600" },
  cardBody: { color: "#AEB7AE", fontSize: 12, lineHeight: 17, marginTop: 4 },
  notice: {
    borderLeftWidth: 2,
    borderLeftColor: "#8BCF8B",
    paddingLeft: 12,
    marginTop: 16,
  },
  noticeTitle: { color: "#DCE9DC", fontSize: 13, fontWeight: "600" },
  noticeBody: { color: "#AEB7AE", fontSize: 12, lineHeight: 18, marginTop: 4 },
});
