const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function syncPJ() {
  const contactsPath = path.join(__dirname, '..', 'BackupDB', 'production_pj_contacts_recovered.json');
  const mappingsPath = path.join(__dirname, '..', 'BackupDB', 'production_pj_mappings_recovered.json');

  const contacts = JSON.parse(fs.readFileSync(contactsPath, 'utf8'));
  const mappings = JSON.parse(fs.readFileSync(mappingsPath, 'utf8'));

  console.log(`Syncing ${contacts.length} PJ Contacts...`);
  for (const c of contacts) {
    await prisma.pJContact.upsert({
      where: { id: c.id },
      create: {
        id: c.id,
        nama: c.nama,
        nomor: c.nomor,
        createdAt: new Date(c.created_at),
        role: c.role || null
      },
      update: {
        nama: c.nama,
        nomor: c.nomor,
        role: c.role || null
      }
    });
  }
  console.log('PJ Contacts synced successfully.');

  console.log(`Syncing ${mappings.length} PJ Mappings...`);
  for (const m of mappings) {
    await prisma.pJMapping.upsert({
      where: { id: m.id },
      create: {
        id: m.id,
        category: m.category,
        lookupKey: m.lookup_key,
        pjId: m.pj_id || null,
        platforms: m.platforms ? (typeof m.platforms === 'string' ? JSON.parse(m.platforms) : m.platforms) : null,
        updatedAt: new Date(m.updated_at)
      },
      update: {
        category: m.category,
        lookupKey: m.lookup_key,
        pjId: m.pj_id || null,
        platforms: m.platforms ? (typeof m.platforms === 'string' ? JSON.parse(m.platforms) : m.platforms) : null,
        updatedAt: new Date(m.updated_at)
      }
    });
  }
  console.log('PJ Mappings synced successfully.');

  const totalOrders = await prisma.order.count();
  const totalContacts = await prisma.pJContact.count();
  const totalMappings = await prisma.pJMapping.count();

  console.log('Final Hostinger MySQL DB Stats:', {
    totalOrders,
    totalContacts,
    totalMappings
  });

  await prisma.$disconnect();
}

syncPJ().catch(err => {
  console.error('Error syncing PJ:', err);
  process.exit(1);
});
