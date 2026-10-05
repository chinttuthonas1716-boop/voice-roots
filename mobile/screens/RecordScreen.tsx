import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";

export function RecordScreen() {
  const [isRecording, setIsRecording] = useState(false);

  const toggleRecord = () => {
    setIsRecording(!isRecording);
  };

  return (
    <View style={styles.container}>
      {/* Header Info */}
      <View style={styles.topInfo}>
        <View style={styles.pillBadge}>
          <Text style={styles.badge}>CONSENT VERIFIED</Text>
        </View>
        <Text style={styles.title}>Live Oral Voice Capture</Text>
        <Text style={styles.sub}>
          Lossless 48kHz acoustic capture. Original human voice is permanently protected.
        </Text>
      </View>

      {/* Spatial Visualizer Liquid Glass Center */}
      <View style={styles.visualizerGlassBox}>
        <View style={styles.specularShine} />

        <Text style={styles.timer}>
          {isRecording ? "00:02:41" : "00:00:00"}
        </Text>

        <View style={styles.waveformContainer}>
          {[30, 60, 90, 45, 80, 100, 60, 40, 75, 95, 50, 85, 30, 65, 45].map((h, i) => (
            <View
              key={i}
              style={[
                styles.waveBar,
                { height: isRecording ? `${h}%` : "15%" },
                isRecording && styles.activeWave,
              ]}
            />
          ))}
        </View>

        <View style={styles.statusPill}>
          <View style={[styles.statusDot, isRecording && styles.statusDotRecording]} />
          <Text style={styles.statusLabel}>
            {isRecording ? "RECORDING LIVE AUDIO" : "READY TO RECORD"}
          </Text>
        </View>
      </View>

      {/* Action Button */}
      <View style={styles.controlBox}>
        <TouchableOpacity
          onPress={toggleRecord}
          style={[styles.bigRecordButton, isRecording && styles.recordingActiveBtn]}
          activeOpacity={0.85}
        >
          <Text style={{ fontSize: 30, color: "#FFFFFF" }}>{isRecording ? "⏹" : "🎙️"}</Text>
        </TouchableOpacity>
        <Text style={styles.btnInstruction}>
          {isRecording ? "Tap to Finish & Save Recording" : "Tap to Begin Recording"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#141414",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 110, // clearance for floating glass tab bar
    justifyContent: "space-between",
  },
  topInfo: {
    marginTop: 8,
  },
  pillBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
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
    fontSize: 26,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  sub: {
    fontSize: 12,
    color: "#AAAAAA",
    marginTop: 4,
    lineHeight: 16,
  },
  visualizerGlassBox: {
    backgroundColor: "rgba(32, 32, 32, 0.72)",
    borderRadius: 28,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.14)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.85,
    shadowRadius: 24,
    position: "relative",
    overflow: "hidden",
  },
  specularShine: {
    position: "absolute",
    top: 0,
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  timer: {
    fontSize: 36,
    fontWeight: "800",
    fontFamily: "monospace",
    color: "#FFFFFF",
    marginBottom: 24,
  },
  waveformContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    height: 70,
    width: "100%",
  },
  waveBar: {
    width: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  activeWave: {
    backgroundColor: "#E50914",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 99,
    marginTop: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#AAAAAA",
    marginRight: 6,
  },
  statusDotRecording: {
    backgroundColor: "#E50914",
  },
  statusLabel: {
    fontSize: 10,
    color: "#FFFFFF",
    fontWeight: "700",
    fontFamily: "monospace",
    letterSpacing: 0.8,
  },
  controlBox: {
    alignItems: "center",
    marginBottom: 10,
  },
  bigRecordButton: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#E50914",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#E50914",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.65,
    shadowRadius: 20,
    elevation: 10,
  },
  recordingActiveBtn: {
    backgroundColor: "#B81D24",
    transform: [{ scale: 1.05 }],
  },
  btnInstruction: {
    color: "#AAAAAA",
    fontSize: 12,
    marginTop: 12,
    fontWeight: "500",
  },
});
