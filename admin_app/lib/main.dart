import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'core/auth/auth_provider.dart';
import 'core/theme/clay_colors.dart';
import 'core/theme/clay_theme.dart';
import 'features/auth/login_screen.dart';
import 'features/shell/admin_shell.dart';

void main() async {
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

  // Initialize Supabase SDK for 1-Click Google OAuth
  await Supabase.initialize(
    url: 'https://zgiinylfcemvemgyvkbv.supabase.co',
    // ignore: deprecated_member_use
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnaWlueWxmY2VtdmVtZ3l2a2J2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI5MTE1MTMsImV4cCI6MjEwODQ4NzUxM30.NzRGoXj0_6tne97lfcpoE5tpTbIFO5WyBoUz6PImDvI',
  );

  final authProvider = AuthProvider();
  await authProvider.initialize();

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
              body: Center(
                child: CircularProgressIndicator(
                  color: ClayColors.primary,
                ),
              ),
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
