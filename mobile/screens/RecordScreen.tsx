import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SpatialIcon } from "../components/SpatialIcon";

export function RecordScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.icon}>
        <SpatialIcon name="mic" size={24} color="#A9D9A9" />
      </View>
      <Text style={styles.title}>Record a story</Text>
      <Text style={styles.copy}>
        Native recording and preservation are not connected in this mobile prototype. The web prototype supports browser microphone capture and keeps the audio in that browser.
      </Text>
      <Text style={styles.note}>
        AI transcription and translation are unavailable until verified providers are configured.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#101511",
    padding: 24,
    justifyContent: "center",
  },
  icon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: "rgba(139, 207, 139, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  title: { color: "#FFFFFF", fontSize: 28, fontWeight: "700" },
  copy: { color: "#B7C0B7", fontSize: 14, lineHeight: 21, marginTop: 9 },
  note: { color: "#A9D9A9", fontSize: 12, lineHeight: 18, marginTop: 18 },
});
