import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface LoginScreenProps {
  onLoginSuccess: (user: { name: string; role: "guest" }) => void;
  onSkip?: () => void;
}

export function LoginScreen({ onLoginSuccess, onSkip }: LoginScreenProps) {
  const continueToPreview = () => {
    if (onSkip) onSkip();
    else onLoginSuccess({ name: "Guest preview", role: "guest" });
  };

  return (
    <View style={styles.container}>
      <View style={styles.mark}>
        <Text style={styles.markText}>VR</Text>
      </View>
      <Text style={styles.brand}>Voice Roots</Text>
      <Text style={styles.tagline}>Rooting oral languages in text with AI</Text>
      <View style={styles.notice}>
        <Text style={styles.noticeTitle}>Accounts are not connected</Text>
        <Text style={styles.noticeCopy}>
          Continue to a local preview. This will not create an account or sync data.
        </Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={continueToPreview} activeOpacity={0.8}>
        <Text style={styles.buttonText}>Continue to preview</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#101511",
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  mark: {
    width: 54,
    height: 54,
    borderRadius: 19,
    backgroundColor: "rgba(139, 207, 139, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(169, 217, 169, 0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  markText: { color: "#DCE9DC", fontSize: 16, fontWeight: "700" },
  brand: { color: "#FFFFFF", fontSize: 30, fontWeight: "700", letterSpacing: -0.6 },
  tagline: { color: "#AEB7AE", fontSize: 14, marginTop: 5 },
  notice: {
    backgroundColor: "rgba(255, 255, 255, 0.055)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.11)",
    borderRadius: 20,
    padding: 16,
    marginTop: 30,
  },
  noticeTitle: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },
  noticeCopy: { color: "#B7C0B7", fontSize: 13, lineHeight: 19, marginTop: 5 },
  button: {
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: "#457D54",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
  },
  buttonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },
});
