import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/theme/clay_colors.dart';
import '../../core/theme/clay_decorations.dart';
import '../../core/widgets/clay_card.dart';
import '../../core/widgets/empty_state.dart';
import '../../core/widgets/loading_indicator.dart';
import '../../core/widgets/status_pill.dart';
import '../../data/models/student_user.dart';
import '../../data/repositories/student_repository.dart';
import '../requests/request_details_screen.dart';

class StudentDetailsScreen extends StatefulWidget {
  final String studentId;

  const StudentDetailsScreen({super.key, required this.studentId});

  @override
  State<StudentDetailsScreen> createState() => _StudentDetailsScreenState();
}

class _StudentDetailsScreenState extends State<StudentDetailsScreen> {
  final StudentRepository _studentRepo = StudentRepository();
  bool _isLoading = true;
  String? _error;
  StudentUser? _student;

  @override
  void initState() {
    super.initState();
    _loadStudent();
  }

  Future<void> _loadStudent() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final user = await _studentRepo.fetchStudentById(widget.studentId);
      if (mounted) {
        setState(() {
          _student = user;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e.toString();
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _launchEmail(String email) async {
    final uri = Uri.parse('mailto:$email');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  Future<void> _launchPhone(String phone) async {
    final uri = Uri.parse('tel:$phone');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ClayColors.background,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, size: 20),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text('Student Details'),
      ),
      body: SafeArea(
        child: _isLoading
            ? const LoadingIndicator(message: 'Loading student record...')
            : _error != null
                ? EmptyState(
                    icon: Icons.error_outline,
                    title: 'Failed to Load Profile',
                    description: _error!,
                    actionLabel: 'Retry',
                    onAction: _loadStudent,
                  )
                : _student == null
                    ? const EmptyState(
                        icon: Icons.person_off_outlined,
                        title: 'Student Not Found',
                        description: 'The requested student record could not be found.',
                      )
                    : SingleChildScrollView(
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            // 1. Profile Header Clay Card
                            ClayCard(
                              padding: const EdgeInsets.all(22),
                              child: Column(
                                children: [
                                  // Avatar
                                  Container(
                                    width: 76,
                                    height: 76,
                                    decoration: BoxDecoration(
                                      gradient: const LinearGradient(
                                        colors: [ClayColors.primaryGradientStart, ClayColors.primaryGradientEnd],
                                        begin: Alignment.topLeft,
                                        end: Alignment.bottomRight,
                                      ),
                                      shape: BoxShape.circle,
                                      boxShadow: const [
                                        BoxShadow(
                                          color: Color(0x304D41DF),
                                          offset: Offset(0, 8),
                                          blurRadius: 18,
                                        ),
                                      ],
                                    ),
                                    child: Center(
                                      child: Text(
                                        _student!.initials,
                                        style: const TextStyle(
                                          fontSize: 26,
                                          fontWeight: FontWeight.w800,
                                          color: Colors.white,
                                        ),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(height: 16),

                                  // Name
                                  Text(
                                    _student!.fullName,
                                    style: const TextStyle(
                                      fontSize: 20,
                                      fontWeight: FontWeight.w800,
                                      color: ClayColors.textDark,
                                    ),
                                    textAlign: TextAlign.center,
                                  ),
                                  const SizedBox(height: 6),

                                  // Role Pill
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: ClayColors.primary.withValues(alpha: 0.1),
                                      borderRadius: BorderRadius.circular(20),
                                      border: Border.all(color: ClayColors.primary.withValues(alpha: 0.2)),
                                    ),
                                    child: const Text(
                                      'VERIFIED STUDENT',
                                      style: TextStyle(
                                        fontSize: 10,
                                        fontWeight: FontWeight.w700,
                                        color: ClayColors.primary,
                                        letterSpacing: 0.8,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(height: 18),

                                  // Contact Pills
                                  GestureDetector(
                                    onTap: () => _launchEmail(_student!.email),
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                                      decoration: ClayDecorations.insetWell(radius: 12),
                                      child: Row(
                                        children: [
                                          const Icon(Icons.email_outlined, size: 18, color: ClayColors.primary),
                                          const SizedBox(width: 10),
                                          Expanded(
                                            child: Text(
                                              _student!.email,
                                              style: const TextStyle(fontSize: 13, color: ClayColors.textDark, fontWeight: FontWeight.w600),
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                          ),
                                          const Icon(Icons.open_in_new, size: 14, color: ClayColors.textSubtle),
                                        ],
                                      ),
                                    ),
                                  ),
                                  if (_student!.mobile != null && _student!.mobile!.isNotEmpty) ...[
                                    const SizedBox(height: 8),
                                    GestureDetector(
                                      onTap: () => _launchPhone(_student!.mobile!),
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                                        decoration: ClayDecorations.insetWell(radius: 12),
                                        child: Row(
                                          children: [
                                            const Icon(Icons.phone_outlined, size: 18, color: ClayColors.primary),
                                            const SizedBox(width: 10),
                                            Expanded(
                                              child: Text(
                                                _student!.mobile!,
                                                style: const TextStyle(fontSize: 13, color: ClayColors.textDark, fontWeight: FontWeight.w600),
                                              ),
                                            ),
                                            const Icon(Icons.call_outlined, size: 14, color: ClayColors.textSubtle),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                            ),
                            const SizedBox(height: 16),

                            // 2. Academic Information 6-Cell Grid Card
                            ClayCard(
                              padding: const EdgeInsets.all(20),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: const [
                                      Icon(Icons.school_outlined, size: 18, color: ClayColors.primary),
                                      SizedBox(width: 8),
                                      Text(
                                        'Academic Profile',
                                        style: TextStyle(
                                          fontSize: 15,
                                          fontWeight: FontWeight.w700,
                                          color: ClayColors.textDark,
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 16),

                                  // College Name full-width cell
                                  _buildAcademicCell(
                                    'College / University',
                                    _student!.college?.name ?? _student!.academicProfile?.collegeName ?? 'Not Configured',
                                    isFullWidth: true,
                                  ),
                                  const SizedBox(height: 12),

                                  // 4-cell 2x2 grid
                                  Row(
                                    children: [
                                      Expanded(
                                        child: _buildAcademicCell(
                                          'Branch',
                                          _student!.academicProfile?.branch ?? '—',
                                        ),
                                      ),
                                      const SizedBox(width: 10),
                                      Expanded(
                                        child: _buildAcademicCell(
                                          'Year',
                                          _student!.academicProfile?.year ?? '—',
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 10),
                                  Row(
                                    children: [
                                      Expanded(
                                        child: _buildAcademicCell(
                                          'Semester',
                                          _student!.academicProfile?.semester ?? '—',
                                        ),
                                      ),
                                      const SizedBox(width: 10),
                                      Expanded(
                                        child: _buildAcademicCell(
                                          'Division',
                                          _student!.academicProfile?.division ?? '—',
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 10),
                                  _buildAcademicCell(
                                    'Roll Number',
                                    _student!.academicProfile?.rollNo ?? '—',
                                    isFullWidth: true,
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 16),

                            // 3. Platform Activity Summary
                            Row(
                              children: [
                                Expanded(
                                  child: ClayCard(
                                    padding: const EdgeInsets.all(16),
                                    radius: 18,
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        const Text('Total Requests', style: TextStyle(fontSize: 12, color: ClayColors.textMuted)),
                                        const SizedBox(height: 6),
                                        Text(
                                          _student!.totalRequests.toString(),
                                          style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: ClayColors.textDark),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: ClayCard(
                                    padding: const EdgeInsets.all(16),
                                    radius: 18,
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        const Text('Total Inquiries', style: TextStyle(fontSize: 12, color: ClayColors.textMuted)),
                                        const SizedBox(height: 6),
                                        Text(
                                          _student!.totalInquiries.toString(),
                                          style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: ClayColors.primary),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 16),

                            // 4. Recent Requests from Student
                            if (_student!.recentRequests.isNotEmpty) ...[
                              const Text(
                                'Recent Requests by Student',
                                style: TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w700,
                                  color: ClayColors.textDark,
                                ),
                              ),
                              const SizedBox(height: 10),
                              ListView.separated(
                                shrinkWrap: true,
                                physics: const NeverScrollableScrollPhysics(),
                                itemCount: _student!.recentRequests.length,
                                separatorBuilder: (_, index) => const SizedBox(height: 8),
                                itemBuilder: (context, index) {
                                  final r = _student!.recentRequests[index];
                                  final reqId = r['id']?.toString() ?? '';
                                  final title = r['title']?.toString() ?? 'Request';
                                  final status = r['status']?.toString() ?? 'pending';
                                  final statusLabel = r['statusLabel']?.toString() ?? r['status_label']?.toString();

                                  return ClayCard(
                                    padding: const EdgeInsets.all(14),
                                    radius: 16,
                                    onTap: () {
                                      Navigator.of(context).push(
                                        MaterialPageRoute(
                                          builder: (_) => RequestDetailsScreen(requestId: reqId),
                                        ),
                                      );
                                    },
                                    child: Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                reqId,
                                                style: const TextStyle(
                                                  fontSize: 12,
                                                  fontWeight: FontWeight.w700,
                                                  color: ClayColors.primary,
                                                ),
                                              ),
                                              const SizedBox(height: 2),
                                              Text(
                                                title,
                                                style: const TextStyle(
                                                  fontSize: 14,
                                                  fontWeight: FontWeight.w600,
                                                  color: ClayColors.textDark,
                                                ),
                                                maxLines: 1,
                                                overflow: TextOverflow.ellipsis,
                                              ),
                                            ],
                                          ),
                                        ),
                                        StatusPill(status: status, label: statusLabel),
                                      ],
                                    ),
                                  );
                                },
                              ),
                              const SizedBox(height: 24),
                            ],
                          ],
                        ),
                      ),
      ),
    );
  }

  Widget _buildAcademicCell(String label, String value, {bool isFullWidth = false}) {
    return Container(
      width: isFullWidth ? double.infinity : null,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: ClayDecorations.insetWell(radius: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w500,
              color: ClayColors.textSubtle,
            ),
          ),
          const SizedBox(height: 3),
          Text(
            value,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: ClayColors.textDark,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}
