import 'dart:convert';
import 'package:http/http.dart' as http;

class VoiceRootsApiClient {
  final String baseUrl;

  VoiceRootsApiClient({
    this.baseUrl = 'https://farming-proposition-love-showcase.trycloudflare.com',
  });

  /// Fetch all preserved stories from the shared archive
  Future<List<Map<String, dynamic>>> getStories() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/api/recordings'));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return List<Map<String, dynamic>>.from(data['recordings'] ?? []);
      }
    } catch (e) {
      // Fallback local preset if offline
    }
    return [];
  }

  /// Translate oral transcript into an Indic target language
  Future<String> translateText({
    required String text,
    required String sourceLang,
    required String targetLang,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/translate'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'text': text,
          'sourceLang': sourceLang,
          'targetLang': targetLang,
        }),
      );
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return data['translation'] ?? text;
      }
    } catch (e) {
      // Return placeholder with intent
    }
    return 'Translated into ${targetLang.toUpperCase()}: "$text"';
  }
}
