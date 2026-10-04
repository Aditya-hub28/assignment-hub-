import 'package:flutter/material.dart';
import '../../core/auth/auth_provider.dart';
import '../../core/theme/clay_colors.dart';
import '../../core/widgets/clay_button.dart';
import '../../core/widgets/clay_card.dart';
import '../../core/widgets/clay_text_field.dart';
import 'forgot_password_screen.dart';

class LoginScreen extends StatefulWidget {
  final AuthProvider authProvider;

  const LoginScreen({super.key, required this.authProvider});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  bool _obscurePassword = true;
  String? _localError;

  @override
  void dispose() {
    _emailController.dispose;
    _passwordController.dispose;
    super.dispose();
  }

  Future<void> _handleLogin() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text;

    if (email.isEmpty) {
      setState(() => _localError = 'Please enter your email address.');
      return;
    }
    if (!RegExp(r'^[^@]+@[^@]+\.[^@]+').hasMatch(email)) {
      setState(() => _localError = 'Please enter a valid email address.');
      return;
    }
    if (password.isEmpty) {
      setState(() => _localError = 'Please enter your password.');
      return;
    }

    setState(() => _localError = null);

    final success = await widget.authProvider.login(email, password);
    if (!success && mounted) {
      setState(() {
        _localError = widget.authProvider.errorMessage ?? 'Invalid email or password.';
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
                    width: 72,
                    height: 72,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [ClayColors.primaryGradientStart, ClayColors.primaryGradientEnd],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(22),
                      boxShadow: const [
                        BoxShadow(
                          color: Color(0x354D41DF),
                          offset: Offset(0, 10),
                          blurRadius: 20,
                        ),
                      ],
                    ),
                    child: const Icon(
                      Icons.shield_outlined,
                      color: Colors.white,
                      size: 38,
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Header Titles
                  const Text(
                    'AssignmentHub',
                    style: TextStyle(
                      fontSize: 26,
                      fontWeight: FontWeight.w800,
                      color: ClayColors.textDark,
                      letterSpacing: -0.5,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: ClayColors.surfaceInset,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: ClayColors.borderLight),
                    ),
                    child: const Text(
                      'ADMIN PORTAL',
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
                    'Enter your administrator credentials to manage requests and students',
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

                        // Email Field
                        ClayTextField(
                          controller: _emailController,
                          label: 'Admin Email',
                          hintText: 'admin@assignmenthub.com',
                          keyboardType: TextInputType.emailAddress,
                          prefixIcon: const Icon(Icons.alternate_email, size: 20, color: ClayColors.textSubtle),
                          enabled: !isLoading,
                        ),
                        const SizedBox(height: 18),

                        // Password Field
                        ClayTextField(
                          controller: _passwordController,
                          label: 'Password',
                          hintText: '••••••••••••',
                          obscureText: _obscurePassword,
                          textInputAction: TextInputAction.done,
                          prefixIcon: const Icon(Icons.lock_outline, size: 20, color: ClayColors.textSubtle),
                          suffixIcon: IconButton(
                            icon: Icon(
                              _obscurePassword ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                              size: 20,
                              color: ClayColors.textSubtle,
                            ),
                            onPressed: () {
                              setState(() => _obscurePassword = !_obscurePassword);
                            },
                          ),
                          enabled: !isLoading,
                          onSubmitted: (_) => _handleLogin(),
                        ),
                        const SizedBox(height: 12),

                        // Forgot Password Link
                        Align(
                          alignment: Alignment.centerRight,
                          child: GestureDetector(
                            onTap: isLoading
                                ? null
                                : () {
                                    Navigator.of(context).push(
                                      MaterialPageRoute(
                                        builder: (_) => ForgotPasswordScreen(
                                          authProvider: widget.authProvider,
                                        ),
                                      ),
                                    );
                                  },
                            child: const Text(
                              'Forgot Password?',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: ClayColors.primary,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 24),

                        // Submit Button
                        ClayButton(
                          text: 'Sign In to Admin Portal',
                          isLoading: isLoading,
                          icon: const Icon(Icons.login, size: 18, color: Colors.white),
                          onPressed: _handleLogin,
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 32),
                  // Security footer note
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: const [
                      Icon(Icons.lock_clock_outlined, size: 14, color: ClayColors.textSubtle),
                      SizedBox(width: 6),
                      Text(
                        'Authorized Personnel Only • AssignmentHub Security',
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
