const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function importRecoveredOrders() {
  const jsonPath = path.join(__dirname, '..', 'BackupDB', 'production_orders_recovered.json');
  console.log(`Reading recovered orders from ${jsonPath}...`);
  const orders = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  console.log(`Loaded ${orders.length} orders from recovered production dump.`);

  let inserted = 0;
  let updated = 0;
  let errors = 0;

  for (const o of orders) {
    try {
      const data = {
        id: o.id,
        createdAt: new Date(o.created_at),
        nama: o.nama || '',
        kementerian: o.kementerian || '',
        nomorWhatsapp: o.nomor_whatsapp || '',
        sudahBacaSop: o.sudah_baca_sop === true,
        judulDesain: o.judul_desain || null,
        platformPublikasi: o.platform_publikasi ? (typeof o.platform_publikasi === 'string' ? JSON.parse(o.platform_publikasi) : o.platform_publikasi) : null,
        tanggalPublikasi: o.tanggal_publikasi ? new Date(o.tanggal_publikasi) : null,
        waktuPublikasi: o.waktu_publikasi || null,
        linkThumbnail: o.link_thumbnail || null,
        linkFileKonten: o.link_file_konten || null,
        linkCaptionDocs: o.link_caption_docs || null,
        requestLagu: o.request_lagu || null,
        customShortlink: o.custom_shortlink || null,
        fiturTambahanWeb: o.fitur_tambahan_web || null,
        status: o.status || 'new',
        linkDesainSelesai: o.link_desain_selesai || null,
        menuType: o.menu_type || 'desain_publikasi',
        catatanWebsite: o.catatan_website || null,
        namaKegiatan: o.nama_kegiatan || null,
        tanggalKegiatan: o.tanggal_kegiatan ? new Date(o.tanggal_kegiatan) : null,
        waktuKegiatan: o.waktu_kegiatan || null,
        tempatKegiatan: o.tempat_kegiatan || null,
        jenisBantuan: o.jenis_bantuan || null,
        jenisBantuanLainnya: o.jenis_bantuan_lainnya || null,
        judulSurvey: o.judul_survey || null,
        deskripsiSurvey: o.deskripsi_survey || null,
        targetResponden: o.target_responden || null,
        deadlineSurvey: o.deadline_survey ? new Date(o.deadline_survey) : null,
        linkGdriveBrief: o.link_gdrive_brief || null,
        hadiahSurvey: o.hadiah_survey || null,
        statusPublikasi: o.status_publikasi ? (typeof o.status_publikasi === 'string' ? JSON.parse(o.status_publikasi) : o.status_publikasi) : null,
        tujuanPemesanan: o.tujuan_pemesanan || null,
        linkOriginal: o.link_original || null,
        linkPengajuanFitur: o.link_pengajuan_fitur || null,
        linkPendaftaranEvent: o.link_pendaftaran_event || null,
        isHidden: o.is_hidden === true,
        websiteSubType: o.website_sub_type || null,
        judulKampanye: o.judul_kampanye || null,
        namaUrlTwibbon: o.nama_url_twibbon || null,
        captionTwibbon: o.caption_twibbon || null,
        formatTwibbon: o.format_twibbon || null,
        warnaChromaKey: o.warna_chroma_key || null,
        tanggalPublikasiTwibbon: o.tanggal_publikasi_twibbon ? new Date(o.tanggal_publikasi_twibbon) : null,
        linkAssetTwibbon: o.link_asset_twibbon || null,
      };

      await prisma.order.upsert({
        where: { id: o.id },
        create: data,
        update: data,
      });

      inserted++;
      if (inserted % 100 === 0) {
        console.log(`Processed ${inserted}/${orders.length} orders...`);
      }
    } catch (err) {
      console.error(`Error with order ${o.id}:`, err.message);
      errors++;
    }
  }

  console.log(`\nCOMPLETED!`);
  console.log(`- Total orders processed: ${inserted}`);
  console.log(`- Total errors: ${errors}`);

  const totalInDb = await prisma.order.count();
  console.log(`- Total orders now in Hostinger MySQL: ${totalInDb}`);
}

importRecoveredOrders()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
