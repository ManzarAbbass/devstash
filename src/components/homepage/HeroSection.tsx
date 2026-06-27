import { ChaosAnimation } from "./ChaosAnimation"
import { DashboardPreview } from "./DashboardPreview"

export function HeroSection() {
  return (
    <section className="mx-auto max-w-[1200px] px-6 pt-[140px] pb-20 text-center">
      <div className="mb-16">
        <h1 className="mb-6 text-[clamp(40px,6vw,72px)] font-extrabold leading-[1.1] text-[#f4f4f5]">
          Stop Losing Your{" "}
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent [-webkit-text-fill-color:transparent] animate-[gradient-shift_4s_ease-in-out_infinite]">
            Developer Knowledge
          </span>
        </h1>
        <p className="mx-auto mb-10 max-w-[640px] text-[clamp(16px,2vw,20px)] leading-relaxed text-[#a1a1aa]">
          Your code snippets, AI prompts, commands, notes, files, images, and links are scattered across a dozen tools.
          Bring them all together in one place.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="/register"
            className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-7 py-3.5 text-base font-semibold text-white transition-all hover:from-blue-600 hover:to-blue-700 hover:-translate-y-0.5"
          >
            Get Started Free
          </a>
          <a
            href="#features"
            className="inline-flex items-center justify-center rounded-lg border border-blue-500/50 bg-transparent px-7 py-3.5 text-base font-semibold text-blue-400 transition-all hover:border-blue-500 hover:text-blue-300"
          >
            See Features
          </a>
        </div>
      </div>

      <div className="flex items-center justify-center gap-6 max-[1100px]:flex-col">
        <ChaosAnimation />
        <div className="flex items-center justify-center animate-[arrow-pulse_2s_ease-in-out_infinite] max-[1100px]:rotate-90 max-[1100px]:animate-[arrow-pulse-mobile_2s_ease-in-out_infinite]">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <path d="M10 24h28M24 10l14 14-14 14" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <DashboardPreview />
      </div>
    </section>
  )
}
