import React from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from "react-native";

export function HomeScreen({ onNavigateRecord }: { onNavigateRecord: () => void }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.badge}>🌱 VOICE ROOTS</Text>
        <Text style={styles.title}>Preserve a voice today.</Text>
        <Text style={styles.subtitle}>
          Capture oral stories, tribal dialects, and elder knowledge.
        </Text>
      </View>

      {/* Hero Record Button */}
      <TouchableOpacity
        style={styles.recordHero}
        onPress={onNavigateRecord}
        activeOpacity={0.8}
      >
        <View style={styles.micCircle}>
          <Text style={{ fontSize: 32 }}>🎙️</Text>
        </View>
        <Text style={styles.recordHeroText}>Tap to Record Voice</Text>
        <Text style={styles.recordHeroSub}>Auto Language Detection & AI Transcription</Text>
      </TouchableOpacity>

      {/* Stats Counter */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>18</Text>
          <Text style={styles.statLabel}>Languages</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNum, { color: "#A7D7B5" }]}>4.8K</Text>
          <Text style={styles.statLabel}>Stories</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNum, { color: "#B89A72" }]}>1.2M</Text>
          <Text style={styles.statLabel}>Words</Text>
        </View>
      </View>

      {/* Recent Preserved Recordings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Preserved Voices</Text>

        {[
          { title: "Traditional Harvest & Rain Song", lang: "Telugu (Agency)", dur: "08:42" },
          { title: "The Mountain Spring Legend", lang: "Gondi (Bastar)", dur: "14:15" },
          { title: "Wild Turmeric Medicinal Knowledge", lang: "Koya", dur: "06:30" },
        ].map((item, idx) => (
          <View key={idx} style={styles.recentCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.recentTitle}>{item.title}</Text>
              <Text style={styles.recentMeta}>{item.lang} • {item.dur}</Text>
            </View>
            <Text style={{ fontSize: 18 }}>▶</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0D0C" },
  content: { padding: 20, paddingBottom: 40 },
  header: { marginTop: 10, marginBottom: 20 },
  badge: {
    color: "#A7D7B5",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 6,
  },
  title: { fontSize: 28, fontWeight: "700", color: "#F5F6F3" },
  subtitle: { fontSize: 13, color: "#A9B0AB", marginTop: 4 },
  recordHero: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(111, 175, 143, 0.35)",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
  },
  micCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "rgba(111, 175, 143, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  recordHeroText: { color: "#F5F6F3", fontSize: 18, fontWeight: "600" },
  recordHeroSub: { color: "#A9B0AB", fontSize: 12, marginTop: 4 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  statBox: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  statNum: { fontSize: 20, fontWeight: "700", color: "#F5F6F3" },
  statLabel: { fontSize: 11, color: "#A9B0AB", marginTop: 2 },
  section: { marginTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: "#F5F6F3", marginBottom: 12 },
  recentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  recentTitle: { color: "#F5F6F3", fontSize: 14, fontWeight: "500" },
  recentMeta: { color: "#A9B0AB", fontSize: 11, marginTop: 3 },
});
