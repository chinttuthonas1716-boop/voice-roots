import React from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from "react-native";

export function HomeScreen({ onNavigateRecord }: { onNavigateRecord: () => void }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.badgePill}>
          <Text style={styles.badge}>VOICE ROOTS ARCHIVE</Text>
        </View>
        <Text style={styles.title}>Preserve a voice today.</Text>
        <Text style={styles.subtitle}>
          Capture oral stories, tribal dialects, and elder memory.
        </Text>
      </View>

      {/* Hero Record Button (Netflix Red) */}
      <TouchableOpacity
        style={styles.recordHero}
        onPress={onNavigateRecord}
        activeOpacity={0.85}
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
          <Text style={[styles.statNum, { color: "#E50914" }]}>24</Text>
          <Text style={styles.statLabel}>Languages</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNum, { color: "#FFFFFF" }]}>4.8K</Text>
          <Text style={styles.statLabel}>Stories</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNum, { color: "#E5A93C" }]}>1.2M</Text>
          <Text style={styles.statLabel}>Words</Text>
        </View>
      </View>

      {/* Recent Preserved Recordings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Featured Oral Stories</Text>

        {[
          { title: "Traditional Harvest & Rain Song", lang: "Telugu (Agency)", dur: "08:42" },
          { title: "The Mountain Spring Legend", lang: "Gondi (Bastar)", dur: "14:15" },
          { title: "Wild Turmeric Medicinal Knowledge", lang: "Koya (Godavari)", dur: "06:30" },
          { title: "Living Root Bridges Oral Engineering", lang: "Khasi (Meghalaya)", dur: "13:10" },
        ].map((item, idx) => (
          <View key={idx} style={styles.recentCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.recentTitle}>{item.title}</Text>
              <Text style={styles.recentMeta}>{item.lang} • {item.dur}</Text>
            </View>
            <View style={styles.playBadge}>
              <Text style={{ fontSize: 13, color: "#FFFFFF" }}>▶</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#141414",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 30,
  },
  header: {
    marginBottom: 20,
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
    fontSize: 26,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: "#AAAAAA",
    marginTop: 4,
    lineHeight: 18,
  },
  recordHero: {
    backgroundColor: "#1C1C1C",
    borderRadius: 24,
    padding: 22,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    marginBottom: 20,
    shadowColor: "#E50914",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
  },
  micCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#E50914",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: "#E50914",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
  },
  recordHeroText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  recordHeroSub: {
    color: "#AAAAAA",
    fontSize: 11,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#1C1C1C",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  statNum: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  statLabel: {
    fontSize: 10,
    color: "#AAAAAA",
    marginTop: 2,
    textTransform: "uppercase",
  },
  section: {
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  recentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1C1C1C",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  recentTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  recentMeta: {
    color: "#AAAAAA",
    fontSize: 11,
    marginTop: 3,
  },
  playBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E50914",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
});
