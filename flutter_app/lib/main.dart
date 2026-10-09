import 'package:flutter/material.dart';
import 'app/theme.dart';
import 'core/api/api_client.dart';

void main() {
  runApp(const VoiceRootsApp());
}

class VoiceRootsApp extends StatelessWidget {
  const VoiceRootsApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Voice Roots',
      debugShowCheckedModeBanner: false,
      theme: VoiceRootsTheme.darkTheme,
      home: const MainNavigationShell(),
    );
  }
}

class MainNavigationShell extends StatefulWidget {
  const MainNavigationShell({super.key});

  @override
  State<MainNavigationShell> createState() => _MainNavigationShellState();
}

class _MainNavigationShellState extends State<MainNavigationShell> {
  int _currentIndex = 0;
  bool _isLoggedIn = false;
  String _userName = "Guest Explorer";
  String _userRole = "guest";

  void _handleLoginSuccess(String name, String role) {
    setState(() {
      _isLoggedIn = true;
      _userName = name;
      _userRole = role;
    });
  }

  @override
  Widget build(BuildContext context) {
    final screens = [
      HomeScreen(
        isLoggedIn: _isLoggedIn,
        userName: _userName,
        onOpenLogin: () => _showLoginModal(context),
      ),
      const ExploreScreen(),
      const RecordStudioScreen(),
      const SavedArchiveScreen(),
      ProfileScreen(
        isLoggedIn: _isLoggedIn,
        userName: _userName,
        userRole: _userRole,
        onOpenLogin: () => _showLoginModal(context),
        onLogout: () => setState(() {
          _isLoggedIn = false;
          _userName = "Guest Explorer";
          _userRole = "guest";
        }),
      ),
    ];

    return Scaffold(
      body: screens[_currentIndex],
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: const Color(0xE6080A12),
          border: Border(
            top: BorderSide(color: Colors.white.withOpacity(0.08)),
          ),
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (index) => setState(() => _currentIndex = index),
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.home_outlined),
              activeIcon: Icon(Icons.home),
              label: 'Home',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.explore_outlined),
              activeIcon: Icon(Icons.explore),
              label: 'Explore',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.mic_none, color: VoiceRootsTheme.warmAmber),
              activeIcon: Icon(Icons.mic, color: VoiceRootsTheme.warmAmber),
              label: 'Record',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.bookmark_border),
              activeIcon: Icon(Icons.bookmark),
              label: 'Saved',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.person_outline),
              activeIcon: Icon(Icons.person),
              label: 'Profile',
            ),
          ],
        ),
      ),
    );
  }

  void _showLoginModal(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => FlutterLoginSheet(
        onSuccess: (name, role) {
          Navigator.pop(ctx);
          _handleLoginSuccess(name, role);
        },
      ),
    );
  }
}

// -------------------------------------------------------------
// FLUTTER LOGIN BOTTOM SHEET (70% Heritage + 30% Futuristic Glass)
// -------------------------------------------------------------
class FlutterLoginSheet extends StatefulWidget {
  final Function(String name, String role) onSuccess;

  const FlutterLoginSheet({super.key, required this.onSuccess});

  @override
  State<FlutterLoginSheet> createState() => _FlutterLoginSheetState();
}

