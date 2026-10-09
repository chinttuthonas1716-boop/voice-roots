import Link from "next/link";

interface VoiceRootsLogoProps {
  className?: string;
  tagline?: string;
}

export function VoiceRootsLogo({ className = "", tagline = "Oral heritage" }: VoiceRootsLogoProps) {
  return (
    <Link href="/" className={`vr-logo ${className}`} aria-label="Voice Roots home">
      <div className="vr-logo-mark" aria-hidden="true">
        🌱
      </div>
      <div className="vr-logo-text">
        <strong>VOICE ROOTS</strong>
        <span>{tagline}</span>
      </div>
    </Link>
  );
}

export default VoiceRootsLogo;

