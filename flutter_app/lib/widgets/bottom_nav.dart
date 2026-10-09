import 'package:flutter/material.dart';
import '../app/theme.dart';

class VoiceRootsBottomNav extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onChanged;

  const VoiceRootsBottomNav({
    super.key,
    required this.currentIndex,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Container(
        margin: const EdgeInsets.fromLTRB(16, 0, 16, 12),
        padding: const EdgeInsets.all(7),
        decoration: BoxDecoration(
          color: VoiceRootsColors.backgroundDeep.withOpacity(0.92),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
            color: Colors.white.withOpacity(0.14),
          ),
          boxShadow: const [
            BoxShadow(
              blurRadius: 30,
              offset: Offset(0, 12),
              color: Color(0x66000000),
            ),
          ],
        ),
        child: Row(
          children: [
            _item(Icons.home_outlined, 'Home', 0),
            _item(Icons.explore_outlined, 'Explore', 1),
            _preserve(),
            _item(Icons.archive_outlined, 'Archive', 3),
            _item(Icons.person_outline, 'Profile', 4),
          ],
        ),
      ),
    );
  }

  Widget _item(IconData icon, String label, int index) {
    final active = currentIndex == index;
    return Expanded(
      child: GestureDetector(
        onTap: () => onChanged(index),
        child: Container(
          height: 52,
          decoration: BoxDecoration(
            color: active
                ? VoiceRootsColors.peach.withOpacity(0.18)
                : Colors.transparent,
            borderRadius: BorderRadius.circular(18),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                color: active ? VoiceRootsColors.peach : VoiceRootsColors.textMuted,
                size: 21,
              ),
              const SizedBox(height: 3),
              Text(
                label,
                style: TextStyle(
                  color: active ? VoiceRootsColors.peach : VoiceRootsColors.textMuted,
                  fontSize: 10,
                  fontWeight: active ? FontWeight.bold : FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _preserve() {
    return SizedBox(
      width: 60,
      child: Transform.translate(
        offset: const Offset(0, -14),
        child: GestureDetector(
          onTap: () => onChanged(2),
          child: Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: VoiceRootsColors.peach,
              shape: BoxShape.circle,
              border: Border.all(
                color: VoiceRootsColors.background,
                width: 4,
              ),
              boxShadow: [
                BoxShadow(
                  color: VoiceRootsColors.peach.withOpacity(0.35),
                  blurRadius: 16,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: const Icon(
              Icons.mic_none,
              color: VoiceRootsColors.backgroundDeep,
              size: 26,
            ),
          ),
        ),
      ),
    );
  }
}

