# VOICE ROOTS — FIRST USER TEST GUIDE (v1.0.0-rc1)

Welcome to the Voice Roots First User Testing Cohort.  
**Purpose**: Validate whether a first-time contributor can record/upload, verify, and preserve an oral heritage recording without external assistance.

---

## 🌐 Live Access Details
- **Public HTTPS Portal**: [https://village-meat-bracelets-nova.trycloudflare.com](https://village-meat-bracelets-nova.trycloudflare.com)
- **Local Network (Wi-Fi)**: `http://192.168.1.12:3000`
- **Platform**: Responsive Web (Desktop, Tablet, Mobile Web)

---

## 🎯 The Tester Mission
> **"Preserve one oral story, traditional song, or community memory from start to finish."**

### 14-Step Test Journey
1. **Register / Sign In**: Visit `/register` or `/login` and create a contributor profile.
2. **Explore Archive**: Visit `/archive` or `/explore` to browse existing oral heritage cards.
3. **Open a Story**: Select an existing recording (e.g., *Sacred Monsoon Invocation Chants*).
4. **Listen to Original Master**: Play the lossless original recording in its authentic spoken tongue.
5. **Preserve a Voice**: Click **Preserve** in the navigation bar to start the workflow.
6. **Record / Upload**: Upload an audio file (MP3/WAV/M4A) or record with your microphone.
7. **Select Geographic Hierarchy**: Use the cascading pickers:
   $$\text{India} \longrightarrow \text{State} \longrightarrow \text{District} \longrightarrow \text{Mandal/Taluk} \longrightarrow \text{Village} \longrightarrow \text{Community}$$
8. **Confirm Source Language**: Review the AI-suggested language and click **[Accept]** or **[Change Language]**.
9. **Review AI Transcript**: Inspect the generated phonetic transcript in the native script.
10. **Translate & Generate Speech**:
    - Select a target language (English, Telugu, Hindi, Tamil, Kannada, Malayalam).
    - Review translated text.
    - Play the newly synthesized target-language audio track in the **DualTrackAudioPlayer**.
11. **Cultural Context Review**: Review the AI-assisted cultural significance analysis.
12. **Informed Consent**: Select your desired archival permissions and access level (`public`, `community`, `private`).
13. **Human Review & Verification**: Submit the recording for elder/reviewer validation.
14. **Heritage Record & Passport**: View the cryptographically verified **Heritage Passport** with QR token.

---

## 📝 10 Tester Feedback Questions
Please submit your answers after completing the journey:

1. **First Impression**: What was the first action you wanted to take upon opening the website?
2. **Clarity**: Was it immediately obvious where and how to start preserving a voice?
3. **Audio Capture**: Was the Record/Upload process straightforward and dependable?
4. **Geography & Language**: Was selecting your State, District, Mandal, and Language intuitive?
5. **Source Inviolability**: Did you understand that your original recording is preserved permanently and never replaced?
6. **Transcript Quality**: Was the phonetic transcript easy to read and review?
7. **Translation & Audio**: Did the dual-track player make the difference between the original voice and translated speech clear?
8. **Informed Consent**: Did the consent controls make you feel in control of your cultural content?
9. **Friction Points**: Did you feel confused or stuck at any stage of the workflow?
10. **Trust**: Would you trust Voice Roots with an irreplaceable family or community oral recording?

---

## 🔒 Golden Verification Invariants
- **Original Language** $\ne$ **Translation Language** $\ne$ **UI Language**.
- **Original Audio** is permanent and never overwritten by synthetic TTS audio.
- The archive card always displays the authentic origin:
  $$\text{TELUGU} \cdot \text{GUNTUR, ANDHRA PRADESH, INDIA}$$

