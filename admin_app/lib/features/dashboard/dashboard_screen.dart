import 'dart:async';
import 'package:flutter/material.dart';
import '../../core/auth/auth_provider.dart';
import '../../core/theme/clay_colors.dart';
import '../../core/theme/clay_decorations.dart';
import '../../core/widgets/clay_card.dart';
import '../../core/widgets/empty_state.dart';
import '../../core/widgets/status_pill.dart';
import '../../data/models/admin_stats.dart';
import '../../data/models/service_request.dart';
import '../../data/repositories/dashboard_repository.dart';
import '../../data/repositories/request_repository.dart';
import '../requests/request_details_screen.dart';

class DashboardScreen extends StatefulWidget {
  final AuthProvider authProvider;
  final Function(int)? onNavigateToTab;

  const DashboardScreen({
    super.key,
    required this.authProvider,
    this.onNavigateToTab,
  });

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final DashboardRepository _dashboardRepo = DashboardRepository();
  final RequestRepository _requestRepo = RequestRepository();
  Timer? _refreshTimer;

  String? _error;
  AdminStats _stats = DashboardRepository.cachedStats;
  List<ServiceRequest> _recentRequests = RequestRepository.cachedRecentRequests;

  @override
  void initState() {
    super.initState();
    _loadData();
    _refreshTimer = Timer.periodic(const Duration(seconds: 8), (_) {
      _pollData();
    });
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    super.dispose();
  }

  Future<void> _pollData() async {
    if (!mounted) return;
    try {
      final statsFuture = _dashboardRepo.fetchStats();
      final requestsFuture = _requestRepo.fetchRequests(page: 1, limit: 5);

      final results = await Future.wait([statsFuture, requestsFuture]);
      if (mounted) {
        setState(() {
          _stats = results[0] as AdminStats;
          _recentRequests = (results[1] as RequestListResponse).requests;
        });
      }
    } catch (_) {
      // Silent background poll
    }
  }

