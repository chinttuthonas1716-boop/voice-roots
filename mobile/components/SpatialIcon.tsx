import React from "react";
import { StyleSheet, View, Text } from "react-native";

export type IconType =
  | "home"
  | "archive"
  | "mic"
  | "profile"
  | "globe"
  | "sparkles"
  | "shield"
  | "play"
  | "waveform"
  | "lock";

interface SpatialIconProps {
  name: IconType;
  size?: number;
  color?: string;
  glow?: boolean;
  glassVessel?: boolean;
  vesselSize?: number;
}

/**
 * iOS 27 Spatial Liquid Glass Icon Vessel.
 * Combines translucent frosted glass surfaces, specular light rims,
 * and high-contrast vector geometry with Netflix cinematic accents.
 */
export function SpatialIcon({
  name,
  size = 20,
  color = "#FFFFFF",
  glow = false,
  glassVessel = false,
  vesselSize = 44,
}: SpatialIconProps) {
  // Render bespoke vector glyphs using high-fidelity geometric styling
  const renderGlyph = () => {
    switch (name) {
      case "home":
        return (
          <View style={[styles.glyphContainer, { width: size, height: size }]}>
            {/* Minimalist roof ridge */}
            <View
              style={[
                styles.homeRoof,
                {
                  borderBottomColor: color,
                  borderLeftWidth: size * 0.48,
                  borderRightWidth: size * 0.48,
                  borderBottomWidth: size * 0.38,
                },
              ]}
            />
            {/* Minimalist lower portal */}
            <View
              style={[
                styles.homeBody,
                {
                  width: size * 0.72,
                  height: size * 0.48,
                  backgroundColor: color,
                  borderRadius: 2,
                },
              ]}
            >
              <View
                style={[
                  styles.homeDoor,
                  { width: size * 0.26, height: size * 0.3, backgroundColor: "#141414" },
                ]}
              />
            </View>
          </View>
        );

      case "archive":
        return (
          <View style={[styles.glyphContainer, { width: size, height: size }]}>
            {/* 3 Layered Spatial Linguistic Folios */}
            <View
              style={[
                styles.folioBar,
                {
                  width: size * 0.85,
                  height: size * 0.22,
                  backgroundColor: color,
                  borderRadius: 3,
                  opacity: 0.9,
                },
              ]}
            />
            <View
              style={[
                styles.folioBar,
                {
                  width: size * 0.7,
                  height: size * 0.22,
                  backgroundColor: color,
                  borderRadius: 3,
                  opacity: 0.65,
                  marginTop: 2.5,
                },
              ]}
            />
            <View
              style={[
                styles.folioBar,
                {
                  width: size * 0.55,
                  height: size * 0.22,
                  backgroundColor: color,
                  borderRadius: 3,
                  opacity: 0.4,
                  marginTop: 2.5,
                },
              ]}
            />
          </View>
        );

      case "mic":
        return (
          <View style={[styles.glyphContainer, { width: size, height: size }]}>
            {/* Mic capsule */}
            <View
              style={[
                styles.micCapsule,
                {
                  width: size * 0.42,
                  height: size * 0.6,
                  borderRadius: size * 0.21,
                  backgroundColor: color,
                },
              ]}
            />
            {/* Spatial pick-up cradle */}
            <View
              style={[
                styles.micCradle,
                {
                  width: size * 0.68,
                  height: size * 0.38,
                  borderBottomLeftRadius: size * 0.34,
                  borderBottomRightRadius: size * 0.34,
                  borderWidth: 2,
                  borderTopWidth: 0,
                  borderColor: color,
                  marginTop: -size * 0.18,
                },
              ]}
            />
            {/* Mic stem */}
            <View
              style={[
                styles.micStem,
                { width: 2, height: size * 0.2, backgroundColor: color },
              ]}
            />
          </View>
        );

      case "profile":
        return (
          <View style={[styles.glyphContainer, { width: size, height: size }]}>
            {/* Biometric head */}
            <View
              style={[
                styles.profileHead,
                {
                  width: size * 0.44,
                  height: size * 0.44,
                  borderRadius: size * 0.22,
                  backgroundColor: color,
                },
              ]}
            />
            {/* Biometric shoulders */}
            <View
              style={[
                styles.profileShoulders,
                {
                  width: size * 0.85,
                  height: size * 0.38,
                  borderTopLeftRadius: size * 0.42,
                  borderTopRightRadius: size * 0.42,
                  backgroundColor: color,
                  marginTop: 2,
                  opacity: 0.85,
                },
              ]}
            />
          </View>
        );

      case "globe":
        return (
          <View style={[styles.glyphContainer, { width: size, height: size }]}>
            <View
              style={[
                styles.globeOuter,
                {
                  width: size * 0.9,
                  height: size * 0.9,
                  borderRadius: (size * 0.9) / 2,
                  borderWidth: 1.8,
                  borderColor: color,
                  alignItems: "center",
                  justifyContent: "center",
                },
              ]}
            >
              {/* Latitude and Longitude rings */}
              <View
                style={{
                  width: "100%",
                  height: 1.5,
                  backgroundColor: color,
                  opacity: 0.6,
                }}
              />
              <View
                style={{
                  width: size * 0.48,
                  height: "100%",
                  borderRadius: size * 0.24,
                  borderWidth: 1.2,
                  borderColor: color,
                  position: "absolute",
                  opacity: 0.8,
                }}
              />
            </View>
          </View>
        );

      case "sparkles":
        return (
          <View style={[styles.glyphContainer, { width: size, height: size, alignItems: "center", justifyContent: "center" }]}>
            {/* Primary 4-point Diamond Star */}
            <View
              style={{
                width: size * 0.54,
                height: size * 0.54,
                backgroundColor: color,
                transform: [{ rotate: "45deg" }],
                borderRadius: 2,
              }}
            />
            {/* Specular Center Core */}
            <View
              style={{
                position: "absolute",
                width: size * 0.22,
                height: size * 0.22,
                backgroundColor: "#141414",
                borderRadius: 1.5,
              }}
            />
            {/* Secondary companion micro-sparkle */}
            <View
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: size * 0.26,
                height: size * 0.26,
                backgroundColor: color,
                transform: [{ rotate: "45deg" }],
                borderRadius: 1,
                opacity: 0.85,
              }}
            />
          </View>
        );

      case "shield":
        return (
          <View style={[styles.glyphContainer, { width: size, height: size }]}>
            <View
              style={[
                styles.shieldBase,
                {
                  width: size * 0.78,
                  height: size * 0.85,
                  backgroundColor: color,
                  borderTopLeftRadius: 4,
                  borderTopRightRadius: 4,
                  borderBottomLeftRadius: size * 0.4,
                  borderBottomRightRadius: size * 0.4,
                  alignItems: "center",
                  justifyContent: "center",
                },
              ]}
            >
              <View
                style={{
                  width: size * 0.28,
                  height: size * 0.28,
                  backgroundColor: "#141414",
                  borderRadius: size * 0.14,
                }}
              />
            </View>
          </View>
        );

      case "play":
        return (
          <View style={[styles.glyphContainer, { width: size, height: size }]}>
            <View
              style={[
                styles.playTriangle,
                {
                  borderLeftWidth: size * 0.65,
                  borderTopWidth: size * 0.38,
                  borderBottomWidth: size * 0.38,
                  borderLeftColor: color,
                  marginLeft: size * 0.12,
                },
              ]}
            />
          </View>
        );

      case "waveform":
        return (
          <View
            style={[
              styles.waveformBox,
              { width: size * 1.1, height: size, flexDirection: "row", alignItems: "center", gap: 2 },
            ]}
          >
            {[40, 95, 60, 100, 75, 35].map((h, idx) => (
              <View
                key={idx}
                style={{
                  width: 2.5,
                  height: `${h}%`,
                  borderRadius: 1.5,
                  backgroundColor: color,
                }}
              />
            ))}
          </View>
        );

      case "lock":
        return (
          <View style={[styles.glyphContainer, { width: size, height: size }]}>
            {/* Shackle */}
            <View
              style={{
                width: size * 0.5,
                height: size * 0.4,
                borderTopLeftRadius: size * 0.25,
                borderTopRightRadius: size * 0.25,
                borderWidth: 2,
                borderBottomWidth: 0,
                borderColor: color,
              }}
            />
            {/* Body */}
            <View
              style={{
                width: size * 0.72,
                height: size * 0.5,
                borderRadius: 4,
                backgroundColor: color,
                marginTop: -1,
              }}
            />
          </View>
        );

      default:
        return null;
    }
  };

  if (glassVessel) {
    return (
      <View
        style={[
          styles.glassVesselContainer,
          {
            width: vesselSize,
            height: vesselSize,
            borderRadius: vesselSize * 0.36, // iOS 27 rounded squircle
          },
          glow && styles.redGlowHalo,
        ]}
      >
        {/* Specular top light rim */}
        <View style={styles.vesselSpecular} />
        {renderGlyph()}
      </View>
    );
  }

  return renderGlyph();
}

const styles = StyleSheet.create({
  glyphContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  homeRoof: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    marginBottom: -1,
  },
  homeBody: {
    alignItems: "center",
    justifyContent: "flex-end",
  },
  homeDoor: {
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  folioBar: {
    marginVertical: 1,
  },
  micCapsule: {},
  micCradle: {},
  micStem: {
    marginTop: 1,
  },
  profileHead: {},
  profileShoulders: {},
  globeOuter: {},
  shieldBase: {},
  playTriangle: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
  },
  waveformBox: {
    justifyContent: "center",
  },
  glassVesselContainer: {
    backgroundColor: "rgba(35, 35, 35, 0.72)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.16)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 4,
    overflow: "hidden",
  },
  vesselSpecular: {
    position: "absolute",
    top: 0,
    left: 6,
    right: 6,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  redGlowHalo: {
    borderColor: "rgba(229, 9, 20, 0.5)",
    shadowColor: "#E50914",
    shadowOpacity: 0.65,
    shadowRadius: 14,
    elevation: 8,
  },
});
