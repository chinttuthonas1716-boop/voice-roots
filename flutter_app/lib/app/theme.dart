import 'package:flutter/material.dart';

class VoiceRootsColors {
  static const background = Color(0xFF2D3250);
  static const backgroundDeep = Color(0xFF242942);
  static const indigo = Color(0xFF42476C);
  static const periwinkle = Color(0xFF6F76A0);
  static const peach = Color(0xFFF9B17A);
  static const peachSoft = Color(0xFFF6A875);
  static const white = Color(0xFFFFFFFF);
  static const textSecondary = Color(0xFFD9D9E2);
  static const textMuted = Color(0xFFA9AEC5);

  // Legacy compatibility mappings
  static const midnightIndigo = backgroundDeep;
  static const surfaceIndigo = indigo;
  static const warmAmber = peach;
  static const softViolet = periwinkle;
  static const heritageTeal = periwinkle;
  static const warmIvory = white;
}

class VoiceRootsTheme {
  // Direct theme color accessors matching VoiceRootsColors
  static const Color warmAmber = VoiceRootsColors.warmAmber;
  static const Color peach = VoiceRootsColors.peach;
  static const Color warmIvory = VoiceRootsColors.warmIvory;
  static const Color secondaryText = VoiceRootsColors.textSecondary;
  static const Color textMuted = VoiceRootsColors.textMuted;
  static const Color heritageTeal = VoiceRootsColors.heritageTeal;
  static const Color surfaceIndigo = VoiceRootsColors.surfaceIndigo;
  static const Color midnightIndigo = VoiceRootsColors.midnightIndigo;
  static const Color background = VoiceRootsColors.background;
  static const Color backgroundDeep = VoiceRootsColors.backgroundDeep;

  static ThemeData dark() {
    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: VoiceRootsColors.background,
      colorScheme: const ColorScheme.dark(
        primary: VoiceRootsColors.peach,
        secondary: VoiceRootsColors.periwinkle,
        surface: VoiceRootsColors.indigo,
        onPrimary: VoiceRootsColors.backgroundDeep,
        onSurface: VoiceRootsColors.white,
      ),
      fontFamily: 'Inter',
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: TextStyle(
          color: VoiceRootsColors.white,
          fontSize: 20,
          fontWeight: FontWeight.bold,
        ),
      ),
      inputDecorationTheme: const InputDecorationTheme(
        filled: true,
        fillColor: VoiceRootsColors.indigo,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.all(Radius.circular(14)),
          borderSide: BorderSide(color: Colors.white12),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.all(Radius.circular(14)),
          borderSide: BorderSide(color: VoiceRootsColors.peach),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: VoiceRootsColors.peach,
          foregroundColor: VoiceRootsColors.backgroundDeep,
          minimumSize: const Size(double.infinity, 52),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(15),
          ),
          elevation: 0,
        ),
      ),
    );
  }

  // Alias getter for backward compatibility
  static ThemeData get darkTheme => dark();
}
