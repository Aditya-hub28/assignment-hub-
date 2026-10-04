import 'package:flutter_test/flutter_test.dart';
import 'package:assignmenthub_admin/data/models/admin_user.dart';
import 'package:assignmenthub_admin/data/models/admin_stats.dart';
import 'package:assignmenthub_admin/data/models/service_request.dart';
import 'package:assignmenthub_admin/data/models/inquiry.dart';
import 'package:assignmenthub_admin/data/models/student_user.dart';

void main() {
  group('AdminUser Model', () {
    test('parses admin user correctly and checks isAdmin flag', () {
      final user = AdminUser.fromJson({
        'id': 'user-123',
        'email': 'adityacareer12@gmail.com',
        'role': 'admin',
        'fullName': 'Aditya Jha',
        'mobile': '+91 9876543210',
      }, token: 'jwt-token-xyz');

      expect(user.id, 'user-123');
      expect(user.email, 'adityacareer12@gmail.com');
      expect(user.isAdmin, isTrue);
      expect(user.accessToken, 'jwt-token-xyz');
    });

    test('rejects student role in isAdmin', () {
      final user = AdminUser.fromJson({
        'id': 'student-1',
        'email': 'student@college.edu',
        'role': 'student',
      });
      expect(user.isAdmin, isFalse);
    });
  });

  group('AdminStats Model', () {
    test('parses backend stats json correctly', () {
      final stats = AdminStats.fromJson({
        'totalRequests': 42,
        'pendingReview': 12,
        'inProgress': 18,
        'completedDelivered': 10,
        'urgentRequests': 3,
        'activeInquiries': 5,
        'totalStudents': 80,
      });

      expect(stats.totalRequests, 42);
      expect(stats.pendingReview, 12);
      expect(stats.inProgress, 18);
      expect(stats.completedDelivered, 10);
      expect(stats.urgentRequests, 3);
      expect(stats.activeInquiries, 5);
      expect(stats.totalStudents, 80);
    });
  });

  group('ServiceRequest Model', () {
    test('parses request with files and service display name', () {
      final req = ServiceRequest.fromJson({
        'id': 'REQ-20261004-001',
        'userId': 'usr-1',
        'userName': 'Rahul Sharma',
        'userEmail': 'rahul@gmail.com',
        'service': 'custom_development',
        'isCustom': true,
        'customServiceName': 'AI Microcontroller Simulation',
        'title': 'IoT Final Year Project',
        'subject': 'Embedded Systems',
        'description': 'Need full code and circuit schematic.',
        'deadline': '2026-10-10',
        'status': 'in_progress',
        'statusLabel': 'In Progress',
        'progress': 60,
        'inquiryId': 'INQ-REQ-20261004-001',
        'createdAt': '2026-10-04T12:00:00Z',
        'files': [
          {
            'filename': 'schematic.pdf',
            'originalName': 'circuit_v1.pdf',
            'size': 1024 * 512,
            'signedUrl': 'https://rapuciel.supabase.co/storage/v1/object/sign/service-request-files/...',
          }
        ]
      });

      expect(req.id, 'REQ-20261004-001');
      expect(req.serviceDisplayName, 'AI Microcontroller Simulation');
      expect(req.files.length, 1);
      expect(req.files.first.displayName, 'circuit_v1.pdf');
      expect(req.files.first.formattedSize, '512.0 KB');
      expect(req.inquiryId, 'INQ-REQ-20261004-001');
    });
  });

  group('Inquiry and Messages Model', () {
    test('parses inquiry thread with messages', () {
      final inq = Inquiry.fromJson({
        'id': 'inq-99',
        'requestId': 'REQ-20261004-001',
        'userId': 'usr-1',
        'userEmail': 'rahul@gmail.com',
        'userName': 'Rahul Sharma',
        'title': 'Clarification on schematic',
        'subject': 'Embedded Systems',
        'service': 'custom_development',
        'status': 'open',
        'statusLabel': 'Open',
        'assignedSpecialist': 'Admin Desk',
        'unreadCount': 1,
        'createdAt': '2026-10-04T12:05:00Z',
        'messages': [
          {
            'id': 'msg-1',
            'inquiryId': 'inq-99',
            'senderRole': 'student',
            'senderName': 'Rahul Sharma',
            'content': 'Should I use Arduino or ESP32?',
            'attachments': [],
            'createdAt': '2026-10-04T12:06:00Z'
          },
          {
            'id': 'msg-2',
            'inquiryId': 'inq-99',
            'senderRole': 'admin',
            'senderName': 'Admin Desk',
            'content': 'ESP32 is recommended for WiFi support.',
            'attachments': [],
            'createdAt': '2026-10-04T12:10:00Z'
          }
        ]
      });

      expect(inq.id, 'inq-99');
      expect(inq.messages.length, 2);
      expect(inq.messages[0].isAdmin, isFalse);
      expect(inq.messages[1].isAdmin, isTrue);
    });
  });

  group('StudentUser and AcademicProfile Model', () {
    test('parses 6-cell academic profile and student initials', () {
      final student = StudentUser.fromJson({
        'id': 'student-uuid',
        'fullName': 'Aditya Jha',
        'email': 'aditya@student.ac.in',
        'mobile': '+91 9988776655',
        'role': 'student',
        'college': {
          'id': 'col-1',
          'name': 'Government Engineering College',
          'code': 'GEC01'
        },
        'academicProfile': {
          'branch': 'Computer Science & Engineering',
          'year': 'Final Year (4th)',
          'semester': 'Semester 8',
          'division': 'A',
          'rollNo': 'CS2026-042',
        },
        'stats': {
          'totalRequests': 5,
          'totalInquiries': 3,
        }
      });

      expect(student.fullName, 'Aditya Jha');
      expect(student.initials, 'AJ');
      expect(student.totalRequests, 5);
      expect(student.totalInquiries, 3);
      expect(student.academicProfile?.branch, 'Computer Science & Engineering');
      expect(student.academicProfile?.rollNo, 'CS2026-042');
      expect(student.academicProfile?.isEmpty, isFalse);
    });
  });
}
