import 'package:flutter/material.dart';
import '../theme/clay_colors.dart';
import '../theme/clay_decorations.dart';

enum ClayButtonVariant { primary, outline, text, danger }

class ClayButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final bool isLoading;
  final Widget? icon;
  final ClayButtonVariant variant;
  final double height;
  final double? width;
  final double radius;

  const ClayButton({
    super.key,
    required this.text,
    required this.onPressed,
    this.isLoading = false,
    this.icon,
    this.variant = ClayButtonVariant.primary,
    this.height = 52.0,
    this.width,
    this.radius = 16.0,
  });

  @override
  Widget build(BuildContext context) {
    final bool isEnabled = onPressed != null && !isLoading;

    BoxDecoration decoration;
    Color textColor;

    switch (variant) {
      case ClayButtonVariant.primary:
        decoration = isEnabled
            ? ClayDecorations.primaryButton(radius: radius)
            : BoxDecoration(
                color: ClayColors.textSubtle.withValues(alpha: 0.3),
                borderRadius: BorderRadius.circular(radius),
              );
        textColor = Colors.white;
        break;
      case ClayButtonVariant.outline:
        decoration = ClayDecorations.outlineButton(
          radius: radius,
          backgroundColor: Colors.white,
          borderColor: isEnabled ? ClayColors.primary : ClayColors.borderSubtle,
        );
        textColor = isEnabled ? ClayColors.primary : ClayColors.textSubtle;
        break;
      case ClayButtonVariant.danger:
        decoration = BoxDecoration(
          color: isEnabled ? ClayColors.statusDangerBg : Colors.grey.shade200,
          borderRadius: BorderRadius.circular(radius),
          border: Border.all(
            color: isEnabled ? ClayColors.statusDangerBorder : Colors.grey.shade300,
          ),
        );
        textColor = isEnabled ? ClayColors.statusDangerText : Colors.grey;
        break;
      case ClayButtonVariant.text:
        decoration = const BoxDecoration();
        textColor = isEnabled ? ClayColors.primary : ClayColors.textSubtle;
        break;
    }

    return AnimatedContainer(
      duration: const Duration(milliseconds: 150),
      width: width,
      height: height,
      decoration: decoration,
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: isEnabled ? onPressed : null,
          borderRadius: BorderRadius.circular(radius),
          child: Center(
            child: isLoading
                ? SizedBox(
                    width: 22,
                    height: 22,
                    child: CircularProgressIndicator(
                      strokeWidth: 2.5,
                      valueColor: AlwaysStoppedAnimation<Color>(
                        variant == ClayButtonVariant.primary
                            ? Colors.white
                            : ClayColors.primary,
                      ),
                    ),
                  )
                : Row(
                    mainAxisSize: MainAxisSize.min,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      if (icon != null) ...[
                        icon!,
                        const SizedBox(width: 8),
                      ],
                      Text(
                        text,
                        style: TextStyle(
                          color: textColor,
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          letterSpacing: 0.2,
                        ),
                      ),
                    ],
                  ),
          ),
        ),
      ),
    );
  }
}
