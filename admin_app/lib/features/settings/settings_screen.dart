import 'package:flutter/material.dart';
import '../../core/auth/auth_provider.dart';
import '../../core/constants/api_constants.dart';
import '../../core/theme/clay_colors.dart';
import '../../core/theme/clay_decorations.dart';
import '../../core/widgets/clay_button.dart';
import '../../core/widgets/clay_card.dart';

class SettingsScreen extends StatelessWidget {
  final AuthProvider authProvider;

  const SettingsScreen({super.key, required this.authProvider});

  void _showLogoutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text(
          'Sign Out of Admin Portal?',
          style: TextStyle(fontWeight: FontWeight.w700, fontSize: 18),
        ),
        content: const Text(
          'Are you sure you want to end your administrative session? You will need to enter your credentials to log back in.',
          style: TextStyle(fontSize: 14, color: ClayColors.textMuted),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Cancel', style: TextStyle(color: ClayColors.textMuted, fontWeight: FontWeight.w600)),
          ),
          ClayButton(
            text: 'Sign Out',
            variant: ClayButtonVariant.danger,
            height: 40,
            width: 100,
            onPressed: () async {
              Navigator.of(ctx).pop();
              await authProvider.logout();
            },
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final user = authProvider.currentUser;
    const name = 'ADMIN';
    final email = user?.email ?? 'admin@assignmenthub.com';

    return Scaffold(
      backgroundColor: ClayColors.background,
      appBar: AppBar(
        title: const Text('Settings & Portal'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // 1. Admin Profile Card
              ClayCard(
                padding: const EdgeInsets.all(22),
                child: Row(
                  children: [
                    Container(
                      width: 58,
                      height: 58,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [ClayColors.primaryGradientStart, ClayColors.primaryGradientEnd],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(18),
                        boxShadow: const [
                          BoxShadow(
                            color: Color(0x304D41DF),
                            offset: Offset(0, 6),
                            blurRadius: 14,
                          ),
                        ],
                      ),
                      child: const Center(
                        child: Icon(Icons.security, color: Colors.white, size: 28),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            name,
                            style: const TextStyle(
                              fontSize: 17,
                              fontWeight: FontWeight.w800,
                              color: ClayColors.textDark,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 2),
                          Text(
                            email,
                            style: const TextStyle(
                              fontSize: 13,
                              color: ClayColors.textMuted,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: ClayColors.primary.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Text(
                              'ADMINISTRATOR',
                              style: TextStyle(
                                fontSize: 9,
                                fontWeight: FontWeight.w700,
                                color: ClayColors.primary,
                                letterSpacing: 0.8,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // 2. System Architecture & Environment Details
              ClayCard(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'System & Environment',
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: ClayColors.textDark,
                      ),
                    ),
                    const SizedBox(height: 14),
                    _buildSettingsRow(
                      icon: Icons.cloud_done_outlined,
                      label: 'Backend Endpoint',
                      value: ApiConstants.baseUrl,
                    ),
                    const SizedBox(height: 12),
                    _buildSettingsRow(
                      icon: Icons.storage_outlined,
                      label: 'Database Engine',
                      value: 'Supabase PostgreSQL',
                    ),
                    const SizedBox(height: 12),
                    _buildSettingsRow(
                      icon: Icons.folder_special_outlined,
                      label: 'Storage Bucket',
                      value: 'service-request-files (Private)',
                    ),
                    const SizedBox(height: 12),
                    _buildSettingsRow(
                      icon: Icons.verified_user_outlined,
                      label: 'Security Level',
                      value: 'Strict Bearer + Role Verification',
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // 3. App Information
              ClayCard(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'About AssignmentHub Admin',
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: ClayColors.textDark,
                      ),
                    ),
                    const SizedBox(height: 14),
                    _buildSettingsRow(
                      icon: Icons.info_outline,
                      label: 'Version',
                      value: '1.0.0 (Production Stable)',
                    ),
                    const SizedBox(height: 12),
                    _buildSettingsRow(
                      icon: Icons.palette_outlined,
                      label: 'Design System',
                      value: 'AssignmentHub Claymorphism',
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 28),

              // 4. Logout Action
              ClayButton(
                text: 'Sign Out of Admin Portal',
                variant: ClayButtonVariant.danger,
                icon: const Icon(Icons.logout_rounded, size: 18, color: ClayColors.statusDangerText),
                onPressed: () => _showLogoutDialog(context),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSettingsRow({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: ClayDecorations.insetWell(radius: 12),
      child: Row(
        children: [
          Icon(icon, size: 18, color: ClayColors.primary),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: const TextStyle(
                    fontSize: 11,
                    color: ClayColors.textSubtle,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  value,
                  style: const TextStyle(
                    fontSize: 13,
                    color: ClayColors.textDark,
                    fontWeight: FontWeight.w600,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
