import 'package:flutter/material.dart';
import '../theme/clay_colors.dart';

class StatusPill extends StatelessWidget {
  final String status;
  final String? label;
  final double fontSize;
  final EdgeInsetsGeometry padding;

  const StatusPill({
    super.key,
    required this.status,
    this.label,
    this.fontSize = 12.0,
    this.padding = const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
  });

  @override
  Widget build(BuildContext context) {
    final normalized = status.toLowerCase().replaceAll('-', '_').trim();

    Color bgColor;
    Color borderColor;
    Color textColor;
    String displayLabel = label ?? _formatStatus(status);

    switch (normalized) {
      case 'submitted':
      case 'pending':
      case 'pending_review':
      case 'open':
        bgColor = ClayColors.statusPendingBg;
        borderColor = ClayColors.statusPendingBorder;
        textColor = ClayColors.statusPendingText;
        break;
      case 'in_review':
      case 'under_review':
      case 'reviewing':
      case 'responded':
        bgColor = ClayColors.statusReviewBg;
        borderColor = ClayColors.statusReviewBorder;
        textColor = ClayColors.statusReviewText;
        break;
      case 'in_progress':
      case 'working':
        bgColor = ClayColors.statusProgressBg;
        borderColor = ClayColors.statusProgressBorder;
        textColor = ClayColors.statusProgressText;
        break;
      case 'completed':
      case 'resolved':
      case 'done':
        bgColor = ClayColors.statusSuccessBg;
        borderColor = ClayColors.statusSuccessBorder;
        textColor = ClayColors.statusSuccessText;
        break;
      case 'cancelled':
      case 'rejected':
      case 'closed':
        bgColor = ClayColors.statusDangerBg;
        borderColor = ClayColors.statusDangerBorder;
        textColor = ClayColors.statusDangerText;
        break;
      default:
        bgColor = Colors.grey.shade100;
        borderColor = Colors.grey.shade300;
        textColor = ClayColors.textMuted;
    }

    return Container(
      padding: padding,
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: borderColor, width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 6,
            height: 6,
            decoration: BoxDecoration(
              color: textColor,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 6),
          Text(
            displayLabel,
            style: TextStyle(
              fontSize: fontSize,
              fontWeight: FontWeight.w600,
              color: textColor,
            ),
          ),
        ],
      ),
    );
  }

  static String _formatStatus(String status) {
    switch (status.toLowerCase().replaceAll('-', '_').trim()) {
      case 'submitted':
        return 'Submitted';
      case 'in_review':
        return 'In Review';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      case 'open':
        return 'Open';
      case 'responded':
        return 'Responded';
      case 'resolved':
        return 'Resolved';
      case 'closed':
        return 'Closed';
      default:
        return status
            .split('_')
            .map((w) => w.isNotEmpty ? '${w[0].toUpperCase()}${w.substring(1)}' : '')
            .join(' ');
    }
  }
}
