import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'clay_colors.dart';

class ClayTheme {
  static ThemeData get lightTheme {
    final fontFamily = GoogleFonts.plusJakartaSans().fontFamily;

    return ThemeData(
      useMaterial3: true,
      fontFamily: fontFamily,
      scaffoldBackgroundColor: ClayColors.background,
      primaryColor: ClayColors.primary,
      colorScheme: const ColorScheme.light(
        primary: ClayColors.primary,
        secondary: ClayColors.primaryDark,
        surface: ClayColors.surface,
        error: ClayColors.statusDangerText,
        onPrimary: Colors.white,
        onSecondary: Colors.white,
        onSurface: ClayColors.textDark,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        surfaceTintColor: Colors.transparent,
        iconTheme: IconThemeData(color: ClayColors.textDark),
        titleTextStyle: TextStyle(
          color: ClayColors.textDark,
          fontSize: 18,
          fontWeight: FontWeight.w700,
        ),
      ),
      dividerTheme: const DividerThemeData(
        color: ClayColors.borderLight,
        thickness: 1,
      ),
    );
  }
}