  Future<void> _loadData() async {
    try {
      final statsFuture = _dashboardRepo.fetchStats();
      final requestsFuture = _requestRepo.fetchRequests(page: 1, limit: 5);

      final results = await Future.wait([statsFuture, requestsFuture]);
      if (mounted) {
        setState(() {
          _stats = results[0] as AdminStats;
          _recentRequests = (results[1] as RequestListResponse).requests;
          _error = null;
        });
      }
    } catch (e) {
      if (mounted && _recentRequests.isEmpty && _stats.totalRequests == 0) {
        setState(() {
          _error = e.toString();
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    const adminName = 'ADMIN';

    return Scaffold(
      backgroundColor: ClayColors.background,
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _loadData,
          color: ClayColors.primary,
          child: _error != null && _recentRequests.isEmpty && _stats.totalRequests == 0
              ? EmptyState(
                  icon: Icons.error_outline,
                  title: 'Failed to Load Dashboard',
                  description: _error!,
                  actionLabel: 'Retry',
                  onAction: _loadData,
                )
              : SingleChildScrollView(
                      physics: const AlwaysScrollableScrollPhysics(),
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Header Section
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                          decoration: BoxDecoration(
                                            color: ClayColors.primary.withValues(alpha: 0.1),
                                            borderRadius: BorderRadius.circular(12),
                                          ),
                                          child: const Text(
                                            'ADMIN DESK',
                                            style: TextStyle(
                                              fontSize: 10,
                                              fontWeight: FontWeight.w700,
                                              color: ClayColors.primary,
                                              letterSpacing: 0.8,
                                            ),
                                          ),
                                        ),
                                        const SizedBox(width: 8),
                                        Container(
                                          width: 8,
                                          height: 8,
                                          decoration: const BoxDecoration(
                                            color: Color(0xFF10B981),
                                            shape: BoxShape.circle,
                                          ),
                                        ),
                                        const SizedBox(width: 4),
                                        const Text(
                                          'Live',
                                          style: TextStyle(
                                            fontSize: 12,
                                            fontWeight: FontWeight.w600,
                                            color: Color(0xFF10B981),
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 6),
                                    Text(
                                      adminName,
                                      style: const TextStyle(
                                        fontSize: 22,
                                        fontWeight: FontWeight.w800,
                                        color: ClayColors.textDark,
                                        letterSpacing: -0.5,
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ],
                                ),
                              ),
                              IconButton(
                                icon: const Icon(Icons.refresh_rounded, color: ClayColors.textMuted),
                                onPressed: _loadData,
                                tooltip: 'Refresh Metrics',
                              ),
                            ],
                          ),
                          const SizedBox(height: 20),

                          // Urgent notice banner (if any)
                          if (_stats.urgentRequests > 0) ...[
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                              decoration: BoxDecoration(
                                color: ClayColors.statusDangerBg,
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(color: ClayColors.statusDangerBorder),
                              ),
                              child: Row(
                                children: [
                                  const Icon(Icons.access_time_filled, color: ClayColors.statusDangerText, size: 20),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Text(
                                      '${_stats.urgentRequests} urgent request${_stats.urgentRequests > 1 ? 's' : ''} with deadlines within 48 hours!',
                                      style: const TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w600,
                                        color: ClayColors.statusDangerText,
                                      ),
                                    ),
                                  ),
                                  TextButton(
                                    onPressed: () => widget.onNavigateToTab?.call(1),
                                    style: TextButton.styleFrom(
                                      padding: EdgeInsets.zero,
                                      minimumSize: const Size(50, 30),
                                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                    ),
                                    child: const Text(
                                      'Review',
                                      style: TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w700,
                                        color: ClayColors.statusDangerText,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 16),
                          ],

                          // Primary 4 Metrics Grid
                          const Text(
                            'Request Overview',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                              color: ClayColors.textDark,
                            ),
                          ),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              Expanded(
                                child: _buildKpiCard(
                                  title: 'Total Requests',
                                  value: _stats.totalRequests.toString(),
                                  icon: Icons.assignment_outlined,
                                  accentColor: ClayColors.primary,
                                  onTap: () => widget.onNavigateToTab?.call(1),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: _buildKpiCard(
                                  title: 'Pending Review',
                                  value: _stats.pendingReview.toString(),
                                  icon: Icons.hourglass_top_rounded,
                                  accentColor: ClayColors.statusPendingText,
                                  bgColor: ClayColors.statusPendingBg,
                                  onTap: () => widget.onNavigateToTab?.call(1),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              Expanded(
                                child: _buildKpiCard(
                                  title: 'In Progress',
                                  value: _stats.inProgress.toString(),
                                  icon: Icons.work_outline_rounded,
                                  accentColor: ClayColors.statusProgressText,
                                  bgColor: ClayColors.statusProgressBg,
                                  onTap: () => widget.onNavigateToTab?.call(1),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: _buildKpiCard(
                                  title: 'Delivered',
                                  value: _stats.completedDelivered.toString(),
                                  icon: Icons.task_alt_rounded,
                                  accentColor: ClayColors.statusSuccessText,
                                  bgColor: ClayColors.statusSuccessBg,
                                  onTap: () => widget.onNavigateToTab?.call(1),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 20),

                          // Operational Auxiliary Cards (Inquiries & Students)
                          const Text(
                            'Platform Activity',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                              color: ClayColors.textDark,
                            ),
                          ),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              Expanded(
                                child: _buildMiniStatCard(
                                  title: 'Active Inquiries',
                                  value: _stats.activeInquiries.toString(),
                                  icon: Icons.chat_bubble_outline_rounded,
                                  badgeColor: ClayColors.primary,
                                  onTap: () => widget.onNavigateToTab?.call(2),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: _buildMiniStatCard(
                                  title: 'Total Students',
                                  value: _stats.totalStudents.toString(),
                                  icon: Icons.school_outlined,
                                  badgeColor: const Color(0xFF0284C7),
                                  onTap: () => widget.onNavigateToTab?.call(3),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 24),

                          // Recent Service Requests
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text(
                                'Recent Requests',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w700,
                                  color: ClayColors.textDark,
                                ),
                              ),
                              TextButton(
                                onPressed: () => widget.onNavigateToTab?.call(1),
                                child: const Text(
                                  'View All',
                                  style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                    color: ClayColors.primary,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),

                          if (_recentRequests.isEmpty)
                            ClayCard(
                              padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 16),
                              child: Center(
                                child: Column(
                                  children: const [
                                    Icon(Icons.inbox_outlined, size: 36, color: ClayColors.textSubtle),
                                    SizedBox(height: 8),
                                    Text(
                                      'No requests received yet',
                                      style: TextStyle(
                                        fontSize: 14,
                                        fontWeight: FontWeight.w500,
                                        color: ClayColors.textMuted,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            )
                          else
                            ListView.separated(
                              shrinkWrap: true,
                              physics: const NeverScrollableScrollPhysics(),
                              itemCount: _recentRequests.length,
                              separatorBuilder: (_, index) => const SizedBox(height: 10),
                              itemBuilder: (context, index) {
                                final req = _recentRequests[index];
                                return _buildRequestTile(req);
                              },
                            ),
                          const SizedBox(height: 24),
                        ],
                      ),
                    ),
        ),
      ),
    );
  }

  Widget _buildKpiCard({
    required String title,
    required String value,
    required IconData icon,
    required Color accentColor,
    Color? bgColor,
    VoidCallback? onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: ClayDecorations.card(
          radius: 20,
          backgroundColor: bgColor ?? Colors.white,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  width: 38,
                  height: 38,
                  decoration: BoxDecoration(
                    color: accentColor.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(icon, color: accentColor, size: 20),
                ),
                const Icon(Icons.arrow_forward_ios, size: 12, color: ClayColors.textSubtle),
              ],
            ),
            const SizedBox(height: 14),
            Text(
              value,
              style: const TextStyle(
                fontSize: 26,
                fontWeight: FontWeight.w800,
                color: ClayColors.textDark,
                letterSpacing: -0.5,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              title,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w500,
                color: ClayColors.textMuted,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMiniStatCard({
    required String title,
    required String value,
    required IconData icon,
    required Color badgeColor,
    VoidCallback? onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: ClayDecorations.compactCard(radius: 18),
        child: Row(
          children: [
            Container(
              width: 42,
              height: 42,
              decoration: BoxDecoration(
                color: badgeColor.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Icon(icon, color: badgeColor, size: 22),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    value,
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w800,
                      color: ClayColors.textDark,
                    ),
                  ),
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: ClayColors.textMuted,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRequestTile(ServiceRequest req) {
    return ClayCard(
      padding: const EdgeInsets.all(16),
      radius: 18,
      onTap: () {
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) => RequestDetailsScreen(requestId: req.id),
          ),
        ).then((_) => _loadData());
      },
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                req.id,
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: ClayColors.primary,
                  letterSpacing: 0.3,
                ),
              ),
              StatusPill(status: req.status, label: req.statusLabel),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            req.title,
            style: const TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w700,
              color: ClayColors.textDark,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 4),
          Row(
            children: [
              const Icon(Icons.person_outline, size: 14, color: ClayColors.textSubtle),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  req.userName,
                  style: const TextStyle(
                    fontSize: 13,
                    color: ClayColors.textMuted,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              if (req.deadline.isNotEmpty) ...[
                const SizedBox(width: 8),
                const Icon(Icons.calendar_today_outlined, size: 12, color: ClayColors.textSubtle),
                const SizedBox(width: 4),
                Text(
                  req.deadline,
                  style: const TextStyle(
                    fontSize: 12,
                    color: ClayColors.textSubtle,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }
}
