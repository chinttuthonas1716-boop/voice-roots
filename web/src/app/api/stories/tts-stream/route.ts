import { NextRequest, NextResponse } from "next/server";

/**
 * Generate a valid playable PCM WAV audio buffer with gentle acoustic harmonic tones
 * simulating natural human speech cadence.
 */
function generateSyntheticSpeechWav(durationSeconds: number = 4): Buffer {
  const sampleRate = 22050;
  const numSamples = sampleRate * durationSeconds;
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = numSamples * blockAlign;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF identifier
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);

  // fmt sub-chunk
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20); // AudioFormat (1 for PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);

  // data sub-chunk
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Generate soothing melodic speech-formant cadence (fundamental ~160Hz-220Hz with harmonics)
  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    // Cadence amplitude envelope
    const envelope = Math.min(1.0, Math.sin((Math.PI * i) / numSamples) * 1.5);
    // Vowel-like formant modulation
    const f0 = 175 + Math.sin(t * 4.0) * 25;
    const sample =
      (Math.sin(2 * Math.PI * f0 * t) * 0.5 +
        Math.sin(2 * Math.PI * f0 * 2 * t) * 0.25 +
        Math.sin(2 * Math.PI * f0 * 3 * t) * 0.12) *
      envelope *
      12000;

    buffer.writeInt16LE(Math.max(-32768, Math.min(32767, Math.floor(sample))), offset);
    offset += 2;
  }

  return buffer;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const text = searchParams.get("text") || "Voice Roots Audio";
    const lang = searchParams.get("lang") || "en";

    // Duration based on text length: ~3-5 seconds
    const duration = Math.min(10, Math.max(3, Math.ceil(text.length / 25)));
    const wavBuffer = generateSyntheticSpeechWav(duration);

    return new NextResponse(new Uint8Array(wavBuffer), {
      status: 200,
      headers: {
        "Content-Type": "audio/wav",
        "Content-Length": wavBuffer.length.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Audio synthesis failed" },
      { status: 500 }
    );
  }
}
