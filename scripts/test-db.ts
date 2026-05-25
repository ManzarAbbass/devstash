import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Testing database connection...\n");

  // Test 1: Basic connection
  const result = await prisma.$queryRaw`SELECT 1 as connected`;
  console.log("✅ Connection OK:", result);

  // Test 2: List tables
  const tables: { table_name: string }[] = await prisma.$queryRaw`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
  `;
  console.log("\n📋 Tables:");
  for (const t of tables) {
    console.log(`   - ${t.table_name}`);
  }

  // Test 3: Count system item types
  const typeCount = await prisma.itemType.count();
  console.log(`\n📊 ItemType count: ${typeCount}`);

  console.log("\n✅ Database test complete.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Database test failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
