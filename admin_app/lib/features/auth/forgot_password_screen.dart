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
  final TextEditingController _otpController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  int _step = 1; // 1: Request Code, 2: Enter Code & Reset, 3: Success
  bool _obscurePassword = true;
  String? _localError;

  @override
  void dispose() {
    _emailController.dispose();
    _otpController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleRequestCode() async {
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
        setState(() {
          _step = 2;
          _localError = null;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Verification code sent to your email!'),
            backgroundColor: ClayColors.statusSuccessText,
          ),
        );
      } else {
        setState(() {
          _localError = widget.authProvider.errorMessage ?? 'Failed to send reset code.';
        });
      }
    }
  }

  Future<void> _handleResetPassword() async {
    final email = _emailController.text.trim();
    final otp = _otpController.text.trim();
    final password = _passwordController.text;

    if (email.isEmpty) {
      setState(() => _localError = 'Please enter your registered email.');
      return;
    }
    if (otp.isEmpty || otp.length != 6) {
      setState(() => _localError = 'Please enter the 6-digit code received on your email.');
      return;
    }
    if (password.length < 6 ||
        !RegExp(r'[A-Z]').hasMatch(password) ||
        !RegExp(r'[a-z]').hasMatch(password) ||
        !RegExp(r'\d').hasMatch(password)) {
      setState(() => _localError =
          'Password must be at least 6 characters with uppercase, lowercase, and a number.');
      return;
    }

    setState(() => _localError = null);

    final success = await widget.authProvider.resetPassword(
      email: email,
      otp: otp,
      newPassword: password,
    );

    if (mounted) {
      if (success) {
        setState(() => _step = 3);
      } else {
        setState(() {
          _localError = widget.authProvider.errorMessage ?? 'Failed to reset password. Check your OTP.';
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
                  Text(
                    _step == 1
                        ? 'Forgot Password?'
                        : (_step == 2 ? 'Enter Reset Code' : 'Password Updated!'),
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w800,
                      color: ClayColors.textDark,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _step == 1
                        ? 'Enter your registered email address. We will send you a 6-digit verification code to reset your password.'
                        : (_step == 2
                            ? 'Enter the 6-digit code sent to your email along with your new password.'
                            : 'Your password has been changed successfully. You can now log in with your new credentials.'),
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 14,
                      color: ClayColors.textMuted,
                      height: 1.4,
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Step Switcher Tabs (when not in success screen)
                  if (_step != 3) ...[
                    Container(
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: ClayColors.surfaceInset,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: ClayColors.borderLight),
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: GestureDetector(
                              onTap: () => setState(() {
                                _step = 1;
                                _localError = null;
                              }),
                              child: Container(
                                padding: const EdgeInsets.symmetric(vertical: 8),
                                decoration: BoxDecoration(
                                  color: _step == 1 ? Colors.white : Colors.transparent,
                                  borderRadius: BorderRadius.circular(12),
                                  boxShadow: _step == 1
                                      ? [
                                          BoxShadow(
                                            color: const Color(0x0A000000),
                                            blurRadius: 4,
                                            offset: const Offset(0, 2),
                                          )
                                        ]
                                      : null,
                                ),
                                child: Text(
                                  '1. Get Code',
                                  textAlign: TextAlign.center,
                                  style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w700,
                                    color: _step == 1 ? ClayColors.primary : ClayColors.textMuted,
                                  ),
                                ),
                              ),
                            ),
                          ),
                          Expanded(
                            child: GestureDetector(
                              onTap: () => setState(() {
                                _step = 2;
                                _localError = null;
                              }),
                              child: Container(
                                padding: const EdgeInsets.symmetric(vertical: 8),
                                decoration: BoxDecoration(
                                  color: _step == 2 ? Colors.white : Colors.transparent,
                                  borderRadius: BorderRadius.circular(12),
                                  boxShadow: _step == 2
                                      ? [
                                          BoxShadow(
                                            color: const Color(0x0A000000),
                                            blurRadius: 4,
                                            offset: const Offset(0, 2),
                                          )
                                        ]
                                      : null,
                                ),
                                child: Text(
                                  '2. Enter Code',
                                  textAlign: TextAlign.center,
                                  style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w700,
                                    color: _step == 2 ? ClayColors.primary : ClayColors.textMuted,
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),
                  ],

                  // STEP 3: Success Card
                  if (_step == 3) ...[
                    ClayCard(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        children: [
                          Container(
                            width: 56,
                            height: 56,
                            decoration: BoxDecoration(
                              color: ClayColors.statusSuccessBg,
                              shape: BoxShape.circle,
                              border: Border.all(color: ClayColors.statusSuccessBorder),
                            ),
                            child: const Icon(
                              Icons.check_circle_outline,
                              color: ClayColors.statusSuccessText,
                              size: 32,
                            ),
                          ),
                          const SizedBox(height: 16),
                          const Text(
                            'Password Reset Complete!',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w700,
                              color: ClayColors.textDark,
                            ),
                          ),
                          const SizedBox(height: 8),
                          const Text(
                            'You can now sign in using your newly updated password.',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 14,
                              color: ClayColors.textMuted,
                              height: 1.4,
                            ),
                          ),
                          const SizedBox(height: 24),
                          ClayButton(
                            text: 'Back to Login',
                            icon: const Icon(Icons.login, size: 18, color: Colors.white),
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

                          // STEP 1 Form
                          if (_step == 1) ...[
                            ClayTextField(
                              controller: _emailController,
                              label: 'Registered Email',
                              hintText: 'admin@assignmenthub.com',
                              keyboardType: TextInputType.emailAddress,
                              textInputAction: TextInputAction.done,
                              prefixIcon: const Icon(Icons.alternate_email, size: 20, color: ClayColors.textSubtle),
                              enabled: !isLoading,
                              onSubmitted: (_) => _handleRequestCode(),
                            ),
                            const SizedBox(height: 24),
                            ClayButton(
                              text: 'Send 6-Digit Code',
                              isLoading: isLoading,
                              icon: const Icon(Icons.send_rounded, size: 18, color: Colors.white),
                              onPressed: _handleRequestCode,
                            ),
                            const SizedBox(height: 16),
                            Center(
                              child: TextButton.icon(
                                onPressed: () => setState(() {
                                  _step = 2;
                                  _localError = null;
                                }),
                                icon: const Icon(Icons.arrow_forward, size: 16, color: ClayColors.primary),
                                label: const Text(
                                  'Already have a 6-digit code? Enter it here',
                                  style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                    color: ClayColors.primary,
                                  ),
                                ),
                              ),
                            ),
                          ],

                          // STEP 2 Form
                          if (_step == 2) ...[
                            ClayTextField(
                              controller: _emailController,
                              label: 'Registered Email',
                              hintText: 'admin@assignmenthub.com',
                              keyboardType: TextInputType.emailAddress,
                              textInputAction: TextInputAction.next,
                              prefixIcon: const Icon(Icons.alternate_email, size: 20, color: ClayColors.textSubtle),
                              enabled: !isLoading,
                            ),
                            const SizedBox(height: 16),
                            ClayTextField(
                              controller: _otpController,
                              label: '6-Digit Reset Code',
                              hintText: '123456',
                              keyboardType: TextInputType.number,
                              textInputAction: TextInputAction.next,
                              prefixIcon: const Icon(Icons.pin, size: 20, color: ClayColors.textSubtle),
                              enabled: !isLoading,
                            ),
                            const SizedBox(height: 16),
                            ClayTextField(
                              controller: _passwordController,
                              label: 'New Password',
                              hintText: 'Min 6 chars (Aa1...)',
                              obscureText: _obscurePassword,
                              textInputAction: TextInputAction.done,
                              prefixIcon: const Icon(Icons.lock_outline, size: 20, color: ClayColors.textSubtle),
                              suffixIcon: IconButton(
                                icon: Icon(
                                  _obscurePassword ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                                  size: 20,
                                  color: ClayColors.textSubtle,
                                ),
                                onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                              ),
                              enabled: !isLoading,
                              onSubmitted: (_) => _handleResetPassword(),
                            ),
                            const SizedBox(height: 24),
                            ClayButton(
                              text: 'Reset Password & Log In',
                              isLoading: isLoading,
                              icon: const Icon(Icons.check_circle_outline, size: 18, color: Colors.white),
                              onPressed: _handleResetPassword,
                            ),
                            const SizedBox(height: 16),
                            Center(
                              child: TextButton.icon(
                                onPressed: () => setState(() {
                                  _step = 1;
                                  _localError = null;
                                }),
                                icon: const Icon(Icons.arrow_back, size: 16, color: ClayColors.textMuted),
                                label: const Text(
                                  'Didn\'t receive a code? Request again',
                                  style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                    color: ClayColors.textMuted,
                                  ),
                                ),
                              ),
                            ),
                          ],
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
