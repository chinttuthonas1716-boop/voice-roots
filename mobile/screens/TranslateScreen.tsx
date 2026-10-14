import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SpatialIcon } from "../components/SpatialIcon";

export function TranslateScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.icon}>
        <SpatialIcon name="globe" size={24} color="#A9D9A9" />
      </View>
      <Text style={styles.title}>Language tools</Text>
      <Text style={styles.copy}>
        This mobile prototype does not have a verified translation provider. It will not generate or label sample text as a real translation.
      </Text>
      <Text style={styles.note}>
        The web app lets you enter and review a translation manually for a saved story.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#101511",
    padding: 24,
    justifyContent: "center",
  },
  icon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: "rgba(139, 207, 139, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  title: { color: "#FFFFFF", fontSize: 28, fontWeight: "700" },
  copy: { color: "#B7C0B7", fontSize: 14, lineHeight: 21, marginTop: 9 },
  note: { color: "#A9D9A9", fontSize: 12, lineHeight: 18, marginTop: 18 },
});
