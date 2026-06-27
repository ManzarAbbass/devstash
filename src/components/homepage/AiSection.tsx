export function AiSection() {
  return (
    <section className="mx-auto grid max-w-[1200px] items-center gap-16 px-6 py-24 md:grid-cols-2" id="ai">
      <div>
        <div className="mb-5 inline-block rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-black">
          Pro Feature
        </div>
        <h2 className="mb-6 text-[clamp(28px,3vw,40px)] font-extrabold">
          AI-Powered{" "}
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent [-webkit-text-fill-color:transparent]">
            Organization
          </span>
        </h2>
        <ul className="flex flex-col gap-4">
          {[
            "Auto-tag snippets by language and framework",
            "Generate descriptions from your code",
            "Smart search across all your knowledge",
            "Suggest related items and collections",
          ].map((item) => (
            <li key={item} className="relative pl-8 text-base text-[#a1a1aa]">
              <span className="absolute left-0 top-0 flex size-5 items-center justify-center rounded-full bg-blue-500 text-[12px] font-bold text-white">
                ✓
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="overflow-hidden rounded-[10px] border border-[#27272a] bg-[#1a1b1e]">
        <div className="flex items-center gap-3 border-b border-[#27272a] bg-[#121315] px-4 py-3">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-[#ff5f56]" />
            <span className="size-2.5 rounded-full bg-[#ffbd2e]" />
            <span className="size-2.5 rounded-full bg-[#27c93f]" />
          </div>
          <span className="font-mono text-xs text-[#71717a]">app.tsx</span>
        </div>
        <div className="p-4 font-mono text-[13px] leading-relaxed text-[#d4d4d4]">
          <div><span className="text-[#c586c0]">const</span> <span className="text-[#dcdcaa]">autotag</span> = <span className="text-[#c586c0]">async</span> (snippet) <span className="text-[#c586c0]">=&gt;</span> {'{'}</div>
          <div className="pl-4">  <span className="text-[#c586c0]">const</span> tags = <span className="text-[#dcdcaa]">await</span> <span className="text-[#dcdcaa]">ai.generate</span>({'{'}</div>
          <div className="pl-8">    prompt: <span className="text-[#ce9178]">`Tag this code`</span>,</div>
          <div className="pl-8">    code: snippet,</div>
          <div className="pl-4">  {'}'});</div>
          <div className="pl-4">  <span className="text-[#c586c0]">return</span> tags;</div>
          <div>{'}'}</div>
          <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-[#27272a] pt-2.5 text-xs text-[#71717a]">
            AI Generated Tags:
            <span className="inline-block rounded bg-blue-500 px-2 py-0.5 text-[11px] font-semibold text-white">react</span>
            <span className="inline-block rounded bg-blue-500 px-2 py-0.5 text-[11px] font-semibold text-white">typescript</span>
            <span className="inline-block rounded bg-blue-500 px-2 py-0.5 text-[11px] font-semibold text-white">component</span>
          </div>
        </div>
      </div>
    </section>
  )
}