class _FlutterLoginSheetState extends State<FlutterLoginSheet> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  bool _obscurePassword = true;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
        left: 20,
        right: 20,
        top: 24,
      ),
      decoration: BoxDecoration(
        color: const Color(0xFF0C0F1C),
        borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
        border: Border.all(color: Colors.white.withOpacity(0.12)),
      ),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 18),
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: VoiceRootsTheme.warmAmber.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: VoiceRootsTheme.warmAmber.withOpacity(0.4)),
                  ),
                  child: const Text('🌱', style: TextStyle(fontSize: 20)),
                ),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: const [
                    Text('Voice Roots Login', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                    Text('Preserve voices. Discover heritage.', style: TextStyle(color: VoiceRootsTheme.secondaryText, fontSize: 11)),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 24),

            // PRIMARY: CONTINUE WITH GOOGLE
            ElevatedButton(
              onPressed: () {
                widget.onSuccess("Cultural Contributor (Google)", "contributor");
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.white.withOpacity(0.1),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                  side: BorderSide(color: Colors.white.withOpacity(0.2)),
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: const [
                  Text('G', style: TextStyle(color: Colors.amber, fontWeight: FontWeight.w900, fontSize: 16)),
                  SizedBox(width: 10),
                  Text('Continue with Google', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // ── OR ── Divider
            Row(
              children: [
                Expanded(child: Divider(color: Colors.white.withOpacity(0.1))),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  child: Text('OR', style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 10, fontWeight: FontWeight.bold)),
                ),
                Expanded(child: Divider(color: Colors.white.withOpacity(0.1))),
              ],
            ),
            const SizedBox(height: 16),

            // Email Field
            TextField(
              controller: _emailController,
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: InputDecoration(
                labelText: 'Email',
                labelStyle: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 12),
                hintText: 'your@email.com',
                hintStyle: TextStyle(color: Colors.white.withOpacity(0.2)),
                filled: true,
                fillColor: Colors.white.withOpacity(0.04),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: Colors.white.withOpacity(0.1))),
                enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: Colors.white.withOpacity(0.1))),
              ),
            ),
            const SizedBox(height: 12),

            // Password Field
            TextField(
              controller: _passwordController,
              obscureText: _obscurePassword,
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: InputDecoration(
                labelText: 'Password',
                labelStyle: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 12),
                hintText: '•••••••••••••••',
                hintStyle: TextStyle(color: Colors.white.withOpacity(0.2)),
                filled: true,
                fillColor: Colors.white.withOpacity(0.04),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: Colors.white.withOpacity(0.1))),
                enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: Colors.white.withOpacity(0.1))),
                suffixIcon: IconButton(
                  icon: Icon(_obscurePassword ? Icons.visibility_outlined : Icons.visibility_off_outlined, color: Colors.white.withOpacity(0.4), size: 18),
                  onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Sign In Button
            ElevatedButton(
              onPressed: () {
                final mail = _emailController.text.trim();
                widget.onSuccess(mail.isNotEmpty ? mail.split('@')[0] : "Verified Custodian", "contributor");
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: VoiceRootsTheme.warmAmber,
                foregroundColor: Colors.black,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
              child: const Text('Sign In →', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
            ),
            const SizedBox(height: 12),

            // Continue as Guest Button
            TextButton(
              onPressed: () {
                widget.onSuccess("Guest Explorer", "guest");
              },
              child: const Text('Continue as Guest →', style: TextStyle(color: VoiceRootsTheme.heritageTeal, fontSize: 12, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }
}

// -------------------------------------------------------------
// 1. HOME SCREEN (With Offline Telemetry & Preservation Timeline)
// -------------------------------------------------------------
class HomeScreen extends StatelessWidget {
  final bool isLoggedIn;
  final String userName;
  final VoidCallback onOpenLogin;

  const HomeScreen({
    super.key,
    required this.isLoggedIn,
    required this.userName,
    required this.onOpenLogin,
  });

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          // Header Row with Offline-First Badge & Auth Indicator
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Voice Roots',
                    style: TextStyle(
                      color: VoiceRootsTheme.warmIvory,
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    isLoggedIn ? 'Signed in as $userName' : 'Every story deserves to survive',
                    style: const TextStyle(
                      color: VoiceRootsTheme.secondaryText,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
              Row(
                children: [
                  // Offline-First Sync Telemetry Badge
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.06),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.white.withOpacity(0.12)),
                    ),
                    child: Row(
                      children: const [
                        CircleAvatar(radius: 3.5, backgroundColor: Color(0xFF10B981)),
                        SizedBox(width: 5),
                        Text('Synced', style: TextStyle(color: Color(0xFF10B981), fontSize: 10, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton(
                    icon: Icon(
                      isLoggedIn ? Icons.account_circle : Icons.login,
                      color: VoiceRootsTheme.warmAmber,
                    ),
                    onPressed: onOpenLogin,
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 20),

          // Cinematic Featured Story Card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  VoiceRootsTheme.surfaceIndigo,
                  const Color(0xFF0B0E1E),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: VoiceRootsTheme.warmAmber.withOpacity(0.3)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: VoiceRootsTheme.warmAmber.withOpacity(0.18),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: VoiceRootsTheme.warmAmber.withOpacity(0.4)),
                      ),
                      child: const Text('Featured Oral Story', style: TextStyle(color: VoiceRootsTheme.warmAmber, fontSize: 11, fontWeight: FontWeight.bold)),
                    ),
                    const Text('VR-2026-0001', style: TextStyle(color: VoiceRootsTheme.secondaryText, fontSize: 11, fontFamily: 'monospace')),
                  ],
                ),
                const SizedBox(height: 14),
                const Text('The Harvest Song & River Prayer', style: TextStyle(color: VoiceRootsTheme.warmIvory, fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                const Text('Telugu • Andhra Pradesh • Human Verified ✓', style: TextStyle(color: VoiceRootsTheme.heritageTeal, fontSize: 12, fontWeight: FontWeight.w600)),
                const SizedBox(height: 16),

                // Preservation Timeline Miniature in Mobile
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.3),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: Colors.white.withOpacity(0.06)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text('PRESERVATION TIMELINE', style: TextStyle(color: VoiceRootsTheme.secondaryText, fontSize: 9, fontWeight: FontWeight.w800, letterSpacing: 1.0)),
                      SizedBox(height: 6),
                      Text('Audio Captured → Telugu Detected → Transcribed → 13+ Translated → Elder Verified → Heritage Passport Issued', style: TextStyle(color: Colors.white, fontSize: 10, height: 1.4)),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                Row(
                  children: [
                    ElevatedButton.icon(
                      onPressed: () {},
                      icon: const Icon(Icons.play_arrow, size: 18, color: Colors.black),
                      label: const Text('Listen Now', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 12)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: VoiceRootsTheme.warmAmber,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                      ),
                    ),
                    const SizedBox(width: 12),
                    OutlinedButton.icon(
                      onPressed: () {},
                      icon: const Icon(Icons.qr_code, size: 16, color: VoiceRootsTheme.heritageTeal),
                      label: const Text('Passport', style: TextStyle(color: VoiceRootsTheme.heritageTeal, fontSize: 12)),
                      style: OutlinedButton.styleFrom(
                        side: BorderSide(color: VoiceRootsTheme.heritageTeal.withOpacity(0.4)),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }
}

// -------------------------------------------------------------
// 2. EXPLORE SCREEN
// -------------------------------------------------------------
class ExploreScreen extends StatelessWidget {
  const ExploreScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const SafeArea(
      child: Center(
        child: Text('Explore Indigenous Oral Archive', style: TextStyle(color: VoiceRootsTheme.warmIvory)),
      ),
    );
  }
}

// -------------------------------------------------------------
// 3. RECORD STUDIO SCREEN
// -------------------------------------------------------------
class RecordStudioScreen extends StatelessWidget {
  const RecordStudioScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 90,
              height: 90,
              decoration: BoxDecoration(
                color: VoiceRootsTheme.warmAmber.withOpacity(0.2),
                shape: BoxShape.circle,
                border: Border.all(color: VoiceRootsTheme.warmAmber, width: 2),
              ),
              child: const Icon(Icons.mic, size: 42, color: VoiceRootsTheme.warmAmber),
            ),
            const SizedBox(height: 20),
            const Text('Tap to Record', style: TextStyle(color: VoiceRootsTheme.warmIvory, fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            const Text('48kHz lossless master acoustic encoding', style: TextStyle(color: VoiceRootsTheme.secondaryText, fontSize: 12)),
          ],
        ),
      ),
    );
  }
}

// -------------------------------------------------------------
// 4. SAVED ARCHIVE SCREEN
// -------------------------------------------------------------
class SavedArchiveScreen extends StatelessWidget {
  const SavedArchiveScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const SafeArea(
      child: Center(
        child: Text('Saved Oral Tradition Records', style: TextStyle(color: VoiceRootsTheme.warmIvory)),
      ),
    );
  }
}

// -------------------------------------------------------------
// 5. PROFILE SCREEN
// -------------------------------------------------------------
class ProfileScreen extends StatelessWidget {
  final bool isLoggedIn;
  final String userName;
  final String userRole;
  final VoidCallback onOpenLogin;
  final VoidCallback onLogout;

  const ProfileScreen({
    super.key,
    required this.isLoggedIn,
    required this.userName,
    required this.userRole,
    required this.onOpenLogin,
    required this.onLogout,
  });

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Heritage Custodian Profile', style: TextStyle(color: VoiceRootsTheme.warmIvory, fontSize: 22, fontWeight: FontWeight.bold)),
            const SizedBox(height: 20),
            if (isLoggedIn) ...[
              Text(userName, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
              Text('Role: $userRole', style: const TextStyle(color: VoiceRootsTheme.heritageTeal, fontSize: 13)),
              const Spacer(),
              ElevatedButton(
                onPressed: onLogout,
                style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent.withOpacity(0.2)),
                child: const Text('Log Out', style: TextStyle(color: Colors.redAccent)),
              ),
            ] else ...[
              const Text('Not logged in. Sign in to contribute and manage recordings.', style: TextStyle(color: VoiceRootsTheme.secondaryText, fontSize: 13)),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: onOpenLogin,
                style: ElevatedButton.styleFrom(backgroundColor: VoiceRootsTheme.warmAmber),
                child: const Text('Sign In →', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
