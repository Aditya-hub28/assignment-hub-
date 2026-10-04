import 'dart:async';
import 'package:flutter/material.dart';
import '../../core/theme/clay_colors.dart';
import '../../core/widgets/clay_card.dart';
import '../../core/widgets/clay_text_field.dart';
import '../../core/widgets/empty_state.dart';
import '../../core/widgets/loading_indicator.dart';
import '../../core/widgets/status_pill.dart';
import '../../data/models/inquiry.dart';
import '../../data/repositories/inquiry_repository.dart';
import 'chat_screen.dart';

class InquiryListScreen extends StatefulWidget {
  const InquiryListScreen({super.key});

  @override
  State<InquiryListScreen> createState() => _InquiryListScreenState();
}

class _InquiryListScreenState extends State<InquiryListScreen> {
  final InquiryRepository _inquiryRepo = InquiryRepository();
  final TextEditingController _searchController = TextEditingController();
  Timer? _debounce;
  Timer? _pollTimer;

  bool _isLoading = true;
  String? _error;
  List<Inquiry> _inquiries = [];
  int _total = 0;
  int _currentPage = 1;
  int _totalPages = 1;

  String? _selectedStatus; // null means 'all'

  final List<Map<String, String?>> _statusFilters = [
    {'label': 'All', 'value': null},
    {'label': 'Open', 'value': 'open'},
    {'label': 'Responded', 'value': 'responded'},
    {'label': 'Resolved', 'value': 'resolved'},
    {'label': 'Closed', 'value': 'closed'},
  ];

  @override
  void initState() {
    super.initState();
    _loadInquiries();
    _pollTimer = Timer.periodic(const Duration(seconds: 4), (_) {
      _silentPollInquiries();
    });
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    _debounce?.cancel();
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _silentPollInquiries() async {
    if (!mounted || _isLoading || _searchController.text.isNotEmpty) return;
    try {
      final res = await _inquiryRepo.fetchInquiries(
        page: _currentPage,
        limit: 15,
        status: _selectedStatus,
        search: '',
      );
      if (mounted) {
        setState(() {
          _inquiries = res.inquiries;
          _total = res.total;
          _totalPages = res.totalPages;
        });
      }
    } catch (_) {}
  }

  void _onSearchChanged(String query) {
    if (_debounce?.isActive ?? false) _debounce!.cancel();
    _debounce = Timer(const Duration(milliseconds: 350), () {
      setState(() => _currentPage = 1);
      _loadInquiries();
    });
  }

  Future<void> _loadInquiries({int page = 1}) async {
    setState(() {
      _isLoading = true;
      _error = null;
      _currentPage = page;
    });

    try {
      final res = await _inquiryRepo.fetchInquiries(
        page: _currentPage,
        limit: 15,
        status: _selectedStatus,
        search: _searchController.text.trim(),
      );

      if (mounted) {
        setState(() {
          _inquiries = res.inquiries;
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
        title: const Text('Inquiries & Chat'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: () => _loadInquiries(page: _currentPage),
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
                hintText: 'Search inquiries by subject, student...',
                prefixIcon: const Icon(Icons.search, size: 20, color: ClayColors.textSubtle),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear, size: 18, color: ClayColors.textSubtle),
                        onPressed: () {
                          _searchController.clear();
                          _loadInquiries(page: 1);
                        },
                      )
                    : null,
                onChanged: _onSearchChanged,
              ),
            ),

            // Horizontal Filter Chips
            SizedBox(
              height: 48,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 20),
                itemCount: _statusFilters.length,
                separatorBuilder: (_, index) => const SizedBox(width: 8),
                itemBuilder: (context, index) {
                  final filter = _statusFilters[index];
                  final isSelected = _selectedStatus == filter['value'];
                  return ChoiceChip(
                    label: Text(filter['label']!),
                    selected: isSelected,
                    selectedColor: ClayColors.primary,
                    backgroundColor: Colors.white,
                    labelStyle: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: isSelected ? Colors.white : ClayColors.textDark,
                    ),
                    side: BorderSide(
                      color: isSelected ? ClayColors.primary : ClayColors.borderLight,
                    ),
                    onSelected: (selected) {
                      if (selected) {
                        setState(() {
                          _selectedStatus = filter['value'];
                          _currentPage = 1;
                        });
                        _loadInquiries();
                      }
                    },
                  );
                },
              ),
            ),
            const SizedBox(height: 8),

