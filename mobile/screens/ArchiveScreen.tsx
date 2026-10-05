import React from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from "react-native";

export function ArchiveScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.badgePill}>
        <Text style={styles.badge}>24 ORAL TRADITIONS</Text>
      </View>
      <Text style={styles.title}>Digital Language Archive</Text>
      <Text style={styles.subtitle}>
        Explore 4,821 oral recordings preserved across 4 distinct language families.
      </Text>

      {[
        { lang: "Telugu", count: "1,248 voices", words: "84.9K words", region: "AP & Telangana (Agency)", family: "Dravidian" },
        { lang: "Gondi", count: "890 voices", words: "42.1K words", region: "MP & Bastar Plateau", family: "Dravidian" },
        { lang: "Koya", count: "614 voices", words: "31.5K words", region: "Godavari River Valley", family: "Dravidian" },
        { lang: "Santali", count: "532 voices", words: "38.2K words", region: "Jharkhand & Mayurbhanj", family: "Austroasiatic" },
        { lang: "Tulu", count: "430 voices", words: "28.6K words", region: "Coastal Tulunadu", family: "Dravidian" },
        { lang: "Khasi", count: "390 voices", words: "26.4K words", region: "Meghalaya Sohra Valley", family: "Austroasiatic" },
        { lang: "Toda", count: "185 voices", words: "12.4K words", region: "Nilgiri Pastoral Clans", family: "Dravidian" },
        { lang: "Bodo", count: "310 voices", words: "21.5K words", region: "Western Bodoland", family: "Tibeto-Burman" },
        { lang: "Ladakhi", count: "215 voices", words: "16.8K words", region: "Leh & Zanskar", family: "Tibeto-Burman" },
      ].map((item, idx) => (
        <TouchableOpacity key={idx} style={styles.glassCard} activeOpacity={0.75}>
          <View style={styles.cardHeader}>
            <Text style={styles.langName}>{item.lang}</Text>
            <View style={styles.familyPill}>
              <Text style={styles.familyText}>{item.family}</Text>
            </View>
          </View>
          <Text style={styles.region}>{item.region}</Text>
          <View style={styles.stats}>
            <View style={styles.statPill}>
              <Text style={styles.statText}>{item.count}</Text>
            </View>
            <View style={[styles.statPill, styles.statPillRed]}>
              <Text style={[styles.statText, { color: "#E50914" }]}>{item.words}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
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
  badgePill: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.14)",
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
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: 13,
    color: "#AAAAAA",
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 18,
  },
  glassCard: {
    backgroundColor: "rgba(28, 28, 28, 0.72)",
    borderRadius: 22,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  langName: {
    fontSize: 19,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  familyPill: {
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  familyText: {
    color: "#AAAAAA",
    fontSize: 10,
    fontFamily: "monospace",
  },
  region: {
    fontSize: 12,
    color: "#AAAAAA",
    marginTop: 4,
  },
  stats: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  statPill: {
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  statPillRed: {
    borderColor: "rgba(229, 9, 20, 0.3)",
  },
  statText: {
    fontSize: 11,
    color: "#E5E5E5",
    fontFamily: "monospace",
    fontWeight: "600",
  },
});
