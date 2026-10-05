import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";

export function RecordScreen() {
  const [isRecording, setIsRecording] = useState(false);

  const toggleRecord = () => {
    setIsRecording(!isRecording);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topInfo}>
        <View style={styles.badgePill}>
          <Text style={styles.badge}>ETHICAL RECORDING STUDIO</Text>
        </View>
        <Text style={styles.title}>Live Oral Voice Capture</Text>
        <Text style={styles.sub}>Speaker consent verified. Original audio is permanently protected.</Text>
      </View>

      {/* Large Audio Visualizer Center */}
      <View style={styles.visualizerBox}>
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

        <Text style={styles.statusLabel}>
          {isRecording ? "● RECORDING LIVE AUDIO" : "READY TO RECORD"}
        </Text>
      </View>

      {/* Action Button */}
      <View style={styles.controlBox}>
        <TouchableOpacity
          onPress={toggleRecord}
          style={[styles.bigRecordButton, isRecording && styles.recordingActiveBtn]}
          activeOpacity={0.8}
        >
          <Text style={{ fontSize: 28, color: "#FFFFFF" }}>{isRecording ? "⏹" : "🎙️"}</Text>
        </TouchableOpacity>
        <Text style={styles.btnInstruction}>
          {isRecording ? "Tap to Stop & Transcribe with AI" : "Tap to Begin Recording"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#141414",
    padding: 20,
    justifyContent: "space-between",
  },
  topInfo: {
    marginTop: 10,
  },
  badgePill: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(229, 9, 20, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(229, 9, 20, 0.4)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
    marginBottom: 8,
  },
  badge: {
    color: "#E50914",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
  title: {
    fontSize: 24,
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
  visualizerBox: {
    backgroundColor: "#1C1C1C",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    marginVertical: 20,
  },
  timer: {
    fontSize: 34,
    fontWeight: "800",
    fontFamily: "monospace",
    color: "#FFFFFF",
    marginBottom: 20,
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
  statusLabel: {
    fontSize: 11,
    color: "#E50914",
    fontWeight: "700",
    fontFamily: "monospace",
    marginTop: 20,
    letterSpacing: 1,
  },
  controlBox: {
    alignItems: "center",
    marginBottom: 20,
  },
  bigRecordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E50914",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#E50914",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 8,
  },
  recordingActiveBtn: {
    backgroundColor: "#B81D24",
    transform: [{ scale: 1.05 }],
  },
  btnInstruction: {
    color: "#AAAAAA",
    fontSize: 12,
    marginTop: 12,
  },
});
