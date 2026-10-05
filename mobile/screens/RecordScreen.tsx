import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from "react-native";

export function RecordScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);

  const toggleRecord = () => {
    setIsRecording(!isRecording);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topInfo}>
        <Text style={styles.badge}>ETHICAL RECORDING STUDIO</Text>
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
          <Text style={{ fontSize: 28 }}>{isRecording ? "⏹" : "🎙️"}</Text>
        </TouchableOpacity>
        <Text style={styles.btnInstruction}>
          {isRecording ? "Tap to Stop & Transcribe with AI" : "Tap to Begin Recording"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0D0C", padding: 24, justifyContent: "space-between" },
  topInfo: { marginTop: 10 },
  badge: { color: "#A7D7B5", fontSize: 10, fontWeight: "700", letterSpacing: 1, marginBottom: 4 },
  title: { fontSize: 24, fontWeight: "700", color: "#F5F6F3" },
  sub: { fontSize: 12, color: "#A9B0AB", marginTop: 4 },
  visualizerBox: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 28,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  timer: { fontSize: 36, fontWeight: "700", color: "#F5F6F3", fontFamily: "monospace" },
  waveformContainer: {
    flexDirection: "row",
    height: 70,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginVertical: 24,
    width: "100%",
  },
  waveBar: {
    width: 6,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 3,
  },
  activeWave: {
    backgroundColor: "#6FAF8F",
  },
  statusLabel: { color: "#A7D7B5", fontSize: 11, fontWeight: "600", letterSpacing: 1 },
  controlBox: { alignItems: "center", marginBottom: 20 },
  bigRecordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#6FAF8F",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#6FAF8F",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  recordingActiveBtn: {
    backgroundColor: "#EF4444",
  },
  btnInstruction: { color: "#A9B0AB", fontSize: 12, marginTop: 12 },
});
