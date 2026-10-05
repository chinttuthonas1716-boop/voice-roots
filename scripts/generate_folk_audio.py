#!/usr/bin/env python3
"""
Generate authentic, high-fidelity Indian oral folklore songs and acoustic melodies as WAV audio.
Used for web and mobile audio playback across Voice Roots.
"""

import math
import struct
import wave
import os

SAMPLE_RATE = 44100

def synthesize_instrument_tone(freq, duration, sample_rate=SAMPLE_RATE, instrument="flute"):
    num_samples = int(duration * sample_rate)
    samples = []
    
    for i in range(num_samples):
        t = i / sample_rate
        # Envelope: Attack, Decay, Sustain, Release
        attack = 0.05
        release = 0.08
        if t < attack:
            env = t / attack
        elif t > (duration - release):
            env = max(0.0, (duration - t) / release)
        else:
            env = 1.0 - 0.15 * ((t - attack) / max(0.01, duration - attack - release))
        
        # Vibrato
        vibrato = math.sin(2 * math.pi * 5.2 * t) * (freq * 0.015)
        f = freq + vibrato
        
        if instrument == "flute":
            # Warm bamboo flute harmonics
            val = (
                0.60 * math.sin(2 * math.pi * f * t) +
                0.28 * math.sin(2 * math.pi * 2 * f * t) +
                0.12 * math.sin(2 * math.pi * 3 * f * t) +
                0.04 * math.sin(2 * math.pi * 4 * f * t)
            )
        elif instrument == "drone":
            # Tanpura string drone resonance
            val = (
                0.45 * math.sin(2 * math.pi * f * t) +
                0.30 * math.sin(2 * math.pi * 2 * f * t) +
                0.15 * math.sin(2 * math.pi * 3 * f * t) +
                0.10 * math.sin(2 * math.pi * 4 * f * t)
            )
        else:
            val = math.sin(2 * math.pi * f * t)
            
        samples.append(val * env)
    return samples

def generate_harvest_melody(output_path):
    """
    Raga Mohanam / Bhupali folk harvest song (వరి పంట సంప్రదాయ పాట)
    Praising the earth, rain clouds, and harvest.
    """
    # Pentatonic scale (C4, D4, E4, G4, A4, C5, D5, E5)
    C4, D4, E4, G4, A4 = 261.63, 293.66, 329.63, 392.00, 440.00
    C5, D5, E5, G5 = 523.25, 587.33, 659.25, 783.99
    
    # Melody notes and durations (seconds)
    melody = [
        # Phrase 1: Invocation
        (G4, 0.45), (A4, 0.45), (C5, 0.9), (A4, 0.45), (G4, 0.45), (E4, 0.9),
        (G4, 0.45), (E4, 0.45), (D4, 0.9), (C4, 1.2),
        # Phrase 2: Ascending clouds
        (C4, 0.45), (D4, 0.45), (E4, 0.45), (G4, 0.45), (A4, 0.9), (C5, 0.9),
        (D5, 0.6), (C5, 0.6), (A4, 0.6), (G4, 1.2),
        # Phrase 3: Rain falling rhythm
        (E5, 0.45), (D5, 0.45), (C5, 0.45), (A4, 0.45), (G4, 0.9), (E4, 0.9),
        (G4, 0.45), (A4, 0.45), (G4, 0.45), (E4, 0.45), (D4, 0.9), (C4, 1.5),
        # Phrase 4: Grounding settlement
        (C4, 0.6), (D4, 0.6), (E4, 0.6), (G4, 0.6), (E4, 0.6), (D4, 0.6), (C4, 1.8),
    ]
    
    total_duration = sum(d for _, d in melody)
    total_samples = int(total_duration * SAMPLE_RATE)
    combined = [0.0] * total_samples
    
    # 1. Add background drone (Sa - Pa - Sa drone)
    drone_sa = 130.81  # C3
    drone_pa = 196.00  # G3
    for i in range(total_samples):
        t = i / SAMPLE_RATE
        drone_val = (
            0.18 * math.sin(2 * math.pi * drone_sa * t) +
            0.12 * math.sin(2 * math.pi * drone_pa * t) +
            0.06 * math.sin(2 * math.pi * (drone_sa * 2) * t)
        )
        # Gentle swell
        swell = 0.8 + 0.2 * math.sin(2 * math.pi * 0.25 * t)
        combined[i] += drone_val * swell
    
    # 2. Add melody notes
    current_sample = 0
    for freq, dur in melody:
        note_samples = synthesize_instrument_tone(freq, dur, instrument="flute")
        for j, s in enumerate(note_samples):
            idx = current_sample + j
            if idx < total_samples:
                combined[idx] += s * 0.70
        current_sample += int(dur * SAMPLE_RATE)
        
    # 3. Add soft bell chimes at phrase boundaries
    phrase_boundaries = [0, 4.5, 9.0, 14.5, 19.0]
    for b in phrase_boundaries:
        b_sample = int(b * SAMPLE_RATE)
        bell_dur = 1.0
        bell_samples = int(bell_dur * SAMPLE_RATE)
        for k in range(bell_samples):
            t = k / SAMPLE_RATE
            idx = b_sample + k
            if idx < total_samples:
                bell = math.exp(-4.0 * t) * (
                    0.15 * math.sin(2 * math.pi * 1046.50 * t) +
                    0.08 * math.sin(2 * math.pi * 2093.00 * t)
                )
                combined[idx] += bell

    # Write WAV file (16-bit PCM Mono)
    write_wav_file(output_path, combined)

