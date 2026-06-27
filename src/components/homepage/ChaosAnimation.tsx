"use client"

import { useEffect, useRef } from "react"

interface IconData {
  x: number; y: number; vx: number; vy: number
  rot: number; rotV: number; scale: number; scaleV: number; baseScale: number
}

const icons = [
  { name: "notion", bg: "#ffffff22", svg: `<svg viewBox="0 0 48 48" width="40" height="40"><rect x="4" y="4" width="40" height="40" rx="8" fill="#fff"/><path d="M14 16h20M14 24h14M14 32h18" stroke="#000" stroke-width="2.5" stroke-linecap="round"/></svg>` },
  { name: "github", bg: "#24292e", svg: `<svg viewBox="0 0 48 48" width="40" height="40"><rect x="4" y="4" width="40" height="40" rx="8" fill="#24292e"/><path d="M24 10C16.27 10 10 16.27 10 24c0 6.18 4.01 11.42 9.57 13.27.7.13.96-.3.96-.67v-2.36c-3.89.84-4.71-1.88-4.71-1.88-.64-1.62-1.56-2.05-1.56-2.05-1.27-.87.1-.85.1-.85 1.41.1 2.15 1.45 2.15 1.45 1.25 2.14 3.28 1.52 4.08 1.16.13-.9.49-1.52.89-1.87-3.12-.35-6.4-1.56-6.4-6.94 0-1.53.55-2.79 1.45-3.77-.15-.35-.63-1.78.14-3.72 0 0 1.18-.38 3.87 1.44 1.12-.31 2.33-.47 3.52-.47 1.2 0 2.4.16 3.52.47 2.69-1.82 3.87-1.44 3.87-1.44.77 1.94.29 3.37.14 3.72.9.98 1.45 2.24 1.45 3.77 0 5.39-3.28 6.59-6.4 6.94.5.43.96 1.29.96 2.6v3.85c0 .37.26.8.97.67A14.04 14.04 0 0038 24c0-7.73-6.27-14-14-14z" fill="#fff"/></svg>` },
  { name: "slack", bg: "#4a154b", svg: `<svg viewBox="0 0 48 48" width="40" height="40"><rect x="4" y="4" width="40" height="40" rx="8" fill="#4a154b"/><path d="M18 16a2 2 0 114 0v10a2 2 0 11-4 0V16z" fill="#e01e5a"/><path d="M16 18a2 2 0 110-4h10a2 2 0 110 4H16z" fill="#36c5f0"/><path d="M30 32a2 2 0 11-4 0V22a2 2 0 114 0v10z" fill="#2eb67d"/><path d="M32 30a2 2 0 110 4H22a2 2 0 110-4h10z" fill="#ecb22e"/></svg>` },
  { name: "vscode", bg: "#007acc", svg: `<svg viewBox="0 0 48 48" width="40" height="40"><rect x="4" y="4" width="40" height="40" rx="8" fill="#007acc"/><path d="M33 14l-10 10 10 10-4 4-14-14 14-14 4 4z" fill="#fff"/></svg>` },
  { name: "browser", bg: "#e8590c", svg: `<svg viewBox="0 0 48 48" width="40" height="40"><rect x="4" y="4" width="40" height="40" rx="8" fill="#e8590c"/><rect x="10" y="14" width="28" height="22" rx="3" fill="#fff"/><rect x="10" y="14" width="28" height="6" rx="3" fill="#ccc"/><circle cx="14" cy="17" r="1.5" fill="#e8590c"/><circle cx="18" cy="17" r="1.5" fill="#f59e0b"/><circle cx="22" cy="17" r="1.5" fill="#22c55e"/><rect x="13" y="23" width="22" height="2" rx="1" fill="#ddd"/><rect x="13" y="27" width="16" height="2" rx="1" fill="#ddd"/></svg>` },
  { name: "terminal", bg: "#1a1a2e", svg: `<svg viewBox="0 0 48 48" width="40" height="40"><rect x="4" y="4" width="40" height="40" rx="8" fill="#1a1a2e"/><rect x="8" y="10" width="32" height="28" rx="4" fill="#0d0d1a"/><path d="M14 20l6 4-6 4" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M22 28h8" stroke="#22c55e" stroke-width="2" stroke-linecap="round"/><circle cx="14" cy="15" r="1.5" fill="#ff5f56"/><circle cx="18" cy="15" r="1.5" fill="#ffbd2e"/><circle cx="22" cy="15" r="1.5" fill="#27c93f"/></svg>` },
  { name: "file", bg: "#64748b", svg: `<svg viewBox="0 0 48 48" width="40" height="40"><rect x="4" y="4" width="40" height="40" rx="8" fill="#64748b"/><path d="M14 10h12l8 8v20a2 2 0 01-2 2H14a2 2 0 01-2-2V12a2 2 0 012-2z" fill="#fff"/><path d="M26 10v8h8" fill="#e2e8f0"/><rect x="16" y="24" width="16" height="2" rx="1" fill="#cbd5e1"/><rect x="16" y="28" width="12" height="2" rx="1" fill="#cbd5e1"/></svg>` },
  { name: "bookmark", bg: "#6366f1", svg: `<svg viewBox="0 0 48 48" width="40" height="40"><rect x="4" y="4" width="40" height="40" rx="8" fill="#6366f1"/><path d="M16 12h16v24l-8-6-8 6V12z" fill="#fff"/></svg>` },
]

