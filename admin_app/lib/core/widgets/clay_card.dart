import 'package:flutter/material.dart';
import '../theme/clay_colors.dart';
import '../theme/clay_decorations.dart';

class ClayCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final double radius;
  final Color backgroundColor;
  final Color? borderColor;
  final VoidCallback? onTap;

  const ClayCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(20.0),
    this.margin,
    this.radius = 24.0,
    this.backgroundColor = ClayColors.surfaceCard,
    this.borderColor,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    Widget content = Container(
      margin: margin,
      padding: padding,
      decoration: ClayDecorations.card(
        radius: radius,
        backgroundColor: backgroundColor,
        borderColor: borderColor,
      ),
      child: child,
    );

    if (onTap != null) {
      return GestureDetector(
        onTap: onTap,
        behavior: HitTestBehavior.opaque,
        child: content,
      );
    }

    return content;
  }
}
