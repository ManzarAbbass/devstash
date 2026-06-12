import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../generated/prisma/client"

const DEMO_EMAIL = "demo@devstash.io"

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})

const prisma = new PrismaClient({ adapter })

async function main() {
  const demoUser = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } })

  if (!demoUser) {
    console.log(`❌ Demo user "${DEMO_EMAIL}" not found — aborting.`)
    process.exit(1)
  }

  console.log(`✅ Demo user found: "${DEMO_EMAIL}" (${demoUser.id})`)
  console.log(`   Keeping this user and all their content.\n`)

  const allUsers = await prisma.user.findMany({ select: { id: true, email: true } })
  const usersToDelete = allUsers.filter((u) => u.email !== DEMO_EMAIL)

  if (usersToDelete.length === 0) {
    console.log("No other users to clean up. All done!")
    return
  }

  const userIdsToDelete = usersToDelete.map((u) => u.id)
  const userEmailsToDelete = usersToDelete.map((u) => u.email).filter(Boolean) as string[]

  console.log(`Found ${usersToDelete.length} user(s) to delete:`)
  for (const u of usersToDelete) {
    console.log(`   - ${u.email ?? u.id}`)
  }
  console.log()

  // Delete verification tokens for non-demo emails
  const vtDeleted = await prisma.verificationToken.deleteMany({
    where: { identifier: { in: userEmailsToDelete } },
  })
  console.log(`   🗑️  ${vtDeleted.count} verification tokens`)

  // Delete item types owned by non-demo users
  const itDeleted = await prisma.itemType.deleteMany({
    where: { userId: { in: userIdsToDelete } },
  })
  console.log(`   🗑️  ${itDeleted.count} custom item types`)

  // Delete non-demo users — cascades to items, collections, accounts, sessions
  const uDeleted = await prisma.user.deleteMany({
    where: { id: { in: userIdsToDelete } },
  })
  console.log(`   🗑️  ${uDeleted.count} users (with all their content via cascade)`)

  console.log(`\n✅ Cleanup complete! Only "${DEMO_EMAIL}" remains.`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error("❌ Cleanup failed:", e)
    await prisma.$disconnect()
    process.exit(1)
  })
