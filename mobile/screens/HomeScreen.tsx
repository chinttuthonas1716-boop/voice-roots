import React from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from "react-native";
import { SpatialIcon } from "../components/SpatialIcon";

export function HomeScreen({
  onNavigateRecord,
  onNavigateTranslate,
}: {
  onNavigateRecord: () => void;
  onNavigateTranslate: () => void;
}) {
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

      {/* Day-to-Day Conversational Translation Quick Action Card */}
      <TouchableOpacity
        style={styles.translateHeroGlass}
        onPress={onNavigateTranslate}
        activeOpacity={0.85}
      >
        <View style={styles.specularShine} />
        <View style={styles.translateCardTop}>
          <View style={styles.translateIconOrb}>
            <SpatialIcon name="globe" size={24} color="#E50914" />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={styles.dailyBadgeRow}>
              <Text style={styles.dailyBadge}>DAY-TO-DAY TRANSLATION</Text>
            </View>
            <Text style={styles.translateCardTitle}>దైనందిన సంభాషణల అనువాదం</Text>
            <Text style={styles.translateCardSub}>
              రోజువారీ మాటలు: పలకరింపులు, నీళ్ళు, భోజనం, ధరలు, దారి & సాయం
            </Text>
          </View>
        </View>
        <View style={styles.translateCardFooter}>
          <Text style={styles.translateActionText}>ట్రాన్స్‌లేటర్ తెరవండి (Open Translator) →</Text>
        </View>
      </TouchableOpacity>

      {/* Hero Liquid Glass Record Action */}
      <TouchableOpacity
        style={styles.recordHeroGlass}
        onPress={onNavigateRecord}
        activeOpacity={0.85}
      >
        <View style={styles.specularShine} />
        <View style={styles.micOrb}>
          <SpatialIcon name="mic" size={32} color="#FFFFFF" />
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

      {/* iOS 27 Spatial Feature Capabilities */}
      <View style={styles.featuresSection}>
        <View style={styles.sectionHeader}>
          <View style={styles.redPillIndicator} />
          <Text style={styles.sectionTitle}>Spatial AI Preservation Capabilities</Text>
        </View>

        <View style={styles.featureGrid}>
          <View style={styles.featureCard}>
            <SpatialIcon name="waveform" glassVessel glow vesselSize={44} size={20} color="#E50914" />
            <Text style={styles.featureName}>Neural Audio</Text>
            <Text style={styles.featureDesc}>Lossless 48kHz acoustic phonetics</Text>
          </View>
          <View style={styles.featureCard}>
            <SpatialIcon name="globe" glassVessel vesselSize={44} size={20} color="#E5A93C" />
            <Text style={styles.featureName}>24 Dialects</Text>
            <Text style={styles.featureDesc}>Unwritten oral tradition mapping</Text>
          </View>
          <View style={styles.featureCard}>
            <SpatialIcon name="shield" glassVessel vesselSize={44} size={20} color="#FFFFFF" />
            <Text style={styles.featureName}>Sovereignty</Text>
            <Text style={styles.featureDesc}>Clan-owned licensing & permissions</Text>
          </View>
          <View style={styles.featureCard}>
            <SpatialIcon name="sparkles" glassVessel vesselSize={44} size={20} color="#E50914" />
            <Text style={styles.featureName}>IndicTrans2</Text>
            <Text style={styles.featureDesc}>Tribal-to-Standard language translation</Text>
          </View>
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
              <SpatialIcon name="play" size={13} color="#FFFFFF" />
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
  featuresSection: {
    marginBottom: 20,
  },
  featureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  featureCard: {
    width: "48%",
    backgroundColor: "rgba(28, 28, 28, 0.72)",
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  featureName: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 10,
  },
  featureDesc: {
    color: "#8E8E93",
    fontSize: 10,
    marginTop: 3,
    lineHeight: 14,
  },
  translateHeroGlass: {
    backgroundColor: "rgba(229, 9, 20, 0.08)",
    borderWidth: 1.5,
    borderColor: "rgba(229, 9, 20, 0.35)",
    borderRadius: 22,
    padding: 16,
    marginBottom: 16,
    overflow: "hidden",
  },
  translateCardTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  translateIconOrb: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(229, 9, 20, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  dailyBadgeRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  dailyBadge: {
    backgroundColor: "rgba(229, 9, 20, 0.2)",
    color: "#E50914",
    fontSize: 9,
    fontWeight: "800",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    letterSpacing: 0.5,
  },
  translateCardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  translateCardSub: {
    fontSize: 11,
    color: "#8E8E93",
    lineHeight: 16,
  },
  translateCardFooter: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
  },
  translateActionText: {
    color: "#E5A93C",
    fontSize: 12,
    fontWeight: "700",
  },
});
