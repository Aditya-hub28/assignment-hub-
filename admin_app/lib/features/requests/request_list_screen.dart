import 'dart:async';
import 'package:flutter/material.dart';
import '../../core/theme/clay_colors.dart';
import '../../core/widgets/clay_card.dart';
import '../../core/widgets/clay_text_field.dart';
import '../../core/widgets/empty_state.dart';
import '../../core/widgets/loading_indicator.dart';
import '../../core/widgets/status_pill.dart';
import '../../data/models/service_request.dart';
import '../../data/repositories/request_repository.dart';
import 'request_details_screen.dart';

class RequestListScreen extends StatefulWidget {
  const RequestListScreen({super.key});

  @override
  State<RequestListScreen> createState() => _RequestListScreenState();
}

class _RequestListScreenState extends State<RequestListScreen> {
  final RequestRepository _requestRepo = RequestRepository();
  final TextEditingController _searchController = TextEditingController();
  Timer? _debounce;
  Timer? _pollTimer;

  bool _isLoading = true;
  String? _error;
  List<ServiceRequest> _requests = [];
  int _total = 0;
  int _currentPage = 1;
  int _totalPages = 1;

  String? _selectedStatus; // null means 'all'

  final List<Map<String, String?>> _statusFilters = [
    {'label': 'All', 'value': null},
    {'label': 'Pending', 'value': 'pending'},
    {'label': 'In Review', 'value': 'in_review'},
    {'label': 'In Progress', 'value': 'in_progress'},
    {'label': 'Delivered', 'value': 'completed'},
    {'label': 'Cancelled', 'value': 'cancelled'},
  ];

  @override
  void initState() {
    super.initState();
    _loadRequests();
    _pollTimer = Timer.periodic(const Duration(seconds: 5), (_) {
      _silentPollRequests();
    });
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    _debounce?.cancel();
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _silentPollRequests() async {
    if (!mounted || _isLoading || _searchController.text.isNotEmpty) return;
    try {
      final res = await _requestRepo.fetchRequests(
        page: _currentPage,
        limit: 15,
        status: _selectedStatus,
        search: '',
      );
      if (mounted) {
        setState(() {
          _requests = res.requests;
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
      _loadRequests();
    });
  }

  Future<void> _loadRequests({int page = 1}) async {
    setState(() {
      _isLoading = true;
      _error = null;
      _currentPage = page;
    });

    try {
      final res = await _requestRepo.fetchRequests(
        page: _currentPage,
        limit: 15,
        status: _selectedStatus,
        search: _searchController.text.trim(),
      );

      if (mounted) {
        setState(() {
          _requests = res.requests;
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
        title: const Text('Service Requests'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: () => _loadRequests(page: _currentPage),
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Search and Filter Bar
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
              child: ClayTextField(
                controller: _searchController,
                hintText: 'Search by ID, title, student name...',
                prefixIcon: const Icon(Icons.search, size: 20, color: ClayColors.textSubtle),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear, size: 18, color: ClayColors.textSubtle),
                        onPressed: () {
                          _searchController.clear();
                          _loadRequests(page: 1);
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
                        _loadRequests();
                      }
                    },
                  );
                },
              ),
            ),
            const SizedBox(height: 8),

            // Results Counter
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 4),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Found $_total request${_total != 1 ? 's' : ''}',
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

            // Main Content Area
            Expanded(
              child: _isLoading
                  ? const LoadingIndicator(message: 'Retrieving requests...')
                  : _error != null
                      ? EmptyState(
                          icon: Icons.error_outline,
                          title: 'Failed to Load Requests',
                          description: _error!,
                          actionLabel: 'Try Again',
                          onAction: () => _loadRequests(page: _currentPage),
                        )
                      : _requests.isEmpty
                          ? EmptyState(
                              icon: Icons.assignment_outlined,
                              title: 'No Requests Found',
                              description: _searchController.text.isNotEmpty
                                  ? 'No requests matched "${_searchController.text}".'
                                  : 'No requests exist under the selected filter.',
                              actionLabel: _searchController.text.isNotEmpty || _selectedStatus != null
                                  ? 'Clear Filters'
                                  : null,
                              onAction: () {
                                _searchController.clear();
                                setState(() => _selectedStatus = null);
                                _loadRequests(page: 1);
                              },
                            )
                          : RefreshIndicator(
                              onRefresh: () => _loadRequests(page: _currentPage),
                              color: ClayColors.primary,
                              child: ListView.separated(
                                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                                itemCount: _requests.length + (_totalPages > 1 ? 1 : 0),
                                separatorBuilder: (_, index) => const SizedBox(height: 12),
                                itemBuilder: (context, index) {
                                  if (index == _requests.length) {
                                    // Pagination Controls
                                    return Padding(
                                      padding: const EdgeInsets.symmetric(vertical: 16),
                                      child: Row(
                                        mainAxisAlignment: MainAxisAlignment.center,
                                        children: [
                                          IconButton(
                                            icon: const Icon(Icons.chevron_left),
                                            onPressed: _currentPage > 1
                                                ? () => _loadRequests(page: _currentPage - 1)
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
                                                ? () => _loadRequests(page: _currentPage + 1)
                                                : null,
                                          ),
                                        ],
                                      ),
                                    );
                                  }

                                  final req = _requests[index];
                                  return _buildRequestCard(req);
                                },
                              ),
                            ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRequestCard(ServiceRequest req) {
    return ClayCard(
      padding: const EdgeInsets.all(18),
      radius: 20,
      onTap: () {
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) => RequestDetailsScreen(requestId: req.id),
          ),
        ).then((_) => _loadRequests(page: _currentPage));
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
          const SizedBox(height: 10),
          Text(
            req.title,
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
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: ClayColors.surfaceInset,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  req.serviceDisplayName,
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: ClayColors.textMuted,
                  ),
                ),
              ),
              const SizedBox(width: 8),
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
            ],
          ),
          const SizedBox(height: 10),
          const Divider(height: 1, color: ClayColors.borderLight),
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(Icons.attach_file, size: 14, color: ClayColors.textSubtle),
                  const SizedBox(width: 4),
                  Text(
                    '${req.files.length} file${req.files.length != 1 ? 's' : ''}',
                    style: const TextStyle(fontSize: 12, color: ClayColors.textSubtle),
                  ),
                ],
              ),
              if (req.deadline.isNotEmpty)
                Row(
                  children: [
                    const Icon(Icons.calendar_today_outlined, size: 12, color: ClayColors.textSubtle),
                    const SizedBox(width: 4),
                    Text(
                      req.deadline,
                      style: const TextStyle(
                        fontSize: 12,
                        color: ClayColors.textDark,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
            ],
          ),
        ],
      ),
    );
  }
}
