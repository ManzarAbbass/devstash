export function Footer() {
  return (
    <footer className="border-t border-[#27272a] px-6 pb-8 pt-16">
      <div className="mx-auto flex max-w-[1200px] flex-wrap justify-between gap-16">
        <div className="max-w-[240px]">
          <div className="mb-3 flex size-6 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-[10px] font-bold text-white">
            D
          </div>
          <div className="mb-2 text-lg font-bold text-[#f4f4f5]">DevStash</div>
          <p className="text-sm leading-relaxed text-[#71717a]">
            The developer knowledge hub for snippets, commands, prompts, and more.
          </p>
        </div>
        <div className="flex gap-16">
          {[
            {
              title: "Product",
              links: [
                { label: "Features", href: "#features" },
                { label: "Pricing", href: "#pricing" },
                { label: "Changelog", href: "#" },
              ],
            },
            {
              title: "Resources",
              links: [
                { label: "Documentation", href: "#" },
                { label: "API", href: "#" },
                { label: "Blog", href: "#" },
              ],
            },
            {
              title: "Company",
              links: [
                { label: "About", href: "#" },
                { label: "Privacy", href: "#" },
                { label: "Terms", href: "#" },
              ],
            },
          ].map((col) => (
            <div key={col.title} className="flex flex-col gap-2.5">
              <h4 className="mb-1 text-xs font-bold uppercase tracking-wide text-[#71717a]">{col.title}</h4>
              {col.links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm text-[#a1a1aa] transition-colors hover:text-[#f4f4f5]"
                >
                  {link.label}
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto mt-12 max-w-[1200px] border-t border-[#27272a] pt-6 text-center text-sm text-[#71717a]">
        &copy; {new Date().getFullYear()} DevStash. All rights reserved.
      </div>


    </footer>
  )
}