            // Counter Header
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 4),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Found $_total thread${_total != 1 ? 's' : ''}',
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
                  ? const LoadingIndicator(message: 'Loading inquiries...')
                  : _error != null
                      ? EmptyState(
                          icon: Icons.error_outline,
                          title: 'Failed to Load Inquiries',
                          description: _error!,
                          actionLabel: 'Try Again',
                          onAction: () => _loadInquiries(page: _currentPage),
                        )
                      : _inquiries.isEmpty
                          ? EmptyState(
                              icon: Icons.forum_outlined,
                              title: 'No Inquiries Found',
                              description: _searchController.text.isNotEmpty
                                  ? 'No threads matched "${_searchController.text}".'
                                  : 'No inquiry conversations under this filter.',
                              actionLabel: _searchController.text.isNotEmpty || _selectedStatus != null
                                  ? 'Clear Filters'
                                  : null,
                              onAction: () {
                                _searchController.clear();
                                setState(() => _selectedStatus = null);
                                _loadInquiries(page: 1);
                              },
                            )
                          : RefreshIndicator(
                              onRefresh: () => _loadInquiries(page: _currentPage),
                              color: ClayColors.primary,
                              child: ListView.separated(
                                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                                itemCount: _inquiries.length + (_totalPages > 1 ? 1 : 0),
                                separatorBuilder: (_, index) => const SizedBox(height: 12),
                                itemBuilder: (context, index) {
                                  if (index == _inquiries.length) {
                                    // Pagination controls
                                    return Padding(
                                      padding: const EdgeInsets.symmetric(vertical: 16),
                                      child: Row(
                                        mainAxisAlignment: MainAxisAlignment.center,
                                        children: [
                                          IconButton(
                                            icon: const Icon(Icons.chevron_left),
                                            onPressed: _currentPage > 1
                                                ? () => _loadInquiries(page: _currentPage - 1)
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
                                                ? () => _loadInquiries(page: _currentPage + 1)
                                                : null,
                                          ),
                                        ],
                                      ),
                                    );
                                  }

                                  final inq = _inquiries[index];
                                  return _buildInquiryCard(inq);
                                },
                              ),
                            ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInquiryCard(Inquiry inq) {
    return ClayCard(
      padding: const EdgeInsets.all(18),
      radius: 20,
      onTap: () {
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) => ChatScreen(inquiryId: inq.id),
          ),
        ).then((_) => _loadInquiries(page: _currentPage));
      },
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: ClayColors.surfaceInset,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  inq.requestId.isNotEmpty ? inq.requestId : 'Direct Inquiry',
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: ClayColors.primary,
                  ),
                ),
              ),
              StatusPill(status: inq.status, label: inq.statusLabel),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            inq.title.isNotEmpty ? inq.title : inq.subject,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: ClayColors.textDark,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              const Icon(Icons.person_outline, size: 14, color: ClayColors.textSubtle),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  inq.userName,
                  style: const TextStyle(fontSize: 13, color: ClayColors.textMuted),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          if (inq.latestMessage != null && inq.latestMessage!.isNotEmpty) ...[
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: ClayColors.surfaceInset.withValues(alpha: 0.6),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Row(
                children: [
                  const Icon(Icons.reply, size: 14, color: ClayColors.textSubtle),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      inq.latestMessage!,
                      style: const TextStyle(
                        fontSize: 12,
                        color: ClayColors.textDark,
                        fontWeight: FontWeight.w500,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}
