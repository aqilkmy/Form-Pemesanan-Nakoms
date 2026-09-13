const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log("Testing Prisma connection to Hostinger MySQL...");
  try {
    const ordersCount = await prisma.order.count();
    const contactsCount = await prisma.pJContact.count();
    const mappingsCount = await prisma.pJMapping.count();

    console.log("SUCCESS! Prisma successfully queried Hostinger MySQL database:");
    console.log(`- Orders in DB: ${ordersCount}`);
    console.log(`- PJ Contacts in DB: ${contactsCount}`);
    console.log(`- PJ Mappings in DB: ${mappingsCount}`);

    // Fetch sample order
    const sampleOrder = await prisma.order.findFirst();
    if (sampleOrder) {
      console.log("- Sample order fetched:", {
        id: sampleOrder.id,
        nama: sampleOrder.nama,
        kementerian: sampleOrder.kementerian,
        menuType: sampleOrder.menuType,
        status: sampleOrder.status
      });
    }
  } catch (err) {
    console.error("Prisma query failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
