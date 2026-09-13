const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const sepOrders = await prisma.order.findMany({
    where: {
      OR: [
        { tanggalPublikasi: { gte: new Date('2026-09-01') } },
        { createdAt: { gte: new Date('2026-08-30') } }
      ]
    },
    select: {
      id: true,
      nama: true,
      judulDesain: true,
      tanggalPublikasi: true,
      createdAt: true,
      status: true
    }
  });
  console.log('Orders in Hostinger MySQL matching September:', sepOrders.length);
  sepOrders.forEach(o => {
    const pub = o.tanggalPublikasi ? o.tanggalPublikasi.toISOString().slice(0, 10) : 'none';
    console.log(`  created: ${o.createdAt.toISOString().slice(0, 10)} | pub: ${pub} | ${o.nama} | ${o.judulDesain}`);
  });
}

main().finally(() => prisma.$disconnect());
