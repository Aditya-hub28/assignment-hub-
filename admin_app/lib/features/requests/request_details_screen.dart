import 'dart:async';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/theme/clay_colors.dart';
import '../../core/theme/clay_decorations.dart';
import '../../core/widgets/clay_button.dart';
import '../../core/widgets/clay_card.dart';
import '../../core/widgets/empty_state.dart';
import '../../core/widgets/loading_indicator.dart';
import '../../core/widgets/status_pill.dart';
import '../../data/models/service_request.dart';
import '../../data/repositories/request_repository.dart';
import '../inquiries/chat_screen.dart';
import '../students/student_details_screen.dart';

class RequestDetailsScreen extends StatefulWidget {
  final String requestId;

  const RequestDetailsScreen({super.key, required this.requestId});

  @override
  State<RequestDetailsScreen> createState() => _RequestDetailsScreenState();
}

class _RequestDetailsScreenState extends State<RequestDetailsScreen> {
  final RequestRepository _requestRepo = RequestRepository();
  bool _isLoading = true;
  String? _error;
  ServiceRequest? _request;
  Timer? _pollTimer;

  @override
  void initState() {
    super.initState();
    _loadRequest();
    _startPolling();
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    super.dispose();
  }

  void _startPolling() {
    _pollTimer?.cancel();
    _pollTimer = Timer.periodic(const Duration(seconds: 3), (_) {
      if (mounted && !_isLoading) {
        _silentPoll();
      }
    });
  }

  Future<void> _silentPoll() async {
    try {
      final req = await _requestRepo.fetchRequestById(widget.requestId);
      if (mounted) {
        setState(() => _request = req);
      }
    } catch (_) {}
  }

