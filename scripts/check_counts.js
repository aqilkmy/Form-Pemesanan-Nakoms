const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const orders = await prisma.orders.count();
  const contacts = await prisma.pj_contact.count();
  const mappings = await prisma.pj_mapping.count();
  console.log('Current counts in Hostinger MySQL:', { orders, contacts, mappings });
  await prisma.$disconnect();
}

main().catch(console.error);
