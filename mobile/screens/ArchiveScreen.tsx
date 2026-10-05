import React from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";

export function ArchiveScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.badge}>VOICE ROOTS ARCHIVE</Text>
      <Text style={styles.title}>Browse Preserved Languages</Text>

      {[
        { lang: "Telugu", count: "1,248 voices", words: "84.9K words", region: "AP & Telangana" },
        { lang: "Gondi", count: "890 voices", words: "42.1K words", region: "MP & Bastar" },
        { lang: "Koya", count: "614 voices", words: "31.5K words", region: "Godavari Valley" },
        { lang: "Santali", count: "532 voices", words: "38.2K words", region: "Jharkhand & Odisha" },
      ].map((item, idx) => (
        <View key={idx} style={styles.card}>
          <Text style={styles.langName}>{item.lang}</Text>
          <Text style={styles.region}>{item.region}</Text>
          <View style={styles.stats}>
            <Text style={styles.statPill}>{item.count}</Text>
            <Text style={[styles.statPill, { color: "#A7D7B5" }]}>{item.words}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0D0C" },
  content: { padding: 20 },
  badge: { color: "#A7D7B5", fontSize: 11, fontWeight: "700", letterSpacing: 1, marginBottom: 4 },
  title: { fontSize: 24, fontWeight: "700", color: "#F5F6F3", marginBottom: 16 },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  langName: { fontSize: 18, fontWeight: "600", color: "#F5F6F3" },
  region: { fontSize: 12, color: "#A9B0AB", marginTop: 2 },
  stats: { flexDirection: "row", gap: 8, marginTop: 10 },
  statPill: { fontSize: 11, color: "#F5F6F3", fontFamily: "monospace" },
});
