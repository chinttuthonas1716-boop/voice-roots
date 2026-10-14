import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ProfileScreenProps {
  user?: { name?: string };
  onLogout?: () => void;
}

export function ProfileScreen({ user, onLogout }: ProfileScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>LOCAL PREVIEW</Text>
      <Text style={styles.title}>{user?.name || "Guest preview"}</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>No account is connected</Text>
        <Text style={styles.copy}>
          This profile only identifies the current in-app preview. There is no sign-in, cloud storage, or account data sharing.
        </Text>
      </View>
      {onLogout && (
        <TouchableOpacity style={styles.button} onPress={onLogout} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Exit preview</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#101511", padding: 24, paddingTop: 30 },
  eyebrow: { color: "#A9D9A9", fontSize: 11, fontWeight: "700", letterSpacing: 1.1 },
  title: { color: "#FFFFFF", fontSize: 28, fontWeight: "700", marginTop: 7 },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.055)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.11)",
    borderRadius: 20,
    padding: 17,
    marginTop: 22,
  },
  cardTitle: { color: "#FFFFFF", fontSize: 15, fontWeight: "600" },
  copy: { color: "#B7C0B7", fontSize: 13, lineHeight: 20, marginTop: 6 },
  button: {
    minHeight: 46,
    borderRadius: 15,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
  },
  buttonText: { color: "#E1E8E1", fontSize: 13, fontWeight: "600" },
});
