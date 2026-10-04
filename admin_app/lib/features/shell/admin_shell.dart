import 'package:flutter/material.dart';
import '../../core/auth/auth_provider.dart';
import '../../core/theme/clay_colors.dart';
import '../dashboard/dashboard_screen.dart';
import '../inquiries/inquiry_list_screen.dart';
import '../requests/request_list_screen.dart';
import '../settings/settings_screen.dart';
import '../students/student_list_screen.dart';

class AdminShell extends StatefulWidget {
  final AuthProvider authProvider;

  const AdminShell({super.key, required this.authProvider});

  @override
  State<AdminShell> createState() => _AdminShellState();
}

class _AdminShellState extends State<AdminShell> {
  int _currentIndex = 0;
  final Set<int> _activatedTabs = {0};

  void _onNavigateToTab(int index) {
    if (index >= 0 && index < 5) {
      setState(() {
        _currentIndex = index;
        _activatedTabs.add(index);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final List<Widget> screens = [
      DashboardScreen(
        authProvider: widget.authProvider,
        onNavigateToTab: _onNavigateToTab,
      ),
      _activatedTabs.contains(1) ? const RequestListScreen() : const SizedBox.shrink(),
      _activatedTabs.contains(2) ? const InquiryListScreen() : const SizedBox.shrink(),
      _activatedTabs.contains(3) ? const StudentListScreen() : const SizedBox.shrink(),
      _activatedTabs.contains(4) ? SettingsScreen(authProvider: widget.authProvider) : const SizedBox.shrink(),
    ];

    return Scaffold(
      backgroundColor: ClayColors.background,
      body: IndexedStack(
        index: _currentIndex,
        children: screens,
      ),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          boxShadow: [
            BoxShadow(
              color: Color(0x104D41DF),
              offset: Offset(0, -6),
              blurRadius: 18,
            ),
          ],
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildNavItem(0, Icons.dashboard_outlined, Icons.dashboard_rounded, 'Home'),
                _buildNavItem(1, Icons.assignment_outlined, Icons.assignment_rounded, 'Requests'),
                _buildNavItem(2, Icons.forum_outlined, Icons.forum_rounded, 'Inquiries'),
                _buildNavItem(3, Icons.people_outline, Icons.people_rounded, 'Students'),
                _buildNavItem(4, Icons.settings_outlined, Icons.settings_rounded, 'Settings'),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(int index, IconData unselectedIcon, IconData selectedIcon, String label) {
    final isSelected = _currentIndex == index;

    return InkWell(
      onTap: () {
        setState(() {
          _currentIndex = index;
          _activatedTabs.add(index);
        });
      },
      borderRadius: BorderRadius.circular(16),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? ClayColors.primary.withValues(alpha: 0.12) : Colors.transparent,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              isSelected ? selectedIcon : unselectedIcon,
              size: 22,
              color: isSelected ? ClayColors.primary : ClayColors.textSubtle,
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                color: isSelected ? ClayColors.primary : ClayColors.textSubtle,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
