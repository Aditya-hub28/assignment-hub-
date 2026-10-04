import 'package:flutter/material.dart';
import 'clay_colors.dart';

class ClayDecorations {
  /// Standard resting clay card decoration
  static BoxDecoration card({
    double radius = 24.0,
    Color backgroundColor = ClayColors.surfaceCard,
    Color? borderColor,
  }) {
    return BoxDecoration(
      color: backgroundColor,
      borderRadius: BorderRadius.circular(radius),
      border: Border.all(
        color: borderColor ?? ClayColors.borderLight,
        width: 1.0,
      ),
      boxShadow: const [
        BoxShadow(
          color: Color(0x124D41DF),
          offset: Offset(0, 10),
          blurRadius: 22,
          spreadRadius: 0,
        ),
        BoxShadow(
          color: Colors.white,
          offset: Offset(-3, -3),
          blurRadius: 10,
          spreadRadius: 0,
        ),
      ],
    );
  }

  /// Compact clay card (for list tiles, filter chips, compact grids)
  static BoxDecoration compactCard({
    double radius = 18.0,
    Color backgroundColor = ClayColors.surfaceCard,
    Color? borderColor,
  }) {
    return BoxDecoration(
      color: backgroundColor,
      borderRadius: BorderRadius.circular(radius),
      border: Border.all(
        color: borderColor ?? ClayColors.borderLight,
        width: 1.0,
      ),
      boxShadow: const [
        BoxShadow(
          color: Color(0x0E4D41DF),
          offset: Offset(0, 6),
          blurRadius: 14,
          spreadRadius: 0,
        ),
        BoxShadow(
          color: Colors.white,
          offset: Offset(-2, -2),
          blurRadius: 6,
          spreadRadius: 0,
        ),
      ],
    );
  }

  /// Inset well decoration (for inputs, info containers, chat bubbles)
  static BoxDecoration insetWell({
    double radius = 16.0,
    Color backgroundColor = ClayColors.surfaceInset,
    Color? borderColor,
  }) {
    return BoxDecoration(
      color: backgroundColor,
      borderRadius: BorderRadius.circular(radius),
      border: Border.all(
        color: borderColor ?? ClayColors.borderLight.withValues(alpha: 0.6),
        width: 1.0,
      ),
    );
  }

  /// Primary button decoration with soft clay shadow
  static BoxDecoration primaryButton({
    double radius = 16.0,
  }) {
    return BoxDecoration(
      gradient: const LinearGradient(
        colors: [
          ClayColors.primaryGradientStart,
          ClayColors.primaryGradientEnd,
        ],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      ),
      borderRadius: BorderRadius.circular(radius),
      boxShadow: const [
        BoxShadow(
          color: Color(0x404D41DF),
          offset: Offset(0, 8),
          blurRadius: 18,
          spreadRadius: 0,
        ),
      ],
    );
  }

  /// Secondary/Outline button decoration
  static BoxDecoration outlineButton({
    double radius = 16.0,
    Color backgroundColor = Colors.white,
    Color borderColor = ClayColors.primary,
  }) {
    return BoxDecoration(
      color: backgroundColor,
      borderRadius: BorderRadius.circular(radius),
      border: Border.all(color: borderColor, width: 1.5),
      boxShadow: const [
        BoxShadow(
          color: Color(0x0A4D41DF),
          offset: Offset(0, 4),
          blurRadius: 10,
        ),
      ],
    );
  }
}
