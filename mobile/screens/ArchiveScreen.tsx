import React from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";

export function ArchiveScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.badgePill}>
        <Text style={styles.badge}>VOICE ROOTS ARCHIVE</Text>
      </View>
      <Text style={styles.title}>24 Oral Language Traditions</Text>

      {[
        { lang: "Telugu", count: "1,248 voices", words: "84.9K words", region: "AP & Telangana (Agency)" },
        { lang: "Gondi", count: "890 voices", words: "42.1K words", region: "MP & Bastar Plateau" },
        { lang: "Koya", count: "614 voices", words: "31.5K words", region: "Godavari River Valley" },
        { lang: "Santali", count: "532 voices", words: "38.2K words", region: "Jharkhand & Mayurbhanj" },
        { lang: "Tulu", count: "430 voices", words: "28.6K words", region: "Coastal Tulunadu" },
        { lang: "Khasi", count: "390 voices", words: "26.4K words", region: "Meghalaya Sohra Valley" },
        { lang: "Toda", count: "185 voices", words: "12.4K words", region: "Nilgiri Pastoral Clans" },
      ].map((item, idx) => (
        <View key={idx} style={styles.card}>
          <Text style={styles.langName}>{item.lang}</Text>
          <Text style={styles.region}>{item.region}</Text>
          <View style={styles.stats}>
            <Text style={styles.statPill}>{item.count}</Text>
            <Text style={[styles.statPill, { color: "#E50914" }]}>{item.words}</Text>
          </View>
        </View>
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
    padding: 20,
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
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  card: {
    backgroundColor: "#1C1C1C",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  langName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  region: {
    fontSize: 12,
    color: "#AAAAAA",
    marginTop: 2,
  },
  stats: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  statPill: {
    fontSize: 11,
    color: "#E5E5E5",
    fontFamily: "monospace",
  },
});
