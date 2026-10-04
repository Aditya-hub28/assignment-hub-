import 'package:flutter_test/flutter_test.dart';
import 'package:assignmenthub_admin/main.dart';
import 'package:assignmenthub_admin/core/auth/auth_provider.dart';

void main() {
  testWidgets('AssignmentHub Admin App smoke test', (WidgetTester tester) async {
    final authProvider = AuthProvider();
    await tester.pumpWidget(AssignmentHubAdminApp(authProvider: authProvider));
    expect(find.text('AssignmentHub Admin'), findsWidgets);
  });
}