  Future<void> _loadRequest() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final req = await _requestRepo.fetchRequestById(widget.requestId);
      if (mounted) {
        setState(() {
          _request = req;
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

  Future<void> _openFile(RequestFile file) async {
    String? rawUrl = file.signedUrl;
    if (rawUrl == null || rawUrl.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('File download link is not available.')),
      );
      return;
    }

    final ext = file.displayName.contains('.') ? file.displayName.split('.').last.toLowerCase() : '';
    final isImage = ['jpg', 'jpeg', 'png', 'webp', 'gif'].contains(ext) ||
        (file.mimeType?.toLowerCase().contains('image') ?? false);

    if (isImage) {
      _showImagePreviewDialog(file, rawUrl);
      return;
    }

    try {
      final uri = Uri.parse(rawUrl);
      final launched = await launchUrl(
        uri,
        mode: LaunchMode.externalApplication,
      );
      if (!launched) {
        await launchUrl(uri, mode: LaunchMode.platformDefault);
      }
    } catch (_) {
      try {
        final uri = Uri.parse(rawUrl);
        await launchUrl(uri, mode: LaunchMode.platformDefault);
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Unable to open file: ${file.displayName}')),
          );
        }
      }
    }
  }

  void _showImagePreviewDialog(RequestFile file, String imageUrl) {
    showDialog(
      context: context,
      builder: (ctx) => Dialog(
        backgroundColor: Colors.transparent,
        insetPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(24),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Padding(
                padding: const EdgeInsets.only(top: 16, left: 20, right: 12, bottom: 8),
                child: Row(
                  children: [
                    const Icon(Icons.image_outlined, color: ClayColors.primary, size: 20),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        file.displayName,
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: ClayColors.textDark,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, size: 20, color: ClayColors.textSubtle),
                      onPressed: () => Navigator.of(ctx).pop(),
                    ),
                  ],
                ),
              ),
              const Divider(height: 1),
              ClipRRect(
                child: Container(
                  constraints: BoxConstraints(
                    maxHeight: MediaQuery.of(context).size.height * 0.55,
                    minHeight: 200,
                  ),
                  color: Colors.black,
                  width: double.infinity,
                  child: InteractiveViewer(
                    minScale: 0.5,
                    maxScale: 4.0,
                    child: Center(
                      child: Image.network(
                        imageUrl,
                        fit: BoxFit.contain,
                        loadingBuilder: (context, child, progress) {
                          if (progress == null) return child;
                          return const Center(
                            child: Padding(
                              padding: EdgeInsets.all(40),
                              child: CircularProgressIndicator(color: Colors.white),
                            ),
                          );
                        },
                        errorBuilder: (context, error, stackTrace) {
                          return Padding(
                            padding: const EdgeInsets.all(32),
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: const [
                                Icon(Icons.broken_image_outlined, size: 48, color: Colors.white70),
                                SizedBox(height: 8),
                                Text(
                                  'Could not load in-app preview.\nTap below to open in browser.',
                                  textAlign: TextAlign.center,
                                  style: TextStyle(color: Colors.white70, fontSize: 13),
                                ),
                              ],
                            ),
                          );
                        },
                      ),
                    ),
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(16),
                child: ClayButton(
                  text: 'Download / Open in Browser',
                  icon: const Icon(Icons.download_rounded, size: 18, color: Colors.white),
                  onPressed: () async {
                    Navigator.of(ctx).pop();
                    try {
                      final uri = Uri.parse(imageUrl);
                      await launchUrl(uri, mode: LaunchMode.externalApplication);
                    } catch (_) {}
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showStatusUpdateSheet() {
    if (_request == null) return;

    String selectedStatus = _request!.status;
    int progress = _request!.progress;

    final statuses = [
      {'key': 'pending', 'label': 'Pending Review', 'defaultProgress': 25},
      {'key': 'in_review', 'label': 'In Review', 'defaultProgress': 50},
      {'key': 'in_progress', 'label': 'In Progress', 'defaultProgress': 75},
      {'key': 'completed', 'label': 'Delivered', 'defaultProgress': 100},
      {'key': 'cancelled', 'label': 'Cancelled', 'defaultProgress': 0},
    ];

    if (progress == 0 && selectedStatus != 'cancelled') {
      final defaultItem = statuses.firstWhere(
        (e) => e['key'] == selectedStatus,
        orElse: () => {'defaultProgress': 25},
      );
      progress = defaultItem['defaultProgress'] as int;
    }

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Container(
              padding: EdgeInsets.only(
                top: 24,
                left: 24,
                right: 24,
                bottom: MediaQuery.of(context).viewInsets.bottom + 24,
              ),
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Center(
                    child: Container(
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: ClayColors.borderSubtle,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  const SizedBox(height: 18),
                  const Text(
                    'Update Request Status',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      color: ClayColors.textDark,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Updating status for ${_request!.id}',
                    style: const TextStyle(fontSize: 13, color: ClayColors.textMuted),
                  ),
                  const SizedBox(height: 20),

                  // Status chips
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: statuses.map((item) {
                      final isSelected = selectedStatus == item['key'];
                      return ChoiceChip(
                        label: Text(item['label'] as String),
                        selected: isSelected,
                        selectedColor: ClayColors.primary.withValues(alpha: 0.15),
                        backgroundColor: ClayColors.surfaceInset,
                        labelStyle: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: isSelected ? ClayColors.primary : ClayColors.textDark,
                        ),
                        side: BorderSide(
                          color: isSelected ? ClayColors.primary : ClayColors.borderLight,
                        ),
                        onSelected: (selected) {
                          if (selected) {
                            setModalState(() {
                              selectedStatus = item['key'] as String;
                              progress = item['defaultProgress'] as int;
                            });
                          }
                        },
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 24),

                  // Progress slider
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Completion Progress',
                        style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: ClayColors.textDark),
                      ),
                      Text(
                        '$progress%',
                        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: ClayColors.primary),
                      ),
                    ],
                  ),
                  Slider(
                    value: progress.toDouble(),
                    min: 0,
                    max: 100,
                    divisions: 20,
                    activeColor: ClayColors.primary,
                    inactiveColor: ClayColors.surfaceInset,
                    onChanged: (val) {
                      setModalState(() => progress = val.round());
                    },
                  ),
                  const SizedBox(height: 24),

                  // Save button
                  ClayButton(
                    text: 'Save Status',
                    onPressed: () async {
                      Navigator.of(ctx).pop();
                      final currentItem = statuses.firstWhere(
                        (e) => e['key'] == selectedStatus,
                        orElse: () => {'label': selectedStatus},
                      );
                      final label = currentItem['label'] as String;

                      final messenger = ScaffoldMessenger.of(context);
                      try {
                        final updated = await _requestRepo.updateStatus(
                          _request!.id,
                          status: selectedStatus,
                          statusLabel: label,
                          progress: progress,
                        );
                        if (mounted) {
                          setState(() => _request = updated);
                          messenger.showSnackBar(
                            const SnackBar(content: Text('Request status updated successfully.')),
                          );
                        }
                      } catch (err) {
                        if (mounted) {
                          messenger.showSnackBar(
                            SnackBar(content: Text('Failed to update status: $err')),
                          );
                        }
                      }
                    },
                  ),
                ],
              ),
            );
          },
        );
      },
    );
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
        title: Text(_request?.id ?? 'Request Details'),
        actions: [
          if (_request != null)
            IconButton(
              icon: const Icon(Icons.edit_note_rounded, size: 24),
              onPressed: _showStatusUpdateSheet,
              tooltip: 'Update Status',
            ),
        ],
      ),
      body: SafeArea(
        child: _isLoading
            ? const LoadingIndicator(message: 'Loading request details...')
            : _error != null
                ? EmptyState(
                    icon: Icons.error_outline,
                    title: 'Error Loading Request',
                    description: _error!,
                    actionLabel: 'Retry',
                    onAction: _loadRequest,
                  )
                : _request == null
                    ? const EmptyState(
                        icon: Icons.search_off,
                        title: 'Request Not Found',
                        description: 'The requested service ticket could not be located.',
                      )
                    : SingleChildScrollView(
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            // Status Card
                            ClayCard(
                              padding: const EdgeInsets.all(20),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        _request!.id,
                                        style: const TextStyle(
                                          fontSize: 16,
                                          fontWeight: FontWeight.w800,
                                          color: ClayColors.primary,
                                        ),
                                      ),
                                      StatusPill(status: _request!.status, label: _request!.statusLabel),
                                    ],
                                  ),
                                  const SizedBox(height: 14),
                                  Text(
                                    _request!.title,
                                    style: const TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.w800,
                                      color: ClayColors.textDark,
                                    ),
                                  ),
                                  const SizedBox(height: 12),

                                  // Progress Bar
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      const Text(
                                        'Workflow Progress',
                                        style: TextStyle(
                                          fontSize: 12,
                                          fontWeight: FontWeight.w600,
                                          color: ClayColors.textMuted,
                                        ),
                                      ),
                                      Text(
                                        '${_request!.progress}%',
                                        style: const TextStyle(
                                          fontSize: 12,
                                          fontWeight: FontWeight.w700,
                                          color: ClayColors.primary,
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 6),
                                  ClipRRect(
                                    borderRadius: BorderRadius.circular(6),
                                    child: LinearProgressIndicator(
                                      value: _request!.progress / 100,
                                      minHeight: 8,
                                      backgroundColor: ClayColors.surfaceInset,
                                      valueColor: const AlwaysStoppedAnimation<Color>(ClayColors.primary),
                                    ),
                                  ),
                                  const SizedBox(height: 16),
                                  ClayButton(
                                    text: 'Update Status & Progress',
                                    variant: ClayButtonVariant.outline,
                                    height: 44,
                                    icon: const Icon(Icons.tune, size: 16, color: ClayColors.primary),
                                    onPressed: _showStatusUpdateSheet,
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 16),

                            // Student Information Card
                            ClayCard(
                              padding: const EdgeInsets.all(20),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      const Text(
                                        'Student Information',
                                        style: TextStyle(
                                          fontSize: 15,
                                          fontWeight: FontWeight.w700,
                                          color: ClayColors.textDark,
                                        ),
                                      ),
                                      if (_request!.userId.isNotEmpty)
                                        GestureDetector(
                                          onTap: () {
                                            Navigator.of(context).push(
                                              MaterialPageRoute(
                                                builder: (_) => StudentDetailsScreen(studentId: _request!.userId),
                                              ),
                                            );
                                          },
                                          child: const Text(
                                            'View Profile',
                                            style: TextStyle(
                                              fontSize: 13,
                                              fontWeight: FontWeight.w600,
                                              color: ClayColors.primary,
                                            ),
                                          ),
                                        ),
                                    ],
                                  ),
                                  const SizedBox(height: 14),
                                  _buildInfoRow(Icons.person_outline, 'Name', _request!.userName),
                                  const SizedBox(height: 10),
                                  _buildInfoRow(Icons.email_outlined, 'Email', _request!.userEmail),
                                  if (_request!.deadline.isNotEmpty) ...[
                                    const SizedBox(height: 10),
                                    _buildInfoRow(Icons.event_outlined, 'Deadline', _request!.deadline),
                                  ],
                                ],
                              ),
                            ),
                            const SizedBox(height: 16),

                            // Service Details Card
                            ClayCard(
                              padding: const EdgeInsets.all(20),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text(
                                    'Service Specifications',
                                    style: TextStyle(
                                      fontSize: 15,
                                      fontWeight: FontWeight.w700,
                                      color: ClayColors.textDark,
                                    ),
                                  ),
                                  const SizedBox(height: 14),
                                  _buildInfoRow(Icons.category_outlined, 'Service', _request!.serviceDisplayName),
                                  const SizedBox(height: 10),
                                  _buildInfoRow(Icons.menu_book_outlined, 'Subject', _request!.subject),
                                  const SizedBox(height: 16),
                                  const Text(
                                    'Description / Scope',
                                    style: TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w600,
                                      color: ClayColors.textMuted,
                                    ),
                                  ),
                                  const SizedBox(height: 6),
                                  Container(
                                    width: double.infinity,
                                    padding: const EdgeInsets.all(14),
                                    decoration: ClayDecorations.insetWell(radius: 14),
                                    child: Text(
                                      _request!.description.isNotEmpty ? _request!.description : 'No description provided.',
                                      style: const TextStyle(fontSize: 14, color: ClayColors.textDark, height: 1.4),
                                    ),
                                  ),
                                  if (_request!.additionalInstructions != null && _request!.additionalInstructions!.isNotEmpty) ...[
                                    const SizedBox(height: 14),
                                    const Text(
                                      'Additional Instructions',
                                      style: TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w600,
                                        color: ClayColors.textMuted,
                                      ),
                                    ),
                                    const SizedBox(height: 6),
                                    Container(
                                      width: double.infinity,
                                      padding: const EdgeInsets.all(14),
                                      decoration: ClayDecorations.insetWell(radius: 14),
                                      child: Text(
                                        _request!.additionalInstructions!,
                                        style: const TextStyle(fontSize: 14, color: ClayColors.textDark, height: 1.4),
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                            ),
                            const SizedBox(height: 16),

                            // Uploaded Reference Files
                            ClayCard(
                              padding: const EdgeInsets.all(20),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      const Icon(Icons.attach_file, size: 18, color: ClayColors.primary),
                                      const SizedBox(width: 8),
                                      Text(
                                        'Uploaded Reference Files (${_request!.files.length})',
                                        style: const TextStyle(
                                          fontSize: 15,
                                          fontWeight: FontWeight.w700,
                                          color: ClayColors.textDark,
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 12),
                                  if (_request!.files.isEmpty)
                                    const Padding(
                                      padding: EdgeInsets.symmetric(vertical: 8),
                                      child: Text(
                                        'No reference files were attached to this request.',
                                        style: TextStyle(fontSize: 13, color: ClayColors.textSubtle),
                                      ),
                                    )
                                  else
                                    ListView.separated(
                                      shrinkWrap: true,
                                      physics: const NeverScrollableScrollPhysics(),
                                      itemCount: _request!.files.length,
                                      separatorBuilder: (_, index) => const SizedBox(height: 8),
                                      itemBuilder: (context, index) {
                                        final file = _request!.files[index];
                                        final ext = file.displayName.contains('.') ? file.displayName.split('.').last.toLowerCase() : '';
                                        final isImg = ['jpg', 'jpeg', 'png', 'webp', 'gif'].contains(ext) ||
                                            (file.mimeType?.toLowerCase().contains('image') ?? false);
                                        final isPdf = ext == 'pdf' ||
                                            (file.mimeType?.toLowerCase().contains('pdf') ?? false);

                                        final fileIcon = isImg
                                            ? Icons.image_outlined
                                            : isPdf
                                                ? Icons.picture_as_pdf_outlined
                                                : ['zip', 'rar', 'tar', 'gz'].contains(ext)
                                                    ? Icons.folder_zip_outlined
                                                    : Icons.insert_drive_file_outlined;

                                        final iconBgColor = isImg
                                            ? ClayColors.primary.withValues(alpha: 0.12)
                                            : isPdf
                                                ? Colors.red.withValues(alpha: 0.12)
                                                : ClayColors.surfaceInset;

                                        final iconColor = isImg
                                            ? ClayColors.primary
                                            : isPdf
                                                ? Colors.red.shade700
                                                : ClayColors.primary;

                                        return InkWell(
                                          onTap: () => _openFile(file),
                                          borderRadius: BorderRadius.circular(14),
                                          child: Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                                            decoration: ClayDecorations.insetWell(radius: 14),
                                            child: Row(
                                              children: [
                                                Container(
                                                  width: 38,
                                                  height: 38,
                                                  decoration: BoxDecoration(
                                                    color: iconBgColor,
                                                    borderRadius: BorderRadius.circular(10),
                                                  ),
                                                  child: Icon(fileIcon, color: iconColor, size: 22),
                                                ),
                                                const SizedBox(width: 12),
                                                Expanded(
                                                  child: Column(
                                                    crossAxisAlignment: CrossAxisAlignment.start,
                                                    children: [
                                                      Text(
                                                        file.displayName,
                                                        style: const TextStyle(
                                                          fontSize: 14,
                                                          fontWeight: FontWeight.w600,
                                                          color: ClayColors.textDark,
                                                        ),
                                                        maxLines: 1,
                                                        overflow: TextOverflow.ellipsis,
                                                      ),
                                                      Row(
                                                        children: [
                                                          if (file.formattedSize.isNotEmpty)
                                                            Text(
                                                              file.formattedSize,
                                                              style: const TextStyle(
                                                                fontSize: 11,
                                                                color: ClayColors.textSubtle,
                                                              ),
                                                            ),
                                                          if (file.formattedSize.isNotEmpty)
                                                            const Text(' • ', style: TextStyle(color: ClayColors.textSubtle, fontSize: 11)),
                                                          Text(
                                                            isImg ? 'Tap to view photo' : 'Tap to open / download',
                                                            style: TextStyle(
                                                              fontSize: 11,
                                                              fontWeight: FontWeight.w600,
                                                              color: isImg ? ClayColors.primary : Colors.teal.shade700,
                                                            ),
                                                          ),
                                                        ],
                                                      ),
                                                    ],
                                                  ),
                                                ),
                                                IconButton(
                                                  icon: Icon(
                                                    isImg ? Icons.visibility_outlined : Icons.download_rounded,
                                                    color: ClayColors.primary,
                                                  ),
                                                  onPressed: () => _openFile(file),
                                                  tooltip: isImg ? 'View / Download Photo' : 'Download File',
                                                ),
                                              ],
                                            ),
                                          ),
                                        );
                                      },
                                    ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 20),

                            // Linked Live Chat Button
                            if (_request!.inquiryId != null && _request!.inquiryId!.isNotEmpty) ...[
                              ClayButton(
                                text: 'Open Linked Inquiry Thread',
                                icon: const Icon(Icons.forum_outlined, size: 18, color: Colors.white),
                                onPressed: () {
                                  Navigator.of(context).push(
                                    MaterialPageRoute(
                                      builder: (_) => ChatScreen(inquiryId: _request!.inquiryId!),
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

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Row(
      children: [
        Icon(icon, size: 16, color: ClayColors.textSubtle),
        const SizedBox(width: 10),
        SizedBox(
          width: 75,
          child: Text(
            label,
            style: const TextStyle(
              fontSize: 13,
              color: ClayColors.textMuted,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
        Expanded(
          child: Text(
            value,
            style: const TextStyle(
              fontSize: 14,
              color: ClayColors.textDark,
              fontWeight: FontWeight.w600,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }
}
