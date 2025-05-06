import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

async function main() {
  // Buat admin default
  const adminEmail = "admin@meesha.co"
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("admin123", 10)
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: "Admin Meesha",
        role: "ADMIN",
      },
    })
    console.log("Admin default berhasil dibuat")
  }

  // Buat kategori default
  const categories = [
    { name: "Buket Bunga" },
    { name: "Bunga Meja" },
    { name: "Bunga Papan" },
    { name: "Bunga Tangan" },
  ]

  for (const category of categories) {
    const existingCategory = await prisma.category.findFirst({
      where: { name: category.name },
    })

    if (!existingCategory) {
      await prisma.category.create({
        data: {
          name: category.name,
        },
      })
      console.log(`Kategori ${category.name} berhasil dibuat`)
    }
  }

  console.log("Seeding selesai")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
