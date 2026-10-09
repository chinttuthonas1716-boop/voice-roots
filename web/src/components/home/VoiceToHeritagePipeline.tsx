import Link from "next/link";
import { ArrowRight, Mic, Cpu, Globe, Languages, Sparkles, ShieldCheck } from "lucide-react";

const stages = [
  {
    number: "01",
    title: "Record Voice",
    detail: "Capture oral stories and chants with voluntary community consent.",
    tag: "Acoustic Master",
    icon: Mic,
  },
  {
    number: "02",
    title: "AI Transcribe",
    detail: "Whisper-Indic converts spoken words into phonetic native script.",
    tag: "Whisper-Large-v3",
    icon: Cpu,
  },
  {
    number: "03",
    title: "Identify Language",
    detail: "Acoustic encoders detect regional dialect and indigenous variety.",
    tag: "Wav2Vec2-XLS-R",
    icon: Globe,
  },
  {
    number: "04",
    title: "Translate",
    detail: "IndicTrans2 layers translations across 6 languages without erasing source.",
    tag: "IndicTrans2-1B",
    icon: Languages,
  },
  {
    number: "05",
    title: "Understand Culture",
    detail: "Extract ethnobotanical roots, clan lore, and ritual significance.",
    tag: "Cultural LLM",
    icon: Sparkles,
  },
  {
    number: "06",
    title: "Preserve Heritage",
    detail: "Stored permanently in searchable digital oral heritage archive.",
    tag: "Immutable Archive",
    icon: ShieldCheck,
  },
];

export function VoiceToHeritagePipeline() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="glass-card rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-10 shadow-2xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-electric-violet/30 bg-electric-violet/10 px-3.5 py-1 text-xs font-semibold text-electric-violet">
            <Sparkles className="h-3.5 w-3.5" /> Signature AI Architecture
          </div>
          <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-warm-ivory sm:text-4xl">
            From Spoken Voice → Living Heritage
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-soft-lavender sm:text-base">
            Voice Roots connects indigenous oral traditions to accessible knowledge using specialized AI models—while always preserving the speaker&apos;s original voice at the center.
          </p>
        </div>

        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {stages.map(({ number, title, detail, tag, icon: Icon }) => (
            <li
              key={number}
              className="flex flex-col justify-between rounded-2xl border border-white/10 bg-black/30 p-5 transition hover:border-heritage-gold/40 hover:bg-white/[0.04]"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-heritage-gold">{number}</span>
                  <div className="grid h-8 w-8 place-items-center rounded-xl bg-heritage-gold/15 text-heritage-gold">
                    <Icon aria-hidden="true" className="h-4 w-4" />
                  </div>
                </div>
                <h3 className="mt-4 text-sm font-bold text-warm-ivory">{title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-soft-lavender">{detail}</p>
              </div>

              <div className="mt-5 pt-3 border-t border-white/10">
                <span className="inline-block text-[10px] font-mono font-semibold text-heritage-teal">
                  {tag}
                </span>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-8 flex flex-wrap gap-4 pt-2">
          <Link
            href="/flow"
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-heritage-gold px-6 text-sm font-bold text-[#0C0908] shadow-gold-glow hover:bg-[#e0b760] transition active:scale-95"
          >
            Explore Master 25-Step Flow <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
          <Link
            href="/record"
            className="inline-flex min-h-12 items-center gap-2 rounded-full border border-[#E58A4E]/40 bg-[#E58A4E]/15 px-6 text-sm font-bold text-[#E58A4E] hover:bg-[#E58A4E]/25 transition"
          >
            Record Your Story
          </Link>
          <Link
            href="/research"
            className="inline-flex min-h-12 items-center rounded-full border border-white/15 px-6 text-sm font-medium text-warm-ivory hover:bg-white/10 transition"
          >
            AI Evaluation Benchmarks
          </Link>
        </div>
      </div>
    </section>
  );
}
