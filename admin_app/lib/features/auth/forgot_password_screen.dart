import 'package:flutter/material.dart';
import '../../core/auth/auth_provider.dart';
import '../../core/theme/clay_colors.dart';
import '../../core/widgets/clay_button.dart';
import '../../core/widgets/clay_card.dart';
import '../../core/widgets/clay_text_field.dart';

class ForgotPasswordScreen extends StatefulWidget {
  final AuthProvider authProvider;

  const ForgotPasswordScreen({super.key, required this.authProvider});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final TextEditingController _emailController = TextEditingController();
  bool _submitted = false;
  String? _localError;

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  Future<void> _handleSubmit() async {
    final email = _emailController.text.trim();
    if (email.isEmpty) {
      setState(() => _localError = 'Please enter your administrator email.');
      return;
    }
    if (!RegExp(r'^[^@]+@[^@]+\.[^@]+').hasMatch(email)) {
      setState(() => _localError = 'Please enter a valid email address.');
      return;
    }

    setState(() => _localError = null);

    final success = await widget.authProvider.forgotPassword(email);
    if (mounted) {
      if (success) {
        setState(() => _submitted = true);
      } else {
        setState(() {
          _localError = widget.authProvider.errorMessage ?? 'Failed to send reset link.';
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isLoading = widget.authProvider.isLoading;

    return Scaffold(
      backgroundColor: ClayColors.background,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, size: 20),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text('Reset Password'),
      ),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 440),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Container(
                    width: 64,
                    height: 64,
                    decoration: BoxDecoration(
                      color: ClayColors.surfaceInset,
                      shape: BoxShape.circle,
                      border: Border.all(color: ClayColors.borderLight, width: 1.5),
                    ),
                    child: const Icon(
                      Icons.lock_reset,
                      size: 32,
                      color: ClayColors.primary,
                    ),
                  ),
                  const SizedBox(height: 20),
                  const Text(
                    'Forgot Password?',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w800,
                      color: ClayColors.textDark,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Enter your registered administrator email address. We\'ll send you instructions to reset your password.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 14,
                      color: ClayColors.textMuted,
                      height: 1.4,
                    ),
                  ),
                  const SizedBox(height: 28),

                  if (_submitted) ...[
                    ClayCard(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        children: [
                          Container(
                            width: 52,
                            height: 52,
                            decoration: BoxDecoration(
                              color: ClayColors.statusSuccessBg,
                              shape: BoxShape.circle,
                              border: Border.all(color: ClayColors.statusSuccessBorder),
                            ),
                            child: const Icon(
                              Icons.check_circle_outline,
                              color: ClayColors.statusSuccessText,
                              size: 30,
                            ),
                          ),
                          const SizedBox(height: 16),
                          const Text(
                            'Instructions Sent',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w700,
                              color: ClayColors.textDark,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'If an account exists for ${_emailController.text.trim()}, we have sent password reset instructions to your inbox.',
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                              fontSize: 14,
                              color: ClayColors.textMuted,
                              height: 1.4,
                            ),
                          ),
                          const SizedBox(height: 24),
                          ClayButton(
                            text: 'Back to Login',
                            variant: ClayButtonVariant.outline,
                            onPressed: () => Navigator.of(context).pop(),
                          ),
                        ],
                      ),
                    ),
                  ] else ...[
                    ClayCard(
                      padding: const EdgeInsets.all(24),
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
                              child: Text(
                                _localError!,
                                style: const TextStyle(
                                  fontSize: 13,
                                  color: ClayColors.statusDangerText,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ),
                            const SizedBox(height: 18),
                          ],
                          ClayTextField(
                            controller: _emailController,
                            label: 'Admin Email',
                            hintText: 'admin@assignmenthub.com',
                            keyboardType: TextInputType.emailAddress,
                            textInputAction: TextInputAction.done,
                            prefixIcon: const Icon(Icons.alternate_email, size: 20, color: ClayColors.textSubtle),
                            enabled: !isLoading,
                            onSubmitted: (_) => _handleSubmit(),
                          ),
                          const SizedBox(height: 24),
                          ClayButton(
                            text: 'Send Reset Instructions',
                            isLoading: isLoading,
                            icon: const Icon(Icons.send_rounded, size: 18, color: Colors.white),
                            onPressed: _handleSubmit,
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
