import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("=== DevStash Database Test ===\n");

  // Basic connection
  const result = await prisma.$queryRaw`SELECT 1 as connected`;
  console.log("✅ Connection OK:", result, "\n");

  // User
  const user = await prisma.user.findFirst({
    where: { email: "john@example.com" },
  });
  console.log("👤 User:", user?.name, `<${user?.email}>`, "| isPro:", user?.isPro, "\n");

  // Item Types
  const itemTypes = await prisma.itemType.findMany({ orderBy: { name: "asc" } });
  console.log(`📦 Item Types (${itemTypes.length}):`);
  for (const t of itemTypes) {
    console.log(`   ${t.name.padEnd(10)} icon=${t.icon.padEnd(14)} color=${t.color}  system=${t.isSystem}`);
  }
  console.log();

  // Collections with items
  const collections = await prisma.collection.findMany({
    where: { userId: user!.id },
    include: {
      items: {
        include: {
          item: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  console.log(`📁 Collections (${collections.length}):`);
  for (const c of collections) {
    console.log(`\n   ${c.name}`);
    console.log(`   ${"".padEnd(c.name.length, "─")}`);
    console.log(`   Description: ${c.description}`);

    for (const ic of c.items) {
      const item = ic.item;
      const type = itemTypes.find((t) => t.id === item.itemTypeId);
      console.log(
        `   • [${type?.name?.padEnd(8)}] ${item.title.padEnd(32)} ${item.language ? `(${item.language})` : ""} ${item.url ? `→ ${item.url}` : ""}`,
      );
    }
  }

  console.log("\n✅ All verifications passed.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Test failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
