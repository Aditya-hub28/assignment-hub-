import 'dart:async';
import 'package:flutter/material.dart';
import '../../core/theme/clay_colors.dart';
import '../../core/theme/clay_decorations.dart';
import '../../core/widgets/empty_state.dart';
import '../../core/widgets/loading_indicator.dart';
import '../../core/widgets/status_pill.dart';
import '../../data/models/inquiry.dart';
import '../../data/repositories/inquiry_repository.dart';
import '../requests/request_details_screen.dart';

class ChatScreen extends StatefulWidget {
  final String inquiryId;

  const ChatScreen({super.key, required this.inquiryId});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final InquiryRepository _inquiryRepo = InquiryRepository();
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  Timer? _pollTimer;

  bool _isLoading = true;
  bool _isSending = false;
  String? _error;
  Inquiry? _inquiry;

  @override
  void initState() {
    super.initState();
    _loadInquiry();
    _startPolling();
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _startPolling() {
    _pollTimer = Timer.periodic(const Duration(milliseconds: 1800), (_) {
      _pollInquiry();
    });
  }

  Future<void> _pollInquiry() async {
    if (!mounted || _isSending) return;
    try {
      final inq = await _inquiryRepo.fetchInquiryById(widget.inquiryId);
      if (!mounted) return;
      final prevLen = _inquiry?.messages.length ?? 0;
      if (_inquiry == null || inq.messages.length != prevLen || inq.status != _inquiry?.status) {
        setState(() {
          _inquiry = inq;
        });
        if (inq.messages.length > prevLen) {
          _scrollToBottom();
        }
      }
    } catch (_) {
      // Background poll - silently ignore transient network drops
    }
  }

  Future<void> _loadInquiry() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final inq = await _inquiryRepo.fetchInquiryById(widget.inquiryId);
      if (mounted) {
        setState(() {
          _inquiry = inq;
          _isLoading = false;
        });
        _scrollToBottom();
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

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _handleSendMessage() async {
    final text = _messageController.text.trim();
    if (text.isEmpty || _isSending) return;

    _messageController.clear();
    setState(() => _isSending = true);

    try {
      final res = await _inquiryRepo.sendMessage(widget.inquiryId, content: text);
      if (mounted) {
        setState(() {
          if (_inquiry != null) {
            final updatedMessages = List<InquiryMessage>.from(_inquiry!.messages)..add(res.message);
            _inquiry = Inquiry(
              id: _inquiry!.id,
              requestId: _inquiry!.requestId,
              userId: _inquiry!.userId,
              userEmail: _inquiry!.userEmail,
              userName: _inquiry!.userName,
              title: _inquiry!.title,
              subject: _inquiry!.subject,
              service: _inquiry!.service,
              deadline: _inquiry!.deadline,
              status: res.inquiry?.status ?? 'responded',
              statusLabel: res.inquiry?.statusLabel ?? 'Responded',
              assignedSpecialist: _inquiry!.assignedSpecialist,
              latestMessage: text,
              latestMessageTime: res.message.createdAt,
              unreadCount: _inquiry!.unreadCount,
              messages: updatedMessages,
              createdAt: _inquiry!.createdAt,
              updatedAt: DateTime.now().toIso8601String(),
            );
          }
          _isSending = false;
        });
        _scrollToBottom();
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isSending = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to send message: $e')),
        );
      }
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
        title: Column(
          children: [
            Text(
              _inquiry?.userName ?? 'Inquiry Thread',
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
            ),
            if (_inquiry?.requestId != null)
              Text(
                'Ticket ${_inquiry!.requestId}',
                style: const TextStyle(fontSize: 12, color: ClayColors.textSubtle),
              ),
          ],
        ),
        actions: [
          if (_inquiry != null)
            Padding(
              padding: const EdgeInsets.only(right: 16),
              child: Center(
                child: StatusPill(status: _inquiry!.status, label: _inquiry!.statusLabel),
              ),
            ),
        ],
      ),
      body: SafeArea(
        child: _isLoading
            ? const LoadingIndicator(message: 'Loading conversation...')
            : _error != null
                ? EmptyState(
                    icon: Icons.error_outline,
                    title: 'Error Loading Chat',
                    description: _error!,
                    actionLabel: 'Retry',
                    onAction: _loadInquiry,
                  )
                : Column(
                    children: [
                      // Linked Request Top Bar
                      if (_inquiry?.requestId != null && _inquiry!.requestId.isNotEmpty)
                        Container(
                          margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                          decoration: ClayDecorations.compactCard(radius: 14),
                          child: Row(
                            children: [
                              const Icon(Icons.assignment_outlined, size: 18, color: ClayColors.primary),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  'Linked: ${_inquiry!.title.isNotEmpty ? _inquiry!.title : _inquiry!.requestId}',
                                  style: const TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                    color: ClayColors.textDark,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              GestureDetector(
                                onTap: () {
                                  Navigator.of(context).push(
                                    MaterialPageRoute(
                                      builder: (_) => RequestDetailsScreen(requestId: _inquiry!.requestId),
                                    ),
                                  );
                                },
                                child: const Text(
                                  'View Request',
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w700,
                                    color: ClayColors.primary,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),

                      // Messages List
                      Expanded(
                        child: _inquiry!.messages.isEmpty
                            ? const EmptyState(
                                icon: Icons.chat_bubble_outline,
                                title: 'No Messages Yet',
                                description: 'Start the conversation by sending an administrator reply below.',
                              )
                            : ListView.builder(
                                controller: _scrollController,
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                                itemCount: _inquiry!.messages.length,
                                itemBuilder: (context, index) {
                                  final msg = _inquiry!.messages[index];
                                  return _buildMessageBubble(msg);
                                },
                              ),
                      ),

                      // Message Input Composer
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          border: Border(top: BorderSide(color: ClayColors.borderLight)),
                        ),
                        child: Row(
                          children: [
                            Expanded(
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 16),
                                decoration: ClayDecorations.insetWell(radius: 20),
                                child: TextField(
                                  controller: _messageController,
                                  maxLines: 4,
                                  minLines: 1,
                                  textCapitalization: TextCapitalization.sentences,
                                  decoration: const InputDecoration(
                                    hintText: 'Type response to student...',
                                    hintStyle: TextStyle(fontSize: 14, color: ClayColors.textSubtle),
                                    border: InputBorder.none,
                                    isDense: true,
                                    contentPadding: EdgeInsets.symmetric(vertical: 10),
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Container(
                              width: 44,
                              height: 44,
                              decoration: ClayDecorations.primaryButton(radius: 22),
                              child: Material(
                                color: Colors.transparent,
                                child: InkWell(
                                  onTap: _isSending ? null : _handleSendMessage,
                                  borderRadius: BorderRadius.circular(22),
                                  child: Center(
                                    child: _isSending
                                        ? const SizedBox(
                                            width: 18,
                                            height: 18,
                                            child: CircularProgressIndicator(
                                              strokeWidth: 2,
                                              valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                                            ),
                                          )
                                        : const Icon(Icons.send_rounded, color: Colors.white, size: 20),
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
      ),
    );
  }

  Widget _buildMessageBubble(InquiryMessage msg) {
    final isAdmin = msg.isAdmin;

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: isAdmin ? CrossAxisAlignment.end : CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.only(left: 4, right: 4, bottom: 4),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  isAdmin ? 'ADMIN' : (msg.senderName.isNotEmpty ? msg.senderName : 'Student'),
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: isAdmin ? ClayColors.primary : ClayColors.textMuted,
                  ),
                ),
                const SizedBox(width: 6),
                Text(
                  _formatTime(msg.createdAt),
                  style: const TextStyle(fontSize: 10, color: ClayColors.textSubtle),
                ),
              ],
            ),
          ),
          Container(
            constraints: BoxConstraints(
              maxWidth: MediaQuery.of(context).size.width * 0.78,
            ),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: isAdmin
                ? BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [ClayColors.primaryGradientStart, ClayColors.primaryGradientEnd],
                    ),
                    borderRadius: const BorderRadius.only(
                      topLeft: Radius.circular(18),
                      topRight: Radius.circular(4),
                      bottomLeft: Radius.circular(18),
                      bottomRight: Radius.circular(18),
                    ),
                    boxShadow: const [
                      BoxShadow(
                        color: Color(0x204D41DF),
                        offset: Offset(0, 4),
                        blurRadius: 10,
                      ),
                    ],
                  )
                : BoxDecoration(
                    color: Colors.white,
                    borderRadius: const BorderRadius.only(
                      topLeft: Radius.circular(4),
                      topRight: Radius.circular(18),
                      bottomLeft: Radius.circular(18),
                      bottomRight: Radius.circular(18),
                    ),
                    border: Border.all(color: ClayColors.borderLight),
                    boxShadow: const [
                      BoxShadow(
                        color: Color(0x0A4D41DF),
                        offset: Offset(0, 2),
                        blurRadius: 8,
                      ),
                    ],
                  ),
            child: Text(
              msg.content,
              style: TextStyle(
                fontSize: 14,
                color: isAdmin ? Colors.white : ClayColors.textDark,
                height: 1.35,
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _formatTime(String raw) {
    if (raw.isEmpty) return '';
    try {
      final dt = DateTime.parse(raw).toLocal();
      final hour = dt.hour % 12 == 0 ? 12 : dt.hour % 12;
      final minute = dt.minute.toString().padLeft(2, '0');
      final period = dt.hour >= 12 ? 'PM' : 'AM';
      return '$hour:$minute $period';
    } catch (_) {
      return '';
    }
  }
}
