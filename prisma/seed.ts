import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...\n");

  // Clean existing data in reverse dependency order
  await prisma.tagsOnItems.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.itemCollection.deleteMany();
  await prisma.item.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.itemType.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  console.log("🧹 Cleaned existing data\n");

  // ── User ──
  const hashedPassword = await bcrypt.hash("demo1234", 12);
  const user = await prisma.user.create({
    data: {
      email: "demo@devstash.io",
      name: "Demo User",
      password: hashedPassword,
      emailVerified: new Date(),
      isPro: false,
      accounts: {
        create: {
          type: "email",
          provider: "email",
          providerAccountId: "demo@devstash.io",
        },
      },
    },
  });
  console.log("✅ User created:", user.email);

  // ── System Item Types ──
  const types: { name: string; icon: string; color: string }[] = [
    { name: "snippet", icon: "Code", color: "#3b82f6" },
    { name: "prompt", icon: "Sparkles", color: "#8b5cf6" },
    { name: "command", icon: "Terminal", color: "#f97316" },
    { name: "note", icon: "StickyNote", color: "#fde047" },
    { name: "file", icon: "File", color: "#6b7280" },
    { name: "image", icon: "Image", color: "#ec4899" },
    { name: "link", icon: "Link", color: "#10b981" },
  ];

  const typeMap = new Map<string, string>();
  for (const t of types) {
    const it = await prisma.itemType.create({
      data: { name: t.name, icon: t.icon, color: t.color, isSystem: true },
    });
    typeMap.set(t.name, it.id);
  }
  console.log("✅ Item types seeded");

  // ── React Patterns ──
  const reactColl = await prisma.collection.create({
    data: {
      name: "React Patterns",
      description: "Reusable React patterns and hooks",
      isFavorite: true,
      userId: user.id,
    },
  });

  const snippets = [
    {
      title: "Custom Hooks",
      description: "Reusable debounce and localStorage hooks",
      content: `// useDebounce
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// useLocalStorage
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);
    window.localStorage.setItem(key, JSON.stringify(valueToStore));
  };

  return [storedValue, setValue] as const;
}`,
    },
    {
      title: "Component Patterns",
      description: "Compound component pattern with tabs example",
      content: `// Compound Component Pattern
import { createContext, useContext, useState } from 'react';

interface TabsContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsContext = createContext<TabsContextType | null>(null);

function Tabs({ children, defaultTab }: { children: React.ReactNode; defaultTab: string }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabsContext.Provider>
  );
}

function Tab({ id, children }: { id: string; children: React.ReactNode }) {
  const ctx = useContext(TabsContext)!;
  return (
    <button onClick={() => ctx.setActiveTab(id)} data-active={ctx.activeTab === id}>
      {children}
    </button>
  );
}

function Panel({ id, children }: { id: string; children: React.ReactNode }) {
  const ctx = useContext(TabsContext)!;
  return ctx.activeTab === id ? <div>{children}</div> : null;
}

Tabs.Tab = Tab;
Tabs.Panel = Panel;
export default Tabs;`,
    },
    {
      title: "Utility Functions",
      description: "Type-safe helpers for common tasks",
      content: `// Type-safe utility functions
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length).trimEnd() + '...';
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  ms: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}`,
    },
  ];

  for (const [i, s] of snippets.entries()) {
    const item = await prisma.item.create({
      data: {
        title: s.title,
        contentType: "text",
        content: s.content,
        language: "typescript",
        isPinned: i === 0,
        isFavorite: i === 0,
        description: s.description,
        userId: user.id,
        itemTypeId: typeMap.get("snippet")!,
        collections: { create: { collectionId: reactColl.id } },
      },
    });
    console.log(`   - "${item.title}" (snippet)`);
  }

  // ── DevOps ──
  const devopsColl = await prisma.collection.create({
    data: {
      name: "DevOps",
      description: "Infrastructure and deployment resources",
      userId: user.id,
    },
  });

  const devopsItems = [
    {
      title: "Docker Compose Setup",
      description: "Multi-service Docker setup with Postgres and Redis",
      type: "snippet",
      language: "yaml",
      content: `version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=\${DATABASE_URL}
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: \${POSTGRES_USER}
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD}
      POSTGRES_DB: \${POSTGRES_DB}
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:`,
    },
    {
      title: "Deploy to Production",
      description: "Build, push and deploy Docker images to production",
      type: "command",
      content: `# Build and tag
docker build -t devstash:latest .
docker tag devstash:latest registry.example.com/devstash:latest

# Push to registry
docker push registry.example.com/devstash:latest

# Deploy via SSH
ssh deploy@host << 'EOF'
  docker pull registry.example.com/devstash:latest
  docker compose up -d --no-deps app
  docker system prune -f
EOF`,
    },
    {
      title: "Docker Documentation",
      description: "Official Docker docs for containers and orchestration",
      type: "link",
      url: "https://docs.docker.com/",
    },
    {
      title: "GitHub Actions Docs",
      description: "Automate workflows with GitHub Actions",
      type: "link",
      url: "https://docs.github.com/en/actions",
    },
  ];

  for (const d of devopsItems) {
    const itemData: any = {
      title: d.title,
      contentType: "text",
      userId: user.id,
      itemTypeId: typeMap.get(d.type)!,
      collections: { create: { collectionId: devopsColl.id } },
    };
    if ("description" in d && d.description) itemData.description = d.description;
    if (d.type === "link") {
      itemData.url = d.url;
      itemData.content = d.url;
    } else {
      itemData.content = d.content;
      if (d.type === "snippet") itemData.language = d.language;
    }
    const item = await prisma.item.create({ data: itemData });
    console.log(`   - "${item.title}" (${d.type})`);
  }

  // ── Database Snippets ──
  const dbColl = await prisma.collection.create({
    data: {
      name: "Database Snippets",
      description: "SQL queries and database-related code patterns",
      defaultTypeId: typeMap.get("snippet")!,
      userId: user.id,
    },
  });

  function makeSnippet(title: string, description: string, language: string, content: string) {
    return { title, description, language, content };
  }

  const dbSnippets = [
    makeSnippet(
      "Array Methods Cheat Sheet",
      "Common JavaScript array operations",
      "typescript",
      `// Map - transform each element\n[1, 2, 3].map(x => x * 2);\n\n// Filter\n[1, 2, 3, 4].filter(x => x % 2 === 0);\n\n// Reduce\n[1, 2, 3].reduce((acc, x) => acc + x, 0);`,
    ),
    makeSnippet(
      "SQL Query Patterns",
      "Common SQL query patterns for PostgreSQL",
      "sql",
      `-- CTE with window function\nWITH ranked AS (SELECT *, ROW_NUMBER() OVER (PARTITION BY department_id ORDER BY salary DESC) AS rn FROM employees)\nSELECT * FROM ranked WHERE rn = 1;\n\n-- Upsert\nINSERT INTO users (id, name, email) VALUES ($1, $2, $3) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;`,
    ),
    makeSnippet(
      "Express.js Error Middleware",
      "Centralized error handling for Express APIs",
      "javascript",
      `class AppError extends Error {\n  constructor(statusCode, message) {\n    super(message);\n    this.statusCode = statusCode;\n  }\n}\n\nconst errorHandler = (err, req, res, next) => {\n  res.status(err.statusCode || 500).json({ message: err.message });\n};`,
    ),
    makeSnippet(
      "React Context Pattern",
      "Create a strongly-typed React context with hooks",
      "typescript",
      `const ThemeContext = createContext<Theme | undefined>(undefined);\n\nexport function ThemeProvider({ children }) {\n  const [theme, setTheme] = useState<Theme>("light");\n  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;\n}\n\nexport function useTheme() {\n  const ctx = useContext(ThemeContext);\n  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");\n  return ctx;\n}`,
    ),
    makeSnippet(
      "Zustand Store Pattern",
      "Lightweight state management with Zustand",
      "typescript",
      `import { create } from "zustand";\n\ninterface CounterState {\n  count: number;\n  increment: () => void;\n  decrement: () => void;\n  reset: () => void;\n}\n\nexport const useCounterStore = create<CounterState>((set) => ({\n  count: 0,\n  increment: () => set((state) => ({ count: state.count + 1 })),\n  decrement: () => set((state) => ({ count: state.count - 1 })),\n  reset: () => set({ count: 0 }),\n}));`,
    ),
    makeSnippet(
      "Path Alias with TypeScript",
      "Configure @/ path aliases in tsconfig.json",
      "typescript",
      `// tsconfig.json\n{\n  "compilerOptions": {\n    "baseUrl": ".",\n    "paths": {\n      "@/*": ["./src/*"]\n    }\n  }\n}\n\n// Usage\nimport { Button } from "@/components/ui/button";`,
    ),
    makeSnippet(
      "Prisma Pagination Helper",
      "Reusable pagination utility for Prisma queries",
      "typescript",
      `export async function paginate<T>(\n  model: { findMany: (args: any) => Promise<T[]>; count: (args: any) => Promise<number> },\n  args: any,\n  page: number,\n  perPage: number = 20,\n) {\n  const [data, total] = await Promise.all([\n    model.findMany({ ...args, skip: (page - 1) * perPage, take: perPage }),\n    model.count(args.where ? { where: args.where } : {}),\n  ]);\n  return { data, total, page, totalPages: Math.ceil(total / perPage) };\n}`,
    ),
    makeSnippet(
      "Custom Error Classes",
      "Type-safe custom error hierarchy for Node.js",
      "typescript",
      `export class AppError extends Error {\n  constructor(\n    message: string,\n    public statusCode: number = 500,\n    public code?: string,\n  ) {\n    super(message);\n    this.name = this.constructor.name;\n  }\n}\n\nexport class NotFoundError extends AppError {\n  constructor(resource: string) {\n    super(\`\${resource} not found\`, 404, "NOT_FOUND");\n  }\n}\n\nexport class ValidationError extends AppError {\n  constructor(message: string) {\n    super(message, 400, "VALIDATION_ERROR");\n  }\n}`,
    ),
    makeSnippet(
      "Fetch with Retry",
      "HTTP fetch wrapper with exponential backoff",
      "typescript",
      `export async function fetchWithRetry(\n  url: string,\n  options: RequestInit = {},\n  maxRetries: number = 3,\n): Promise<Response> {\n  for (let i = 0; i < maxRetries; i++) {\n    const response = await fetch(url, options);\n    if (response.ok) return response;\n    if (response.status < 500) throw new Error(\`HTTP \${response.status}\`);\n    await new Promise((r) => setTimeout(r, Math.pow(2, i) * 1000));\n  }\n  throw new Error("Max retries exceeded");\n}`,
    ),
    makeSnippet(
      "Email Validation Regex",
      "Robust email validation utility function",
      "typescript",
      `export function isValidEmail(email: string): boolean {\n  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;\n  return emailRegex.test(email);\n}\n\nexport function sanitizeEmail(email: string): string {\n  return email.trim().toLowerCase();\n}`,
    ),
    makeSnippet(
      "Date Formatting Helpers",
      "Consistent date formatting with Intl API",
      "typescript",
      `export function formatDate(date: Date): string {\n  return new Intl.DateTimeFormat("en-US", {\n    month: "short", day: "numeric", year: "numeric",\n  }).format(date);\n}\n\nexport function formatRelative(date: Date): string {\n  const diff = Date.now() - date.getTime();\n  const mins = Math.floor(diff / 60000);\n  if (mins < 60) return \`\${mins}m ago\`;\n  const hours = Math.floor(mins / 60);\n  if (hours < 24) return \`\${hours}h ago\`;\n  return formatDate(date);\n}`,
    ),
    makeSnippet(
      "Async Handler Wrapper",
      "Eliminate try-catch boilerplate in Express routes",
      "javascript",
      `const asyncHandler = (fn) => (req, res, next) => {\n  Promise.resolve(fn(req, res, next)).catch(next);\n};\n\n// Usage\napp.get("/api/users", asyncHandler(async (req, res) => {\n  const users = await User.findMany();\n  res.json(users);\n}));`,
    ),
    makeSnippet(
      "URL Slug Generator",
      "Generate SEO-friendly URL slugs from strings",
      "typescript",
      `export function slugify(text: string): string {\n  return text\n    .toString()\n    .normalize("NFD")\n    .replace(/[\\u0300-\\u036f]/g, "")\n    .toLowerCase()\n    .trim()\n    .replace(/[^a-z0-9 ]/g, "")\n    .replace(/\\s+/g, "-")\n    .replace(/-+/g, "-");\n}`,
    ),
    makeSnippet(
      "Debounced Search Hook",
      "React hook for debounced API search calls",
      "typescript",
      `export function useDebouncedSearch(delay: number = 300) {\n  const [query, setQuery] = useState("");\n  const [debouncedQuery, setDebounced] = useState("");\n\n  useEffect(() => {\n    const timer = setTimeout(() => setDebounced(query), delay);\n    return () => clearTimeout(timer);\n  }, [query, delay]);\n\n  return { query, setQuery, debouncedQuery };\n}`,
    ),
    makeSnippet(
      "Intersection Observer Hook",
      "Detect element visibility with IntersectionObserver",
      "typescript",
      `export function useInView(ref: RefObject<Element>, options?: IntersectionObserverInit) {\n  const [isInView, setIsInView] = useState(false);\n\n  useEffect(() => {\n    const observer = new IntersectionObserver(([entry]) => {\n      setIsInView(entry.isIntersecting);\n    }, options);\n    if (ref.current) observer.observe(ref.current);\n    return () => observer.disconnect();\n  }, [ref, options]);\n\n  return isInView;\n}`,
    ),
    makeSnippet(
      "LocalStorage with Expiry",
      "Cache data in localStorage with TTL support",
      "typescript",
      `export function setWithExpiry(key: string, value: unknown, ttlMs: number) {\n  const item = { value, expiry: Date.now() + ttlMs };\n  localStorage.setItem(key, JSON.stringify(item));\n}\n\nexport function getWithExpiry<T>(key: string): T | null {\n  const raw = localStorage.getItem(key);\n  if (!raw) return null;\n  const item = JSON.parse(raw);\n  if (Date.now() > item.expiry) {\n    localStorage.removeItem(key);\n    return null;\n  }\n  return item.value as T;\n}`,
    ),
    makeSnippet(
      "Tailwind Class Merger",
      "Merge Tailwind classes without conflicts",
      "typescript",
      `import { clsx, type ClassValue } from "clsx";\nimport { twMerge } from "tailwind-merge";\n\nexport function cn(...inputs: ClassValue[]) {\n  return twMerge(clsx(inputs));\n}`,
    ),
    makeSnippet(
      "Rate Limiter Utility",
      "Simple in-memory rate limiter for Node.js",
      "typescript",
      `export class RateLimiter {\n  private hits = new Map<string, number[]>();\n\n  constructor(private limit: number, private windowMs: number) {}\n\n  check(key: string): boolean {\n    const now = Date.now();\n    const timestamps = (this.hits.get(key) || []).filter((t) => now - t < this.windowMs);\n    if (timestamps.length >= this.limit) return false;\n    timestamps.push(now);\n    this.hits.set(key, timestamps);\n    return true;\n  }\n}`,
    ),
    makeSnippet(
      "Object Diff Utility",
      "Deep compare two objects and return the differences",
      "typescript",
      `export function diff<T extends Record<string, unknown>>(a: T, b: T): Partial<T> {\n  const result: Partial<T> = {};\n  const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);\n  for (const key of allKeys) {\n    if (JSON.stringify(a[key]) !== JSON.stringify(b[key])) {\n      result[key as keyof T] = b[key as keyof T];\n    }\n  }\n  return result;\n}`,
    ),
    makeSnippet(
      "CSS Variables Theming",
      "Create a theme system with CSS custom properties",
      "css",
      `:root {\n  --primary: #3b82f6;\n  --primary-foreground: #ffffff;\n  --background: #ffffff;\n  --foreground: #0f172a;\n  --muted: #f1f5f9;\n  --muted-foreground: #64748b;\n  --border: #e2e8f0;\n}\n\n.dark {\n  --primary: #60a5fa;\n  --background: #0f172a;\n  --foreground: #f8fafc;\n  --muted: #1e293b;\n  --muted-foreground: #94a3b8;\n  --border: #334155;\n}`,
    ),
    makeSnippet(
      "Node.js Directory Walk",
      "Recursively walk a directory tree in Node.js",
      "javascript",
      `const fs = require("fs");\nconst path = require("path");\n\nfunction walkDir(dir) {\n  let results = [];\n  const list = fs.readdirSync(dir);\n  for (const file of list) {\n    const fullPath = path.join(dir, file);\n    const stat = fs.statSync(fullPath);\n    if (stat.isDirectory()) {\n      results = results.concat(walkDir(fullPath));\n    } else {\n      results.push(fullPath);\n    }\n  }\n  return results;\n}`,
    ),
    makeSnippet(
      "SQL Join Patterns",
      "Different SQL JOIN types with examples",
      "sql",
      `-- INNER JOIN: only matching rows\nSELECT u.name, o.amount FROM users u INNER JOIN orders o ON u.id = o.user_id;\n\n-- LEFT JOIN: all users, even without orders\nSELECT u.name, o.amount FROM users u LEFT JOIN orders o ON u.id = o.user_id;\n\n-- FULL OUTER JOIN: all rows from both\nSELECT u.name, o.amount FROM users u FULL OUTER JOIN orders o ON u.id = o.user_id;\n\n-- CROSS JOIN: cartesian product\nSELECT u.name, p.name FROM users u CROSS JOIN products p;`,
    ),
  ];

  for (const s of dbSnippets) {
    const item = await prisma.item.create({
      data: {
        title: s.title,
        contentType: "text",
        content: s.content,
        language: s.language,
        description: s.description,
        isPinned: s.title === "Array Methods Cheat Sheet",
        isFavorite: s.title === "Array Methods Cheat Sheet",
        userId: user.id,
        itemTypeId: typeMap.get("snippet")!,
        collections: { create: { collectionId: dbColl.id } },
      },
    });
    console.log(`   - "${item.title}" (snippet)`);
  }

  console.log("\n✅ Seed complete!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