export function ChaosAnimation() {
  const areaRef = useRef<HTMLDivElement>(null)
  const iconRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const area = areaRef.current
    if (!area) return
    const areaEl: HTMLDivElement = area

    const size = 40
    const pad = 4
    const data: IconData[] = icons.map(() => ({
      x: Math.random() * (areaEl.clientWidth - size - pad * 2) + pad,
      y: Math.random() * (areaEl.clientHeight - size - pad * 2) + pad,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      rot: (Math.random() - 0.5) * 20,
      rotV: (Math.random() - 0.5) * 0.5,
      scale: 1,
      scaleV: (Math.random() - 0.5) * 0.008,
      baseScale: 0.85 + Math.random() * 0.3,
    }))

    let mouseX = -1000
    let mouseY = -1000
    let animId: number

    function update() {
      const rect = areaEl.getBoundingClientRect()
      const w = rect.width
      const h = rect.height

      data.forEach((d, i) => {
        const iconCx = d.x + size / 2
        const iconCy = d.y + size / 2
        const dx = iconCx - mouseX
        const dy = iconCy - mouseY
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < 60 && dist > 0) {
          const force = ((60 - dist) / 60) * 0.3
          d.vx += (dx / dist) * force
          d.vy += (dy / dist) * force
        }

        d.vx *= 0.99
        d.vy *= 0.99

        const speed = Math.sqrt(d.vx * d.vx + d.vy * d.vy)
        if (speed > 1.5) {
          d.vx = (d.vx / speed) * 1.5
          d.vy = (d.vy / speed) * 1.5
        }

        d.x += d.vx
        d.y += d.vy

        if (d.x < pad) { d.x = pad; d.vx *= -0.8 }
        if (d.x > w - size - pad) { d.x = w - size - pad; d.vx *= -0.8 }
        if (d.y < pad) { d.y = pad; d.vy *= -0.8 }
        if (d.y > h - size - pad) { d.y = h - size - pad; d.vy *= -0.8 }

        d.rot += d.rotV
        d.scale += d.scaleV
        if (d.scale > 1.15 || d.scale < 0.85) d.scaleV *= -1

        const el = iconRefs.current[i]
        if (el) {
          el.style.transform = `translate(${d.x}px, ${d.y}px) rotate(${d.rot}deg) scale(${d.baseScale * d.scale})`
        }
      })

      animId = requestAnimationFrame(update)
    }

    function onMouseMove(e: MouseEvent) {
      const rect = areaEl.getBoundingClientRect()
      mouseX = e.clientX - rect.left
      mouseY = e.clientY - rect.top
    }

    document.addEventListener("mousemove", onMouseMove)
    animId = requestAnimationFrame(update)

    function onResize() {
      cancelAnimationFrame(animId)
      data.forEach((d) => {
        d.x = Math.random() * (areaEl.clientWidth - size - pad * 2) + pad
        d.y = Math.random() * (areaEl.clientHeight - size - pad * 2) + pad
      })
      animId = requestAnimationFrame(update)
    }

    let resizeTimer: ReturnType<typeof setTimeout>
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(onResize, 200)
    })

    return () => {
      cancelAnimationFrame(animId)
      document.removeEventListener("mousemove", onMouseMove)
    }
  }, [])

  return (
    <div className="chaos-box w-[380px] h-[380px] rounded-xl border border-[#27272a] bg-[#1f1f23] p-5">
      <div className="mb-4 text-xs font-semibold uppercase tracking-wide text-[#71717a]">
        Your knowledge today&hellip;
      </div>
      <div ref={areaRef} className="relative h-[calc(100%-32px)] w-full overflow-hidden">
        {icons.map((icon, i) => (
          <div
            key={icon.name}
            ref={(el) => { iconRefs.current[i] = el }}
            className="absolute flex size-10 items-center justify-center rounded-[10px] text-white will-change-transform"
            style={{ background: icon.bg }}
            dangerouslySetInnerHTML={{ __html: icon.svg }}
          />
        ))}
      </div>
    </div>
  )
}
