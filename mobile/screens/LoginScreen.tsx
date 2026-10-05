import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SpatialIcon } from "../components/SpatialIcon";

interface LoginScreenProps {
  onLoginSuccess: (user: any) => void;
  onSkip?: () => void;
}

export function LoginScreen({ onLoginSuccess, onSkip }: LoginScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [authType, setAuthType] = useState<"phone" | "email">("phone");
  const [inputVal, setInputVal] = useState("+91 98765 43210");
  const [password, setPassword] = useState("••••••••••••");
  const [name, setName] = useState("Ramesh Kumar (Gond Clan)");
  const [selectedRole, setSelectedRole] = useState<"contributor" | "researcher" | "moderator">("contributor");

  const handleLogin = () => {
    onLoginSuccess({
      name: isSignUp ? name : "Community Speaker",
      identifier: inputVal,
      role: selectedRole,
    });
  };

  const handleQuickDemo = (role: "contributor" | "researcher" | "moderator", label: string) => {
    setSelectedRole(role);
    setName(label);
    setInputVal(`${role}@voiceroots.org`);
    onLoginSuccess({
      name: label,
      identifier: `${role}@voiceroots.org`,
      role,
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Brand Icon & Heading */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>N</Text>
          </View>
          <Text style={styles.brandTitle}>Voice Roots</Text>
          <Text style={styles.brandTagline}>Rooting Oral Languages in Text with AI</Text>
        </View>

        {/* Card Surface (Liquid Glass with Netflix Dark) */}
        <View style={styles.glassCard}>
          {/* Mode Switcher */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.modeTab, !isSignUp && styles.modeTabActive]}
              onPress={() => setIsSignUp(false)}
            >
              <Text style={[styles.modeTabText, !isSignUp && styles.modeTabTextActive]}>
                Sign In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeTab, isSignUp && styles.modeTabActive]}
              onPress={() => setIsSignUp(true)}
            >
              <Text style={[styles.modeTabText, isSignUp && styles.modeTabTextActive]}>
                Create Account
              </Text>
            </TouchableOpacity>
          </View>

          {/* Quick Demo Logins */}
          <View style={styles.demoSection}>
            <Text style={styles.demoLabel}>1-TAP DEMO ACCESS:</Text>
            <View style={styles.demoRow}>
              <TouchableOpacity
                style={styles.demoPill}
                onPress={() => handleQuickDemo("contributor", "Elder Speaker")}
              >
                <SpatialIcon name="profile" size={13} color="#FFFFFF" />
                <Text style={styles.demoPillText}>Elder</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.demoPill}
                onPress={() => handleQuickDemo("researcher", "Linguist")}
              >
                <SpatialIcon name="sparkles" size={13} color="#E50914" />
                <Text style={styles.demoPillText}>Linguist</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.demoPill}
                onPress={() => handleQuickDemo("moderator", "Clan Moderator")}
              >
                <SpatialIcon name="shield" size={13} color="#E5A93C" />
                <Text style={styles.demoPillText}>Moderator</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Method Selector */}
          <View style={styles.methodSelector}>
            <TouchableOpacity
              onPress={() => setAuthType("phone")}
              style={[styles.methodBtn, authType === "phone" && styles.methodBtnActive]}
            >
              <SpatialIcon
                name="waveform"
                size={12}
                color={authType === "phone" ? "#FFFFFF" : "#AAAAAA"}
              />
              <Text style={[styles.methodText, authType === "phone" && styles.methodTextActive]}>
                Phone OTP
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setAuthType("email")}
              style={[styles.methodBtn, authType === "email" && styles.methodBtnActive]}
            >
              <SpatialIcon
                name="lock"
                size={12}
                color={authType === "email" ? "#FFFFFF" : "#AAAAAA"}
              />
              <Text style={[styles.methodText, authType === "email" && styles.methodTextActive]}>
                Email
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          {isSignUp && (
            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>FULL NAME / CLAN</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="e.g. Somu Dora (Koya Clan)"
                placeholderTextColor="#666"
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>
              {authType === "phone" ? "PHONE NUMBER (OTP)" : "EMAIL ADDRESS"}
            </Text>
            <TextInput
              style={styles.input}
              value={inputVal}
              onChangeText={setInputVal}
              keyboardType={authType === "phone" ? "phone-pad" : "email-address"}
              placeholder={authType === "phone" ? "+91 98765 43210" : "elder@voiceroots.org"}
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>PASSWORD / PASSCODE</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="••••••••••••"
              placeholderTextColor="#666"
            />
          </View>

          {/* Submit Action */}
          <TouchableOpacity style={styles.submitBtn} onPress={handleLogin} activeOpacity={0.85}>
            <Text style={styles.submitText}>
              {isSignUp ? "Register & Enter Archive" : "Sign In to Voice Roots"}
            </Text>
          </TouchableOpacity>

          {/* Skip for now */}
          {onSkip && (
            <TouchableOpacity style={styles.skipBtn} onPress={onSkip}>
              <Text style={styles.skipText}>Browse Archive as Guest →</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Footer Disclaimer */}
        <Text style={styles.disclaimer}>
          🛡️ Indigenous Ethical Data Sovereignty: All audio contributions remain owned by tribal community storytellers.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#141414",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  logoBadge: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#E50914",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    shadowColor: "#E50914",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  logoText: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "900",
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  brandTagline: {
    fontSize: 12,
    color: "#AAAAAA",
    marginTop: 3,
  },
  glassCard: {
    backgroundColor: "#1C1C1C",
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 99,
    padding: 3,
    marginBottom: 16,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 9,
    alignItems: "center",
    borderRadius: 99,
  },
  modeTabActive: {
    backgroundColor: "#E50914",
  },
  modeTabText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#AAAAAA",
  },
  modeTabTextActive: {
    color: "#FFFFFF",
  },
  demoSection: {
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
  },
  demoLabel: {
    fontSize: 10,
    color: "#AAAAAA",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    marginBottom: 6,
  },
  demoRow: {
    flexDirection: "row",
    gap: 8,
  },
  demoPill: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    paddingVertical: 7,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  demoPillText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  methodSelector: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  methodBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
  },
  methodBtnActive: {
    backgroundColor: "rgba(229, 9, 20, 0.2)",
    borderWidth: 1,
    borderColor: "#E50914",
  },
  methodText: {
    color: "#AAAAAA",
    fontSize: 11,
    fontWeight: "500",
  },
  methodTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  inputGroup: {
    marginBottom: 12,
  },
  fieldLabel: {
    color: "#AAAAAA",
    fontSize: 10,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#111111",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: "#FFFFFF",
    fontSize: 13,
  },
  submitBtn: {
    backgroundColor: "#E50914",
    paddingVertical: 13,
    borderRadius: 99,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#E50914",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  skipBtn: {
    alignItems: "center",
    marginTop: 14,
  },
  skipText: {
    color: "#AAAAAA",
    fontSize: 12,
  },
  disclaimer: {
    color: "#666666",
    fontSize: 10,
    textAlign: "center",
    marginTop: 20,
    lineHeight: 14,
    paddingHorizontal: 10,
  },
});
