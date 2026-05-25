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
  const hashedPassword = await bcrypt.hash("12345678", 12);
  const user = await prisma.user.create({
    data: {
      email: "john@example.com",
      name: "John Doe",
      emailVerified: new Date(),
      isPro: false,
      accounts: {
        create: {
          type: "email",
          provider: "email",
          providerAccountId: "john@example.com",
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
      userId: user.id,
    },
  });

  const snippets = [
    {
      title: "Custom Hooks",
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

  for (const s of snippets) {
    const item = await prisma.item.create({
      data: {
        title: s.title,
        contentType: "text",
        content: s.content,
        language: "typescript",
        userId: user.id,
        itemTypeId: typeMap.get("snippet")!,
        collections: { create: { collectionId: reactColl.id } },
      },
    });
    console.log(`   - "${item.title}" (snippet)`);
  }

  // ── AI Workflows ──
  const aiColl = await prisma.collection.create({
    data: {
      name: "AI Workflows",
      description: "AI prompts and workflow automations",
      userId: user.id,
    },
  });

  const prompts = [
    {
      title: "Code Review Prompt",
      content: `You are a senior code reviewer. Review the following code for:
1. Correctness
2. Performance
3. Security
4. Readability
5. Best practices

Provide specific, actionable feedback for each issue found. Be thorough but concise.`,
    },
    {
      title: "Documentation Generator",
      content: `Generate comprehensive documentation for the following code. Include:
- Brief description of what it does
- Parameters and return values
- Usage examples
- Edge cases
- Related functions

Format the output as Markdown.`,
    },
    {
      title: "Refactoring Assistant",
      content: `Analyze this code and suggest refactoring improvements. Consider:
1. Extracting functions/classes
2. Reducing complexity
3. Improving naming
4. Adding type safety
5. Removing duplication

Show both the "before" and "after" code for each suggestion.`,
    },
  ];

  for (const p of prompts) {
    const item = await prisma.item.create({
      data: {
        title: p.title,
        contentType: "text",
        content: p.content,
        userId: user.id,
        itemTypeId: typeMap.get("prompt")!,
        collections: { create: { collectionId: aiColl.id } },
      },
    });
    console.log(`   - "${item.title}" (prompt)`);
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
      type: "link",
      url: "https://docs.docker.com/",
    },
    {
      title: "GitHub Actions Docs",
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

  // ── Terminal Commands ──
  const terminalColl = await prisma.collection.create({
    data: {
      name: "Terminal Commands",
      description: "Useful shell commands for everyday development",
      userId: user.id,
    },
  });

  const commands = [
    {
      title: "Git Operations",
      content: `# Interactive rebase last N commits
git rebase -i HEAD~N

# Find which commit introduced a change
git log -S "search_string" --oneline

# Undo last commit but keep changes staged
git reset --soft HEAD~1

# List all branches merged into main
git branch --merged main | grep -v "main"

# Show diff of a specific commit
git show <commit-hash> --stat`,
    },
    {
      title: "Docker Commands",
      content: `# Clean up everything (containers, images, volumes)
docker system prune -a --volumes

# View logs for a specific service
docker compose logs -f <service-name>

# Execute command in running container
docker exec -it <container-id> sh

# Copy files from container
docker cp <container-id>:/path/to/file ./local-path

# Inspect container resources
docker stats <container-id>`,
    },
    {
      title: "Process Management",
      content: `# Find process listening on a port
lsof -i :3000
netstat -ano | findstr :3000

# Kill process by port
kill -9 $(lsof -ti:3000)

# Monitor processes in real-time
htop
top -o %MEM

# Run command after delay
sleep 5 && <command>

# Background a running process
Ctrl+Z
bg
disown`,
    },
    {
      title: "Package Manager Utilities",
      content: `# Check for outdated packages
npm outdated

# Update all packages to latest
npm update

# List globally installed packages
npm ls -g --depth=0

# Analyze package sizes
npx cost-of-modules

# Clear npm cache
npm cache clean --force

# Check for vulnerable dependencies
npm audit`,
    },
  ];

  for (const c of commands) {
    const item = await prisma.item.create({
      data: {
        title: c.title,
        contentType: "text",
        content: c.content,
        userId: user.id,
        itemTypeId: typeMap.get("command")!,
        collections: { create: { collectionId: terminalColl.id } },
      },
    });
    console.log(`   - "${item.title}" (command)`);
  }

  // ── Design Resources ──
  const designColl = await prisma.collection.create({
    data: {
      name: "Design Resources",
      description: "UI/UX resources and references",
      userId: user.id,
    },
  });

  const links = [
    {
      title: "Tailwind CSS Docs",
      url: "https://tailwindcss.com/docs",
    },
    {
      title: "ShadCN UI",
      url: "https://ui.shadcn.com/",
    },
    {
      title: "Radix UI Primitives",
      url: "https://www.radix-ui.com/primitives",
    },
    {
      title: "Lucide Icons",
      url: "https://lucide.dev/icons/",
    },
  ];

  for (const l of links) {
    const item = await prisma.item.create({
      data: {
        title: l.title,
        contentType: "text",
        content: l.url,
        url: l.url,
        userId: user.id,
        itemTypeId: typeMap.get("link")!,
        collections: { create: { collectionId: designColl.id } },
      },
    });
    console.log(`   - "${item.title}" (link)`);
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
