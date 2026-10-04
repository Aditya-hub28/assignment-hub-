import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'core/auth/auth_provider.dart';
import 'core/theme/clay_colors.dart';
import 'core/theme/clay_theme.dart';
import 'features/auth/login_screen.dart';
import 'features/shell/admin_shell.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();

  // Set system UI overlay style
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
      systemNavigationBarColor: Colors.white,
      systemNavigationBarIconBrightness: Brightness.dark,
    ),
  );

  final authProvider = AuthProvider();
  authProvider.initialize();

  runApp(AssignmentHubAdminApp(authProvider: authProvider));
}

class AssignmentHubAdminApp extends StatelessWidget {
  final AuthProvider authProvider;

  const AssignmentHubAdminApp({super.key, required this.authProvider});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AssignmentHub Admin',
      debugShowCheckedModeBanner: false,
      theme: ClayTheme.lightTheme,
      home: AnimatedBuilder(
        animation: authProvider,
        builder: (context, _) {
          if (!authProvider.isInitialized) {
            return const Scaffold(
              backgroundColor: ClayColors.background,
              body: SizedBox.shrink(),
            );
          }

          if (authProvider.isAuthenticated) {
            return AdminShell(authProvider: authProvider);
          }

          return LoginScreen(authProvider: authProvider);
        },
      ),
    );
  }
}
