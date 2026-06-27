const items = [
  { title: "useEffect hook", meta: "React · 2m ago", color: "#3b82f6" },
  { title: "Refactor prompt", meta: "Claude · 5m ago", color: "#f59e0b" },
  { title: "Docker compose", meta: "Terminal · 1h ago", color: "#06b6d4" },
  { title: "API design notes", meta: "Docs · 3h ago", color: "#22c55e" },
  { title: "Screenshot.png", meta: "Image · 5h ago", color: "#ec4899" },
  { title: "Tailwind docs", meta: "Link · 1d ago", color: "#3b82f6" },
  { title: "config.json", meta: "File · 2d ago", color: "#64748b" },
] as const

const sideItems = [
  { label: "</>", color: "#3b82f6", type: "snippet" },
  { label: "P", color: "#f59e0b", type: "prompt" },
  { label: ">_", color: "#06b6d4", type: "command", active: true },
  { label: "N", color: "#22c55e", type: "note" },
  { label: "F", color: "#64748b", type: "file" },
  { label: "I", color: "#ec4899", type: "image" },
  { label: "L", color: "#6366f1", type: "link" },
] as const

export function DashboardPreview() {
  return (
    <div className="dash-preview flex h-[380px] w-[380px] flex-col overflow-hidden rounded-xl border border-[#27272a] bg-[#1f1f23] p-3.5">
      <div className="mb-3 flex items-center gap-2 border-b border-[#27272a] pb-2.5">
        <div className="h-6 flex-1 rounded-md bg-[#27272a]" />
        <div className="size-6 rounded-full bg-blue-500" />
      </div>
      <div className="flex flex-1 gap-2.5 min-h-0">
        <div className="flex flex-col gap-1.5 border-r border-[#27272a] pr-2.5">
          {sideItems.map((item) => (
            <div
              key={item.type}
              className={`flex size-7 items-center justify-center rounded-md text-[11px] font-bold ${
                "active" in item && item.active ? "bg-[#27272a]" : "bg-transparent"
              }`}
              style={{ color: item.color }}
            >
              {item.label}
            </div>
          ))}
        </div>
        <div className="flex-1 min-w-0 overflow-y-auto">
          <div className="grid grid-cols-2 gap-2">
            {items.map((item) => (
              <div
                key={item.title}
                className="rounded-lg bg-[#27272a] p-2.5"
                style={{ borderTop: `3px solid ${item.color}` }}
              >
                <div className="truncate text-[10px] font-semibold text-[#f4f4f5]">
                  {item.title}
                </div>
                <div className="mt-1 text-[8px] text-[#71717a]">{item.meta}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
