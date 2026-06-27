import { ScrollReveal } from "./ScrollReveal"

const features = [
  { icon: "S", accent: "#3b82f6", title: "Code Snippets", desc: "Save and organize code snippets with syntax highlighting for 50+ languages." },
  { icon: "P", accent: "#f59e0b", title: "AI Prompts", desc: "Store your best prompts for ChatGPT, Claude, and other AI tools." },
  { icon: "C", accent: "#06b6d4", title: "Commands", desc: "Never forget that complex git or Docker command again." },
  { icon: "N", accent: "#22c55e", title: "Notes & Docs", desc: "Quick notes, architecture decisions, and documentation in one place." },
  { icon: "I", accent: "#ec4899", title: "Files & Images", desc: "Upload and preview images, PDFs, and other files directly." },
  { icon: "L", accent: "#3b82f6", title: "Collections", desc: "Group related items into collections for easy reference." },
] as const

export function FeaturesSection() {
  return (
    <section className="mx-auto max-w-[1200px] px-6 py-24 text-center" id="features">
      <h2 className="mb-4 text-[clamp(32px,4vw,48px)] font-extrabold">
        Everything you need, one{" "}
        <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent [-webkit-text-fill-color:transparent]">
          place
        </span>
      </h2>
      <p className="mx-auto mb-16 max-w-[560px] text-lg text-[#a1a1aa]">
        Stop context-switching. DevStash brings all your developer knowledge into a single dashboard.
      </p>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <ScrollReveal key={f.title}>
            <div
              className="rounded-xl border border-[#27272a] bg-[#1f1f23] p-8 text-left transition-all duration-300 hover:-translate-y-1 hover:border-blue-500"
              style={{ "--accent": f.accent } as React.CSSProperties}
            >
              <div
                className="mb-5 flex size-12 items-center justify-center rounded-xl font-extrabold text-white"
                style={{ background: f.accent }}
              >
                {f.icon}
              </div>
              <h3 className="mb-3 text-xl font-bold text-[#f4f4f5]">{f.title}</h3>
              <p className="text-sm leading-relaxed text-[#a1a1aa]">{f.desc}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  )
}
