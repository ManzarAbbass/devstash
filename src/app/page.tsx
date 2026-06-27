"use client";

import { useEffect, useRef, useState } from "react";
import "./homepage.css";

export default function Homepage() {
  const chaosRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const chaosArea = chaosRef.current;
    if (!chaosArea) return;

    const icons = chaosArea.querySelectorAll<HTMLDivElement>(".chaos-icon");
    const iconData: {
      x: number; y: number; vx: number; vy: number;
      rot: number; rotV: number; scale: number; scaleV: number; baseScale: number;
    }[] = [];
    let mouseX = -1000;
    let mouseY = -1000;
    let animId: number;

    const rect = chaosArea.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    const size = 40;
    const pad = 4;

    icons.forEach((_, i) => {
      iconData[i] = {
        x: Math.random() * (w - size - pad * 2) + pad,
        y: Math.random() * (h - size - pad * 2) + pad,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        rot: (Math.random() - 0.5) * 20,
        rotV: (Math.random() - 0.5) * 0.5,
        scale: 1,
        scaleV: (Math.random() - 0.5) * 0.008,
        baseScale: 1,
      };
    });

    function update() {
      const r = chaosArea!.getBoundingClientRect();
      const cw = r.width;
      const ch = r.height;
      const repelRadius = 60;
      const repelStrength = 0.3;

      icons.forEach((icon, i) => {
        const d = iconData[i];
        if (!d) return;

        const iconCx = d.x + size / 2;
        const iconCy = d.y + size / 2;
        const dx = iconCx - mouseX;
        const dy = iconCy - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < repelRadius && dist > 0) {
          const force = ((repelRadius - dist) / repelRadius) * repelStrength;
          d.vx += (dx / dist) * force;
          d.vy += (dy / dist) * force;
        }

        d.vx *= 0.99;
        d.vy *= 0.99;

        const maxV = 1.5;
        const speed = Math.sqrt(d.vx * d.vx + d.vy * d.vy);
        if (speed > maxV) {
          d.vx = (d.vx / speed) * maxV;
          d.vy = (d.vy / speed) * maxV;
        }

        d.x += d.vx;
        d.y += d.vy;

        if (d.x < pad) { d.x = pad; d.vx *= -0.8; }
        if (d.x > cw - size - pad) { d.x = cw - size - pad; d.vx *= -0.8; }
        if (d.y < pad) { d.y = pad; d.vy *= -0.8; }
        if (d.y > ch - size - pad) { d.y = ch - size - pad; d.vy *= -0.8; }

        d.rot += d.rotV;
        d.scale += d.scaleV;
        if (d.scale > 1.15 || d.scale < 0.85) d.scaleV *= -1;

        const s = d.baseScale * d.scale;
        icon.style.transform = `translate(${d.x}px, ${d.y}px) rotate(${d.rot}deg) scale(${s})`;
      });

      animId = requestAnimationFrame(update);
    }

    function onMouseMove(e: MouseEvent) {
      const r = chaosArea!.getBoundingClientRect();
      mouseX = e.clientX - r.left;
      mouseY = e.clientY - r.top;
    }

    document.addEventListener("mousemove", onMouseMove);
    animId = requestAnimationFrame(update);

    function handleResize() {
      cancelAnimationFrame(animId);
      const r = chaosArea!.getBoundingClientRect();
      icons.forEach((_, i) => {
        const d = iconData[i];
        if (!d) return;
        d.x = Math.random() * (r.width - size - pad * 2) + pad;
        d.y = Math.random() * (r.height - size - pad * 2) + pad;
      });
      animId = requestAnimationFrame(update);
    }

    let resizeTimer: ReturnType<typeof setTimeout>;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(handleResize, 200);
    });

    return () => {
      cancelAnimationFrame(animId);
      document.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  useEffect(() => {
    function handleScroll() {
      const elements = document.querySelectorAll(".homepage .feature-card, .homepage .price-card, .homepage-cta");
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 60) el.classList.add("visible");
      });

      if (navRef.current) {
        navRef.current.classList.toggle("scrolled", window.scrollY > 50);
      }
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="homepage">
      <nav ref={navRef} className="homepage-nav">
        <div className="homepage-nav-inner">
          <div className="homepage-nav-logo">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="6" fill="url(#hp-logo-grad)"/>
              <path d="M8 10h12M8 14h8M8 18h10" stroke="#0f0f11" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>DevStash</span>
          </div>
          <div className="homepage-nav-links">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
          </div>
          <div className="homepage-nav-actions" style={{ display: "flex", gap: 12 }}>
            <a href="/sign-in" className="btn btn-ghost">Sign In</a>
            <a href="/register" className="btn btn-primary">Get Started</a>
          </div>
          <button className={`hamburger${mobileOpen ? " active" : ""}`} onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
            <span /><span /><span />
          </button>
        </div>
        <div className={`mobile-menu${mobileOpen ? " open" : ""}`}>
          <a href="#features" onClick={() => setMobileOpen(false)}>Features</a>
          <a href="#pricing" onClick={() => setMobileOpen(false)}>Pricing</a>
          <a href="/sign-in" onClick={() => setMobileOpen(false)}>Sign In</a>
          <a href="/register" className="btn btn-primary" onClick={() => setMobileOpen(false)}>Get Started</a>
        </div>
      </nav>

      <section className="homepage-hero">
        <div className="homepage-hero-text">
          <h1 className="gradient-text">Stop Losing Your Developer Knowledge</h1>
          <p className="homepage-hero-sub">
            Your code snippets, AI prompts, commands, notes, files, images, and links are scattered across a dozen tools.
            Bring them all together in one place.
          </p>
          <div className="homepage-hero-cta">
            <a href="/register" className="btn btn-primary btn-lg">Get Started Free</a>
            <a href="#features" className="btn btn-outline btn-lg">See Features</a>
          </div>
        </div>

        <div className="homepage-hero-visual">
          <div className="chaos-box">
            <div className="chaos-label">Your knowledge today&hellip;</div>
            <div className="chaos-area" ref={chaosRef}>
              {chaosIcons.map((icon, i) => (
                <div key={icon.name} className="chaos-icon" data-icon={icon.name}>
                  {icon.svg}
                </div>
              ))}
            </div>
          </div>

          <div className="transform-arrow">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <path d="M10 24h28M24 10l14 14-14 14" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <div className="dash-preview">
            <div className="dash-label">&hellip;with DevStash</div>
            <div className="dash-topbar">
              <div className="dash-search" />
              <div className="dash-avatar" />
            </div>
            <div className="dash-inner">
              <div className="dash-sidebar">
                <div className="dash-side-item" data-type="snippet" style={{ color: "#3b82f6" }}>&lt;/&gt;</div>
                <div className="dash-side-item" data-type="prompt" style={{ color: "#f59e0b" }}>P</div>
                <div className="dash-side-item active" data-type="command" style={{ color: "#06b6d4" }}>&gt;_</div>
                <div className="dash-side-item" data-type="note" style={{ color: "#22c55e" }}>N</div>
                <div className="dash-side-item" data-type="file" style={{ color: "#64748b" }}>F</div>
                <div className="dash-side-item" data-type="image" style={{ color: "#ec4899" }}>I</div>
                <div className="dash-side-item" data-type="link" style={{ color: "#6366f1" }}>L</div>
              </div>
              <div className="dash-content">
                <div className="dash-grid">
                  <div className="dash-card" style={{ borderTopColor: "#3b82f6" }}>
                    <div className="dash-card-title">useEffect hook</div>
                    <div className="dash-card-meta">React &middot; 2m ago</div>
                  </div>
                  <div className="dash-card" style={{ borderTopColor: "#f59e0b" }}>
                    <div className="dash-card-title">Refactor prompt</div>
                    <div className="dash-card-meta">Claude &middot; 5m ago</div>
                  </div>
                  <div className="dash-card" style={{ borderTopColor: "#06b6d4" }}>
                    <div className="dash-card-title">Docker compose</div>
                    <div className="dash-card-meta">Terminal &middot; 1h ago</div>
                  </div>
                  <div className="dash-card" style={{ borderTopColor: "#22c55e" }}>
                    <div className="dash-card-title">API design notes</div>
                    <div className="dash-card-meta">Docs &middot; 3h ago</div>
                  </div>
                  <div className="dash-card" style={{ borderTopColor: "#ec4899" }}>
                    <div className="dash-card-title">Screenshot.png</div>
                    <div className="dash-card-meta">Image &middot; 5h ago</div>
                  </div>
                  <div className="dash-card" style={{ borderTopColor: "#6366f1" }}>
                    <div className="dash-card-title">Tailwind docs</div>
                    <div className="dash-card-meta">Link &middot; 1d ago</div>
                  </div>
                  <div className="dash-card" style={{ borderTopColor: "#64748b" }}>
                    <div className="dash-card-title">config.json</div>
                    <div className="dash-card-meta">File &middot; 2d ago</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="homepage-features" id="features">
        <h2>Everything you need, one <span className="gradient-text">place</span></h2>
        <p className="section-sub">Stop context-switching. DevStash brings all your developer knowledge into a single dashboard.</p>
        <div className="homepage-features-grid">
          {[
            { icon: "S", accent: "#3b82f6", title: "Code Snippets", desc: "Save and organize code snippets with syntax highlighting for 50+ languages." },
            { icon: "P", accent: "#f59e0b", title: "AI Prompts", desc: "Store your best prompts for ChatGPT, Claude, and other AI tools." },
            { icon: "C", accent: "#06b6d4", title: "Commands", desc: "Never forget that complex git or Docker command again." },
            { icon: "N", accent: "#22c55e", title: "Notes & Docs", desc: "Quick notes, architecture decisions, and documentation in one place." },
            { icon: "I", accent: "#ec4899", title: "Files & Images", desc: "Upload and preview images, PDFs, and other files directly." },
            { icon: "L", accent: "#6366f1", title: "Collections", desc: "Group related items into collections for easy reference." },
          ].map((f) => (
            <div key={f.title} className="feature-card" style={{ "--accent": f.accent } as React.CSSProperties}>
              <div className="feature-icon" style={{ background: f.accent }}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="homepage-ai-section" id="ai">
        <div className="homepage-ai-content">
          <div className="ai-badge">Pro Feature</div>
          <h2>AI-Powered <span className="gradient-text">Organization</span></h2>
          <ul className="ai-checklist">
            <li>Auto-tag snippets by language and framework</li>
            <li>Generate descriptions from your code</li>
            <li>Smart search across all your knowledge</li>
            <li>Suggest related items and collections</li>
          </ul>
        </div>
        <div className="editor-mock">
          <div className="editor-header">
            <div className="editor-dots"><span /><span /><span /></div>
            <span className="editor-lang">app.tsx</span>
          </div>
          <div className="editor-body">
            <div className="line"><span className="kw">const</span> <span className="fn">autotag</span> = <span className="kw">async</span> (snippet) <span className="kw">=&gt;</span> {'{'}</div>
            <div className="line indent">  <span className="kw">const</span> tags = <span className="kw">await</span> <span className="fn">ai.generate</span>({'{'}</div>
            <div className="line indent2">    prompt: <span className="str">`Tag this code`</span>,</div>
            <div className="line indent2">    code: snippet,</div>
            <div className="line indent">  {'}'});</div>
            <div className="line indent">  <span className="kw">return</span> tags;</div>
            <div className="line">{'}'}</div>
            <div className="ai-tag-bar">AI Generated Tags: <span className="tag">react</span><span className="tag">typescript</span><span className="tag">component</span></div>
          </div>
        </div>
      </section>

      <section className="homepage-pricing" id="pricing">
        <h2>Simple, transparent <span className="gradient-text">pricing</span></h2>
        <p className="section-sub">Start free, upgrade when you need more.</p>
        <PricingToggle />
        <div className="homepage-pricing-cards">
          <div className="price-card free">
            <h3>Free</h3>
            <div className="price"><span className="amount" id="price-free">$0</span><span className="period">/mo</span></div>
            <ul>
              <li>50 items</li>
              <li>3 collections</li>
              <li>Basic search</li>
              <li className="na">AI features</li>
              <li className="na">Unlimited storage</li>
            </ul>
            <a href="/register" className="btn btn-outline btn-full">Get Started</a>
          </div>
          <div className="price-card pro featured">
            <div className="popular-badge">Most Popular</div>
            <h3>Pro</h3>
            <div className="price"><span className="amount" id="price-pro">$8</span><span className="period">/mo</span></div>
            <ul>
              <li>Unlimited items</li>
              <li>Unlimited collections</li>
              <li>AI-powered tagging &amp; search</li>
              <li>File &amp; image uploads</li>
              <li>Priority support</li>
            </ul>
            <a href="/register" className="btn btn-primary btn-full">Upgrade to Pro</a>
          </div>
        </div>
      </section>

      <section className="homepage-cta">
        <h2>Ready to Organize Your <span className="gradient-text">Knowledge?</span></h2>
        <p>Join developers who've stopped losing their snippets, commands, and ideas.</p>
        <a href="/register" className="btn btn-primary btn-lg">Get Started Free</a>
      </section>

      <footer className="homepage-footer">
        <div className="homepage-footer-inner">
          <div className="homepage-footer-brand">
            <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="6" fill="url(#hp-logo-grad)"/>
              <path d="M8 10h12M8 14h8M8 18h10" stroke="#0f0f11" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>DevStash</span>
            <p className="footer-desc">The developer knowledge hub for snippets, commands, prompts, and more.</p>
          </div>
          <div className="homepage-footer-links">
            <div className="footer-col">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <a href="#">Changelog</a>
            </div>
            <div className="footer-col">
              <h4>Resources</h4>
              <a href="#">Documentation</a>
              <a href="#">API</a>
              <a href="#">Blog</a>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <a href="#">About</a>
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
            </div>
          </div>
        </div>
        <div className="homepage-footer-bottom">
          &copy; {new Date().getFullYear()} DevStash. All rights reserved.
        </div>
      </footer>

      <svg style={{ display: "none" }}>
        <defs>
          <linearGradient id="hp-logo-grad" x1="0" y1="0" x2="28" y2="28">
            <stop stopColor="#6366f1" />
            <stop offset="1" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

const chaosIcons = [
  { name: "notion", svg: <svg viewBox="0 0 48 48" fill="none"><rect x="4" y="4" width="40" height="40" rx="8" fill="#fff"/><path d="M14 16h20M14 24h14M14 32h18" stroke="#000" strokeWidth="2.5" strokeLinecap="round"/></svg> },
  { name: "github", svg: <svg viewBox="0 0 48 48" fill="none"><rect x="4" y="4" width="40" height="40" rx="8" fill="#24292e"/><path d="M24 10C16.27 10 10 16.27 10 24c0 6.18 4.01 11.42 9.57 13.27.7.13.96-.3.96-.67v-2.36c-3.89.84-4.71-1.88-4.71-1.88-.64-1.62-1.56-2.05-1.56-2.05-1.27-.87.1-.85.1-.85 1.41.1 2.15 1.45 2.15 1.45 1.25 2.14 3.28 1.52 4.08 1.16.13-.9.49-1.52.89-1.87-3.12-.35-6.4-1.56-6.4-6.94 0-1.53.55-2.79 1.45-3.77-.15-.35-.63-1.78.14-3.72 0 0 1.18-.38 3.87 1.44 1.12-.31 2.33-.47 3.52-.47 1.2 0 2.4.16 3.52.47 2.69-1.82 3.87-1.44 3.87-1.44.77 1.94.29 3.37.14 3.72.9.98 1.45 2.24 1.45 3.77 0 5.39-3.28 6.59-6.4 6.94.5.43.96 1.29.96 2.6v3.85c0 .37.26.8.97.67A14.04 14.04 0 0038 24c0-7.73-6.27-14-14-14z" fill="#fff"/></svg> },
  { name: "slack", svg: <svg viewBox="0 0 48 48"><rect x="4" y="4" width="40" height="40" rx="8" fill="#4a154b"/><path d="M18 16a2 2 0 114 0v10a2 2 0 11-4 0V16z" fill="#e01e5a"/><path d="M16 18a2 2 0 110-4h10a2 2 0 110 4H16z" fill="#36c5f0"/><path d="M30 32a2 2 0 11-4 0V22a2 2 0 114 0v10z" fill="#2eb67d"/><path d="M32 30a2 2 0 110 4H22a2 2 0 110-4h10z" fill="#ecb22e"/></svg> },
  { name: "vscode", svg: <svg viewBox="0 0 48 48"><rect x="4" y="4" width="40" height="40" rx="8" fill="#007acc"/><path d="M33 14l-10 10 10 10-4 4-14-14 14-14 4 4z" fill="#fff"/></svg> },
  { name: "browser", svg: <svg viewBox="0 0 48 48"><rect x="4" y="4" width="40" height="40" rx="8" fill="#e8590c"/><rect x="10" y="14" width="28" height="22" rx="3" fill="#fff"/><rect x="10" y="14" width="28" height="6" rx="3" fill="#ccc"/><circle cx="14" cy="17" r="1.5" fill="#e8590c"/><circle cx="18" cy="17" r="1.5" fill="#f59e0b"/><circle cx="22" cy="17" r="1.5" fill="#22c55e"/><rect x="13" y="23" width="22" height="2" rx="1" fill="#ddd"/><rect x="13" y="27" width="16" height="2" rx="1" fill="#ddd"/></svg> },
  { name: "terminal", svg: <svg viewBox="0 0 48 48"><rect x="4" y="4" width="40" height="40" rx="8" fill="#1a1a2e"/><rect x="8" y="10" width="32" height="28" rx="4" fill="#0d0d1a"/><path d="M14 20l6 4-6 4" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/><path d="M22 28h8" stroke="#22c55e" strokeWidth="2" strokeLinecap="round"/><circle cx="14" cy="15" r="1.5" fill="#ff5f56"/><circle cx="18" cy="15" r="1.5" fill="#ffbd2e"/><circle cx="22" cy="15" r="1.5" fill="#27c93f"/></svg> },
  { name: "file", svg: <svg viewBox="0 0 48 48"><rect x="4" y="4" width="40" height="40" rx="8" fill="#64748b"/><path d="M14 10h12l8 8v20a2 2 0 01-2 2H14a2 2 0 01-2-2V12a2 2 0 012-2z" fill="#fff"/><path d="M26 10v8h8" fill="#e2e8f0"/><rect x="16" y="24" width="16" height="2" rx="1" fill="#cbd5e1"/><rect x="16" y="28" width="12" height="2" rx="1" fill="#cbd5e1"/></svg> },
  { name: "bookmark", svg: <svg viewBox="0 0 48 48"><rect x="4" y="4" width="40" height="40" rx="8" fill="#6366f1"/><path d="M16 12h16v24l-8-6-8 6V12z" fill="#fff"/></svg> },
];

function PricingToggle() {
  return (
    <div className="pricing-toggle">
      <span className="toggle-label active" id="toggle-monthly">Monthly</span>
      <label className="toggle-switch">
        <input type="checkbox" id="billing-toggle" onChange={(e) => {
          const isYearly = e.currentTarget.checked;
          const el = document.getElementById("toggle-monthly");
          const el2 = document.getElementById("toggle-yearly");
          if (el) el.className = `toggle-label${isYearly ? "" : " active"}`;
          if (el2) el2.className = `toggle-label${isYearly ? " active" : ""}`;
          const free = document.getElementById("price-free");
          const pro = document.getElementById("price-pro");
          if (free) free.textContent = isYearly ? "$0" : "$0";
          if (pro) pro.textContent = isYearly ? "$6" : "$8";
        }} />
        <span className="toggle-slider" />
      </label>
      <span className="toggle-label" id="toggle-yearly">Yearly <small>Save 25%</small></span>
    </div>
  );
}
