import React from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from "react-native";

export function HomeScreen({ onNavigateRecord }: { onNavigateRecord: () => void }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.pillBadge}>
          <Text style={styles.badgeText}>COMMUNITY ARCHIVE</Text>
        </View>
        <Text style={styles.title}>Preserve a voice today.</Text>
        <Text style={styles.subtitle}>
          Capture oral stories, tribal dialects, and elder memory before they fade.
        </Text>
      </View>

      {/* Hero Liquid Glass Record Action */}
      <TouchableOpacity
        style={styles.recordHeroGlass}
        onPress={onNavigateRecord}
        activeOpacity={0.85}
      >
        <View style={styles.specularShine} />
        <View style={styles.micOrb}>
          <Text style={{ fontSize: 32 }}>🎙️</Text>
        </View>
        <Text style={styles.recordHeroText}>Tap to Record Voice</Text>
        <Text style={styles.recordHeroSub}>Instant Language Detection & AI Transcription</Text>
      </TouchableOpacity>

      {/* Spatial Stats Counter Capsules */}
      <View style={styles.statsRow}>
        <View style={styles.statCapsule}>
          <Text style={[styles.statNum, { color: "#E50914" }]}>24</Text>
          <Text style={styles.statLabel}>Languages</Text>
        </View>
        <View style={styles.statCapsule}>
          <Text style={styles.statNum}>4.8K</Text>
          <Text style={styles.statLabel}>Stories</Text>
        </View>
        <View style={styles.statCapsule}>
          <Text style={[styles.statNum, { color: "#E5A93C" }]}>1.2M</Text>
          <Text style={styles.statLabel}>Words</Text>
        </View>
      </View>

      {/* Featured Preserved Voices */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.redPillIndicator} />
          <Text style={styles.sectionTitle}>Featured Oral Narratives</Text>
        </View>

        {[
          { title: "Traditional Harvest & Rain Song", lang: "Telugu (Agency)", dur: "08:42" },
          { title: "The Mountain Spring Legend", lang: "Gondi (Bastar)", dur: "14:15" },
          { title: "Wild Turmeric Medicinal Knowledge", lang: "Koya (Godavari)", dur: "06:30" },
          { title: "Living Root Bridges Oral Engineering", lang: "Khasi (Meghalaya)", dur: "13:10" },
        ].map((item, idx) => (
          <TouchableOpacity key={idx} style={styles.storyGlassCard} activeOpacity={0.75}>
            <View style={{ flex: 1 }}>
              <Text style={styles.storyTitle}>{item.title}</Text>
              <Text style={styles.storyMeta}>{item.lang} • {item.dur}</Text>
            </View>
            <View style={styles.playGlassBtn}>
              <Text style={{ fontSize: 13, color: "#FFFFFF" }}>▶</Text>
            </View>
          </TouchableOpacity>
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
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 110, // clearance for floating glass tab bar
  },
  header: {
    marginBottom: 18,
  },
  pillBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.14)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 99,
    marginBottom: 10,
  },
  badgeText: {
    color: "#E50914",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    fontFamily: "monospace",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: 13,
    color: "#AAAAAA",
    marginTop: 5,
    lineHeight: 18,
  },
  recordHeroGlass: {
    backgroundColor: "rgba(35, 35, 35, 0.72)",
    borderRadius: 28,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.8,
    shadowRadius: 24,
    elevation: 8,
    overflow: "hidden",
  },
  specularShine: {
    position: "absolute",
    top: 0,
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.35)",
  },
  micOrb: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#E50914",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: "#E50914",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.65,
    shadowRadius: 16,
    elevation: 10,
  },
  recordHeroText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: -0.3,
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
  statCapsule: {
    flex: 1,
    backgroundColor: "rgba(30, 30, 30, 0.65)",
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  statNum: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    fontFamily: "monospace",
  },
  statLabel: {
    fontSize: 10,
    color: "#AAAAAA",
    marginTop: 2,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  section: {
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  redPillIndicator: {
    width: 4,
    height: 16,
    borderRadius: 2,
    backgroundColor: "#E50914",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  storyGlassCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(28, 28, 28, 0.75)",
    borderRadius: 20,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  storyTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  storyMeta: {
    color: "#AAAAAA",
    fontSize: 11,
    marginTop: 4,
  },
  playGlassBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E50914",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
    shadowColor: "#E50914",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
});