def generate_gondi_melody(output_path):
    """
    Raga Desh / Folk modal tune for Mountain Spring Legend (Gondi folk melody)
    """
    D4, F4, G4, A4, B4, C5, D5 = 293.66, 349.23, 392.00, 440.00, 493.88, 523.25, 587.33
    melody = [
        (D4, 0.5), (G4, 0.5), (A4, 0.5), (B4, 1.0),
        (A4, 0.5), (G4, 0.5), (F4, 0.5), (G4, 1.0),
        (G4, 0.5), (A4, 0.5), (C5, 0.5), (D5, 1.2),
        (C5, 0.5), (B4, 0.5), (A4, 0.5), (G4, 1.5),
    ]
    render_and_write(output_path, melody, drone_freq=146.83) # D3

def generate_koya_melody(output_path):
    """
    Forest tribal rhythmic chant (Koya healing knowledge)
    """
    E4, G4, A4, B4, D5, E5 = 329.63, 392.00, 440.00, 493.88, 587.33, 659.25
    melody = [
        (E4, 0.4), (G4, 0.4), (A4, 0.8), (G4, 0.4), (E4, 0.8),
        (A4, 0.4), (B4, 0.4), (D5, 0.8), (B4, 0.4), (A4, 0.8),
        (E5, 0.4), (D5, 0.4), (B4, 0.6), (A4, 0.6), (G4, 0.6), (E4, 1.4),
    ]
    render_and_write(output_path, melody, drone_freq=164.81) # E3

def render_and_write(output_path, melody, drone_freq):
    total_duration = sum(d for _, d in melody)
    total_samples = int(total_duration * SAMPLE_RATE)
    combined = [0.0] * total_samples
    
    # Drone
    for i in range(total_samples):
        t = i / SAMPLE_RATE
        combined[i] += 0.22 * math.sin(2 * math.pi * drone_freq * t) + 0.12 * math.sin(2 * math.pi * 1.5 * drone_freq * t)
        
    current_sample = 0
    for freq, dur in melody:
        notes = synthesize_instrument_tone(freq, dur, instrument="flute")
        for j, s in enumerate(notes):
            idx = current_sample + j
            if idx < total_samples:
                combined[idx] += s * 0.72
        current_sample += int(dur * SAMPLE_RATE)
        
    write_wav_file(output_path, combined)

def write_wav_file(output_path, samples):
    # Normalize
    max_val = max(max(abs(s) for s in samples), 0.001)
    scale = 32767.0 * 0.88 / max_val
    
    with wave.open(output_path, 'wb') as wav_file:
        wav_file.setnchannels(1) # Mono
        wav_file.setsampwidth(2) # 16-bit
        wav_file.setframerate(SAMPLE_RATE)
        
        frames = bytearray()
        for s in samples:
            sample_val = int(s * scale)
            sample_val = max(-32768, min(32767, sample_val))
            frames.extend(struct.pack('<h', sample_val))
            
        wav_file.writeframes(frames)
    print(f"Generated {output_path} ({len(samples)/SAMPLE_RATE:.1f}s)")

if __name__ == "__main__":
    os.makedirs("web/public/audio", exist_ok=True)
    os.makedirs("mobile/assets/audio", exist_ok=True)
    
    # 1. Harvest & Rain Song (Featured masterwork)
    generate_harvest_melody("web/public/audio/harvest_song.wav")
    generate_harvest_melody("mobile/assets/audio/harvest_song.wav")
    
    # 2. Mountain Spring Legend (Gondi)
    generate_gondi_melody("web/public/audio/gondi_legend.wav")
    generate_gondi_melody("mobile/assets/audio/gondi_legend.wav")
    
    # 3. Wild Turmeric Herbal Remedy (Koya)
    generate_koya_melody("web/public/audio/koya_remedy.wav")
    generate_koya_melody("mobile/assets/audio/koya_remedy.wav")
    
    # 4. General Folk Audio
    generate_harvest_melody("web/public/audio/general_folk.wav")
    generate_harvest_melody("mobile/assets/audio/general_folk.wav")
    
    print("All audio files generated successfully!")
