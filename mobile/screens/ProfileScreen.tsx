import React from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from "react-native";

export function ProfileScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.badge}>CONTRIBUTOR PROFILE</Text>
      <Text style={styles.title}>Sai (Linguistics Contributor)</Text>
      <Text style={styles.region}>Field Location: Northern Telangana Agency Area</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Your Impact</Text>
        <Text style={styles.metric}>24 Stories Recorded • 8.4 Hours Archived</Text>
        <Text style={styles.desc}>
          All 24 recordings include formal informed consent and are accessible to linguistic researchers studying tribal phonetic shifts.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Ethical Consent & Data Sovereignty</Text>
        <Text style={styles.desc}>
          You retain the right to modify visibility or revoke recordings at any time in accordance with Voice Roots community guidelines.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0D0C" },
  content: { padding: 20 },
  badge: { color: "#A7D7B5", fontSize: 11, fontWeight: "700", letterSpacing: 1, marginBottom: 4 },
  title: { fontSize: 24, fontWeight: "700", color: "#F5F6F3" },
  region: { fontSize: 12, color: "#A9B0AB", marginTop: 4, marginBottom: 20 },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  cardTitle: { fontSize: 16, fontWeight: "600", color: "#F5F6F3", marginBottom: 6 },
  metric: { fontSize: 13, color: "#6FAF8F", fontWeight: "600", marginBottom: 6 },
  desc: { fontSize: 12, color: "#A9B0AB", lineHeight: 18 },
});
