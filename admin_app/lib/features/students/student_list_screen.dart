import 'dart:async';
import 'package:flutter/material.dart';
import '../../core/theme/clay_colors.dart';
import '../../core/widgets/clay_card.dart';
import '../../core/widgets/clay_text_field.dart';
import '../../core/widgets/empty_state.dart';
import '../../core/widgets/loading_indicator.dart';
import '../../data/models/student_user.dart';
import '../../data/repositories/student_repository.dart';
import 'student_details_screen.dart';

class StudentListScreen extends StatefulWidget {
  const StudentListScreen({super.key});

  @override
  State<StudentListScreen> createState() => _StudentListScreenState();
}

class _StudentListScreenState extends State<StudentListScreen> {
  final StudentRepository _studentRepo = StudentRepository();
  final TextEditingController _searchController = TextEditingController();
  Timer? _debounce;

  bool _isLoading = true;
  String? _error;
  List<StudentUser> _students = [];
  int _total = 0;
  int _currentPage = 1;
  int _totalPages = 1;

  @override
  void initState() {
    super.initState();
    _loadStudents();
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _searchController.dispose();
    super.dispose();
  }

  void _onSearchChanged(String query) {
    if (_debounce?.isActive ?? false) _debounce!.cancel();
    _debounce = Timer(const Duration(milliseconds: 350), () {
      setState(() => _currentPage = 1);
      _loadStudents();
    });
  }

  Future<void> _loadStudents({int page = 1}) async {
    setState(() {
      _isLoading = true;
      _error = null;
      _currentPage = page;
    });

    try {
      final res = await _studentRepo.fetchStudents(
        page: _currentPage,
        limit: 15,
        search: _searchController.text.trim(),
      );

      if (mounted) {
        setState(() {
          _students = res.students;
          _total = res.total;
          _totalPages = res.totalPages;
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ClayColors.background,
      appBar: AppBar(
        title: const Text('Students Directory'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: () => _loadStudents(page: _currentPage),
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Search Bar
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
              child: ClayTextField(
                controller: _searchController,
                hintText: 'Search by student name, email, phone...',
                prefixIcon: const Icon(Icons.search, size: 20, color: ClayColors.textSubtle),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear, size: 18, color: ClayColors.textSubtle),
                        onPressed: () {
                          _searchController.clear();
                          _loadStudents(page: 1);
                        },
                      )
                    : null,
                onChanged: _onSearchChanged,
              ),
            ),

            // Counter Header
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 4),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    '$_total registered student${_total != 1 ? 's' : ''}',
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: ClayColors.textMuted,
                    ),
                  ),
                  if (_totalPages > 1)
                    Text(
                      'Page $_currentPage of $_totalPages',
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                        color: ClayColors.textSubtle,
                      ),
                    ),
                ],
              ),
            ),

            // Main List
            Expanded(
              child: _isLoading
                  ? const LoadingIndicator(message: 'Loading students...')
                  : _error != null
                      ? EmptyState(
                          icon: Icons.error_outline,
                          title: 'Failed to Load Students',
                          description: _error!,
                          actionLabel: 'Try Again',
                          onAction: () => _loadStudents(page: _currentPage),
                        )
                      : _students.isEmpty
                          ? EmptyState(
                              icon: Icons.people_outline,
                              title: 'No Students Found',
                              description: _searchController.text.isNotEmpty
                                  ? 'No students matched "${_searchController.text}".'
                                  : 'No student accounts registered yet.',
                              actionLabel: _searchController.text.isNotEmpty ? 'Clear Search' : null,
                              onAction: () {
                                _searchController.clear();
                                _loadStudents(page: 1);
                              },
                            )
                          : RefreshIndicator(
                              onRefresh: () => _loadStudents(page: _currentPage),
                              color: ClayColors.primary,
                              child: ListView.separated(
                                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                                itemCount: _students.length + (_totalPages > 1 ? 1 : 0),
                                separatorBuilder: (_, index) => const SizedBox(height: 12),
                                itemBuilder: (context, index) {
                                  if (index == _students.length) {
                                    return Padding(
                                      padding: const EdgeInsets.symmetric(vertical: 16),
                                      child: Row(
                                        mainAxisAlignment: MainAxisAlignment.center,
                                        children: [
                                          IconButton(
                                            icon: const Icon(Icons.chevron_left),
                                            onPressed: _currentPage > 1
                                                ? () => _loadStudents(page: _currentPage - 1)
                                                : null,
                                          ),
                                          Padding(
                                            padding: const EdgeInsets.symmetric(horizontal: 16),
                                            child: Text(
                                              'Page $_currentPage of $_totalPages',
                                              style: const TextStyle(
                                                fontSize: 13,
                                                fontWeight: FontWeight.w600,
                                                color: ClayColors.textDark,
                                              ),
                                            ),
                                          ),
                                          IconButton(
                                            icon: const Icon(Icons.chevron_right),
                                            onPressed: _currentPage < _totalPages
                                                ? () => _loadStudents(page: _currentPage + 1)
                                                : null,
                                          ),
                                        ],
                                      ),
                                    );
                                  }

                                  final s = _students[index];
                                  return _buildStudentCard(s);
                                },
                              ),
                            ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStudentCard(StudentUser student) {
    final collegeName = student.college?.name ?? student.academicProfile?.collegeName ?? 'College unassigned';

    return ClayCard(
      padding: const EdgeInsets.all(16),
      radius: 20,
      onTap: () {
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) => StudentDetailsScreen(studentId: student.id),
          ),
        );
      },
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [ClayColors.primaryGradientStart, ClayColors.primaryGradientEnd],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Center(
              child: Text(
                student.initials,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                ),
              ),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  student.fullName,
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: ClayColors.textDark,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 3),
                Text(
                  student.email,
                  style: const TextStyle(
                    fontSize: 12,
                    color: ClayColors.textMuted,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                Text(
                  collegeName,
                  style: const TextStyle(
                    fontSize: 11,
                    color: ClayColors.textSubtle,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          const Icon(Icons.arrow_forward_ios, size: 14, color: ClayColors.textSubtle),
        ],
      ),
    );
  }
}
