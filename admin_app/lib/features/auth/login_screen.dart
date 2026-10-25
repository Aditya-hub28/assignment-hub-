import 'package:flutter/material.dart';
import '../../core/auth/auth_provider.dart';
import '../../core/theme/clay_colors.dart';
import '../../core/widgets/clay_card.dart';

class LoginScreen extends StatefulWidget {
  final AuthProvider authProvider;

  const LoginScreen({super.key, required this.authProvider});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  String? _localError;

  Future<void> _handleGoogleSignIn() async {
    setState(() => _localError = null);
    final success = await widget.authProvider.loginWithGoogle();
    if (!success && mounted) {
      setState(() {
        _localError = widget.authProvider.errorMessage ?? 'Google sign-in could not be completed.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final isLoading = widget.authProvider.isLoading;

    return Scaffold(
      backgroundColor: ClayColors.background,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 440),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  // App Icon / Logo
                  Container(
                    width: 76,
                    height: 76,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [ClayColors.primaryGradientStart, ClayColors.primaryGradientEnd],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: const [
                        BoxShadow(
                          color: Color(0x354D41DF),
                          offset: Offset(0, 10),
                          blurRadius: 20,
                        ),
                      ],
                    ),
                    child: const Icon(
                      Icons.school_rounded,
                      color: Colors.white,
                      size: 40,
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Header Titles
                  const Text(
                    'AssignmentHub',
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.w800,
                      color: ClayColors.textDark,
                      letterSpacing: -0.5,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                    decoration: BoxDecoration(
                      color: ClayColors.surfaceInset,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: ClayColors.borderLight),
                    ),
                    child: const Text(
                      'STUDENT & ADMIN ACCESS',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: ClayColors.primary,
                        letterSpacing: 1.2,
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'Sign in instantly with your Google account. Zero passwords, zero waiting.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 14,
                      color: ClayColors.textMuted,
                      height: 1.4,
                    ),
                  ),
                  const SizedBox(height: 32),

                  // Main Clay Form Card
                  ClayCard(
                    padding: const EdgeInsets.all(28),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        if (_localError != null) ...[
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: ClayColors.statusDangerBg,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: ClayColors.statusDangerBorder),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.error_outline, size: 20, color: ClayColors.statusDangerText),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: Text(
                                    _localError!,
                                    style: const TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w500,
                                      color: ClayColors.statusDangerText,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 20),
                        ],

                        // 1-Click Continue with Google Button
                        Material(
                          color: Colors.transparent,
                          child: InkWell(
                            onTap: isLoading ? null : _handleGoogleSignIn,
                            borderRadius: BorderRadius.circular(16),
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(color: const Color(0xFFE2DCFF), width: 1.5),
                                boxShadow: const [
                                  BoxShadow(
                                    color: Color(0x10000000),
                                    offset: Offset(0, 4),
                                    blurRadius: 12,
                                  ),
                                ],
                              ),
                              child: isLoading
                                  ? const Center(
                                      child: SizedBox(
                                        width: 22,
                                        height: 22,
                                        child: CircularProgressIndicator(
                                          strokeWidth: 2.5,
                                          color: ClayColors.primary,
                                        ),
                                      ),
                                    )
                                  : Row(
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      children: [
                                        // Google colored G icon
                                        Container(
                                          width: 24,
                                          height: 24,
                                          decoration: const BoxDecoration(
                                            shape: BoxShape.circle,
                                            color: Colors.white,
                                          ),
                                          child: Image.network(
                                            'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png',
                                            errorBuilder: (context, error, stackTrace) => const Icon(
                                              Icons.g_mobiledata,
                                              size: 26,
                                              color: Color(0xFF4285F4),
                                            ),
                                          ),
                                        ),
                                        const SizedBox(width: 12),
                                        const Text(
                                          'Continue with Google',
                                          style: TextStyle(
                                            fontSize: 16,
                                            fontWeight: FontWeight.w700,
                                            color: Color(0xFF25233A),
                                            letterSpacing: -0.2,
                                          ),
                                        ),
                                      ],
                                    ),
                            ),
                          ),
                        ),

                        const SizedBox(height: 24),

                        // Security Perks
                        Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFAF8FF),
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: const Color(0xFFE2DCFF)),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: const [
                              _PerkItem(text: '1-Click instant authentication'),
                              SizedBox(height: 8),
                              _PerkItem(text: 'No passwords or OTP codes required'),
                              SizedBox(height: 8),
                              _PerkItem(text: '100% Secure & encrypted connection'),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 32),
                  // Security footer note
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: const [
                      Icon(Icons.shield_outlined, size: 14, color: ClayColors.textSubtle),
                      SizedBox(width: 6),
                      Text(
                        'AssignmentHub • Secure Mobile Portal',
                        style: TextStyle(
                          fontSize: 12,
                          color: ClayColors.textSubtle,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _PerkItem extends StatelessWidget {
  final String text;

  const _PerkItem({required this.text});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        const Icon(Icons.check_circle_rounded, size: 16, color: Color(0xFF55C595)),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            text,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: Color(0xFF25233A),
            ),
          ),
        ),
      ],
    );
  }
}
