import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { SpatialIcon } from "../components/SpatialIcon";

export function HomeScreen({
  onNavigateRecord,
  onNavigateTranslate,
}: {
  onNavigateRecord: () => void;
  onNavigateTranslate: () => void;
}) {
  const [playingId, setPlayingId] = useState<string | null>(null);

  const togglePlay = (id: string) => {
    if (playingId === id) {
      setPlayingId(null);
    } else {
      setPlayingId(id);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Apple Fitness Style Header */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.dateLabel}>MONDAY, 6 OCT</Text>
          <Text style={styles.screenTitle}>Summary</Text>
        </View>
        <View style={styles.avatarRing}>
          <View style={styles.avatarInner}>
            <Text style={styles.avatarText}>VR</Text>
          </View>
        </View>
      </View>

      {/* Iconic Apple Fitness Activity Rings Card */}
      <View style={styles.ringsCard}>
        <View style={styles.ringsHeader}>
          <Text style={styles.ringsTitle}>ACTIVITY RINGS</Text>
          <View style={styles.streakBadge}>
            <SpatialIcon name="sparkles" size={10} color="#A1FE05" />
            <Text style={styles.streakText}>7-Day Streak</Text>
          </View>
        </View>

        <View style={styles.ringsBody}>
          {/* Concentric Rings Visual Container */}
          <View style={styles.ringsVisualWrapper}>
            {/* Outer Red Ring (Move) */}
            <View style={[styles.ringTrack, styles.ringOuterTrack]}>
              <View style={[styles.ringProgress, styles.ringOuterProgress]} />
            </View>
            {/* Middle Green Ring (Exercise) */}
            <View style={[styles.ringTrack, styles.ringMiddleTrack]}>
              <View style={[styles.ringProgress, styles.ringMiddleProgress]} />
            </View>
            {/* Inner Cyan Ring (Explore) */}
            <View style={[styles.ringTrack, styles.ringInnerTrack]}>
              <View style={[styles.ringProgress, styles.ringInnerProgress]} />
            </View>
            {/* Center Flame Icon */}
            <View style={styles.ringCenterOrb}>
              <SpatialIcon name="sparkles" size={18} color="#FA114F" />
            </View>
          </View>

          {/* Metrics Stack (Exact Apple Fitness Typography) */}
          <View style={styles.metricsStack}>
            <View style={styles.metricItem}>
              <View style={styles.metricRow}>
                <Text style={[styles.metricValue, { color: "#FA114F" }]}>1,840</Text>
                <Text style={styles.metricGoal}>/ 2,000</Text>
              </View>
              <Text style={[styles.metricLabel, { color: "#FA114F" }]}>WORDS RECORDED</Text>
            </View>

            <View style={styles.metricItem}>
              <View style={styles.metricRow}>
                <Text style={[styles.metricValue, { color: "#A1FE05" }]}>24</Text>
                <Text style={styles.metricGoal}>/ 30 MIN</Text>
              </View>
              <Text style={[styles.metricLabel, { color: "#A1FE05" }]}>ORAL LORE TIME</Text>
            </View>

            <View style={styles.metricItem}>
              <View style={styles.metricRow}>
                <Text style={[styles.metricValue, { color: "#00D8F6" }]}>8</Text>
                <Text style={styles.metricGoal}>/ 12</Text>
              </View>
              <Text style={[styles.metricLabel, { color: "#00D8F6" }]}>DIALECTS EXPLORED</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Day-to-Day Conversational Translation Quick Action Card */}
      <TouchableOpacity
        style={styles.translateHeroCard}
        onPress={onNavigateTranslate}
        activeOpacity={0.85}
      >
        <View style={styles.translateCardTop}>
          <View style={styles.translateIconOrb}>
            <SpatialIcon name="globe" size={20} color="#00D8F6" />
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <View style={styles.dailyBadgeRow}>
              <Text style={styles.dailyBadge}>DAY-TO-DAY TRANSLATION (12 LANGS)</Text>
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

      {/* Workouts -> Preservation Sessions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>PRESERVATION SESSIONS</Text>
          <TouchableOpacity onPress={onNavigateRecord}>
            <Text style={styles.sectionAction}>+ Record New</Text>
          </TouchableOpacity>
        </View>

        {[
          {
            id: "vr-101",
            title: "Traditional Harvest & Rain Song",
            telugu: "వరి పంట సంప్రదాయ పాట",
            lang: "Telugu (Agency)",
            dur: "26 MIN",
            words: "1,240 WDS",
            elder: "Elder Ramu",
            color: "#FA114F",
          },
          {
            id: "vr-102",
            title: "The Mountain Spring Legend",
            telugu: "కొండ శిఖరం ఊట కథ & గీతం",
            lang: "Gondi (Bastar)",
            dur: "14 MIN",
            words: "890 WDS",
            elder: "Elder Laxman",
            color: "#A1FE05",
          },
          {
            id: "vr-103",
            title: "Wild Turmeric Medicinal Lore",
            telugu: "అడవి పసుపు వైద్యం",
            lang: "Koya (Godavari)",
            dur: "10 MIN",
            words: "620 WDS",
            elder: "Forest Healers",
            color: "#00D8F6",
          },
        ].map((item) => {
          const isPlaying = playingId === item.id;
          return (
            <View key={item.id} style={styles.sessionCard}>
              <View style={styles.sessionCardTop}>
                <View style={[styles.sessionBadgeOrb, { backgroundColor: `${item.color}25` }]}>
                  <SpatialIcon name="speaker" size={16} color={item.color} />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.sessionTitle}>{item.title}</Text>
                  <Text style={styles.sessionTelugu}>{item.telugu}</Text>
                  <Text style={styles.sessionMeta}>
                    {item.lang} • {item.elder}
                  </Text>
                </View>

                {/* Instant Play Button */}
                <TouchableOpacity
                  style={[styles.sessionPlayBtn, isPlaying && styles.sessionPlayBtnActive]}
                  onPress={() => togglePlay(item.id)}
                  activeOpacity={0.8}
                >
                  <SpatialIcon
                    name={isPlaying ? "sparkles" : "play"}
                    size={14}
                    color="#000000"
                  />
                </TouchableOpacity>
              </View>

              {/* Bottom stats row */}
              <View style={styles.sessionCardBottom}>
                <Text style={styles.sessionStat}>{item.dur}</Text>
                <Text style={[styles.sessionStat, { color: item.color }]}>{item.words}</Text>
                <Text style={styles.sessionStatus}>
                  {isPlaying ? "PLAYING AUDIO..." : "48kHz PCM WAV"}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Apple Fitness Trends */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>TRENDS</Text>
        <View style={styles.trendsRow}>
          <View style={styles.trendCard}>
            <Text style={[styles.trendLabel, { color: "#FA114F" }]}>WORDS / DAY</Text>
            <Text style={styles.trendVal}>2.4k</Text>
            <Text style={styles.trendSub}>Above daily target</Text>
          </View>
          <View style={styles.trendCard}>
            <Text style={[styles.trendLabel, { color: "#A1FE05" }]}>LISTENING TIME</Text>
            <Text style={styles.trendVal}>32 min</Text>
            <Text style={styles.trendSub}>7-Day Streak</Text>
          </View>
        </View>
      </View>

      {/* Apple Fitness Awards */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AWARDS & MEDALS</Text>
        <View style={styles.awardsRow}>
          {[
            { title: "7-Day", sub: "Streak", color: "#FA114F" },
            { title: "10k Wds", sub: "Preserved", color: "#A1FE05" },
            { title: "Folk Song", sub: "Guardian", color: "#00D8F6" },
            { title: "All 3 Rings", sub: "Closed", color: "#F5C518" },
          ].map((a, i) => (
            <View key={i} style={styles.awardItem}>
              <View style={styles.awardIconCircle}>
                <SpatialIcon name="sparkles" size={16} color={a.color} />
              </View>
              <Text style={styles.awardTitle}>{a.title}</Text>
              <Text style={styles.awardSub}>{a.sub}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 95,
  },
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 16,
  },
  dateLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#8E8E93",
    letterSpacing: 0.8,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -0.6,
  },
  avatarRing: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FA114F",
    padding: 2,
  },
  avatarInner: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: "#1C1C1E",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  ringsCard: {
    backgroundColor: "#1C1C1E",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    padding: 16,
    marginBottom: 16,
  },
  ringsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  ringsTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.8,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  streakText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#A1FE05",
  },
  ringsBody: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ringsVisualWrapper: {
    width: 130,
    height: 130,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  ringTrack: {
    position: "absolute",
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  ringOuterTrack: {
    width: 124,
    height: 124,
    borderWidth: 9,
    borderColor: "rgba(250, 17, 79, 0.2)",
  },
  ringOuterProgress: {
    position: "absolute",
    top: -9,
    left: -9,
    width: 124,
    height: 124,
    borderRadius: 999,
    borderWidth: 9,
    borderTopColor: "#FA114F",
    borderRightColor: "#FA114F",
    borderBottomColor: "#FA114F",
    borderLeftColor: "transparent",
    transform: [{ rotate: "-45deg" }],
  },
  ringMiddleTrack: {
    width: 94,
    height: 94,
    borderWidth: 9,
    borderColor: "rgba(161, 254, 5, 0.2)",
  },
  ringMiddleProgress: {
    position: "absolute",
    top: -9,
    left: -9,
    width: 94,
    height: 94,
    borderRadius: 999,
    borderWidth: 9,
    borderTopColor: "#A1FE05",
    borderRightColor: "#A1FE05",
    borderBottomColor: "#A1FE05",
    borderLeftColor: "transparent",
    transform: [{ rotate: "15deg" }],
  },
  ringInnerTrack: {
    width: 64,
    height: 64,
    borderWidth: 9,
    borderColor: "rgba(0, 216, 246, 0.2)",
  },
  ringInnerProgress: {
    position: "absolute",
    top: -9,
    left: -9,
    width: 64,
    height: 64,
    borderRadius: 999,
    borderWidth: 9,
    borderTopColor: "#00D8F6",
    borderRightColor: "#00D8F6",
    borderBottomColor: "transparent",
    borderLeftColor: "transparent",
    transform: [{ rotate: "60deg" }],
  },
  ringCenterOrb: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  metricsStack: {
    flex: 1,
    marginLeft: 14,
    gap: 8,
  },
  metricItem: {},
  metricRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 3,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "900",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  metricGoal: {
    fontSize: 10,
    fontWeight: "700",
    color: "#8E8E93",
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  translateHeroCard: {
    backgroundColor: "#1C1C1E",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(0, 216, 246, 0.35)",
    padding: 14,
    marginBottom: 16,
  },
  translateCardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  translateIconOrb: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(0, 216, 246, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  dailyBadgeRow: {
    marginBottom: 2,
  },
  dailyBadge: {
    color: "#00D8F6",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  translateCardTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  translateCardSub: {
    fontSize: 10,
    color: "#8E8E93",
    marginTop: 2,
    lineHeight: 14,
  },
  translateCardFooter: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
  },
  translateActionText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#00D8F6",
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.8,
  },
  sectionAction: {
    fontSize: 10,
    fontWeight: "700",
    color: "#A1FE05",
  },
  sessionCard: {
    backgroundColor: "#1C1C1E",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    padding: 12,
    marginBottom: 8,
  },
  sessionCardTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  sessionBadgeOrb: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  sessionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  sessionTelugu: {
    fontSize: 10,
    color: "#F5C518",
    fontWeight: "600",
  },
  sessionMeta: {
    fontSize: 9,
    color: "#8E8E93",
    marginTop: 1,
  },
  sessionPlayBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#A1FE05",
    alignItems: "center",
    justifyContent: "center",
  },
  sessionPlayBtnActive: {
    backgroundColor: "#00D8F6",
  },
  sessionCardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.06)",
  },
  sessionStat: {
    fontSize: 9,
    fontWeight: "800",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    color: "#FFFFFF",
  },
  sessionStatus: {
    fontSize: 8,
    color: "#8E8E93",
    fontWeight: "600",
  },
  trendsRow: {
    flexDirection: "row",
    gap: 8,
  },
  trendCard: {
    flex: 1,
    backgroundColor: "#1C1C1E",
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  trendLabel: {
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  trendVal: {
    fontSize: 18,
    fontWeight: "900",
    color: "#FFFFFF",
    marginVertical: 2,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  trendSub: {
    fontSize: 8,
    color: "#8E8E93",
  },
  awardsRow: {
    flexDirection: "row",
    gap: 6,
  },
  awardItem: {
    flex: 1,
    backgroundColor: "#1C1C1E",
    borderRadius: 14,
    padding: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  awardIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  awardTitle: {
    fontSize: 8,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
  },
  awardSub: {
    fontSize: 7,
    color: "#8E8E93",
    textAlign: "center",
  },
});
