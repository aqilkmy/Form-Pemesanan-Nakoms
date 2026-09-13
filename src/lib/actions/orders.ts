"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Order, OrderStatus } from "@/lib/types";

// Helper to format Prisma Order model back to the application's Order type (snake_case)
function formatOrder(dbOrder: any): Order {
  return {
    id: dbOrder.id,
    created_at: dbOrder.createdAt ? new Date(dbOrder.createdAt).toISOString() : new Date().toISOString(),
    status: dbOrder.status as OrderStatus,
    menu_type: dbOrder.menuType,
    nama: dbOrder.nama,
    kementerian: dbOrder.kementerian,
    nomor_whatsapp: dbOrder.nomorWhatsapp,
    sudah_baca_sop: Boolean(dbOrder.sudahBacaSop),
    is_hidden: Boolean(dbOrder.isHidden),

    // Desain & Publikasi
    judul_desain: dbOrder.judulDesain || "",
    platform_publikasi: Array.isArray(dbOrder.platformPublikasi) 
      ? dbOrder.platformPublikasi 
      : (typeof dbOrder.platformPublikasi === 'string' ? JSON.parse(dbOrder.platformPublikasi) : []),
    tanggal_publikasi: dbOrder.tanggalPublikasi ? (dbOrder.tanggalPublikasi instanceof Date ? dbOrder.tanggalPublikasi.toISOString().split("T")[0] : String(dbOrder.tanggalPublikasi).split("T")[0]) : "",
    waktu_publikasi: dbOrder.waktuPublikasi || "",
    link_thumbnail: dbOrder.linkThumbnail || "",
    link_file_konten: dbOrder.linkFileKonten || "",
    link_caption_docs: dbOrder.linkCaptionDocs || "",
    request_lagu: dbOrder.requestLagu || "",
    custom_shortlink: dbOrder.customShortlink || "",
    fitur_tambahan_web: dbOrder.fiturTambahanWeb || "",
    link_desain_selesai: dbOrder.linkDesainSelesai || "",
    status_publikasi: typeof dbOrder.statusPublikasi === "object" && dbOrder.statusPublikasi !== null 
      ? dbOrder.statusPublikasi 
      : (typeof dbOrder.statusPublikasi === "string" ? JSON.parse(dbOrder.statusPublikasi || "{}") : {}),

    // Website & Twibbon
    website_sub_type: dbOrder.websiteSubType,
    catatan_website: dbOrder.catatanWebsite || "",
    tujuan_pemesanan: dbOrder.tujuanPemesanan || "",
    link_original: dbOrder.linkOriginal || "",
    link_pengajuan_fitur: dbOrder.linkPengajuanFitur || "",
    link_pendaftaran_event: dbOrder.linkPendaftaranEvent || "",
    judul_kampanye: dbOrder.judulKampanye || "",
    nama_url_twibbon: dbOrder.namaUrlTwibbon || "",
    caption_twibbon: dbOrder.captionTwibbon || "",
    format_twibbon: dbOrder.formatTwibbon,
    warna_chroma_key: dbOrder.warnaChromaKey || "",
    tanggal_publikasi_twibbon: dbOrder.tanggalPublikasiTwibbon ? (dbOrder.tanggalPublikasiTwibbon instanceof Date ? dbOrder.tanggalPublikasiTwibbon.toISOString().split("T")[0] : String(dbOrder.tanggalPublikasiTwibbon).split("T")[0]) : "",
    link_asset_twibbon: dbOrder.linkAssetTwibbon || "",

    // Bantuan Teknis
    nama_kegiatan: dbOrder.namaKegiatan || "",
    tanggal_kegiatan: dbOrder.tanggalKegiatan ? (dbOrder.tanggalKegiatan instanceof Date ? dbOrder.tanggalKegiatan.toISOString().split("T")[0] : String(dbOrder.tanggalKegiatan).split("T")[0]) : "",
    waktu_kegiatan: dbOrder.waktuKegiatan || "",
    tempat_kegiatan: dbOrder.tempatKegiatan || "",
    jenis_bantuan: dbOrder.jenisBantuan,
    jenis_bantuan_lainnya: dbOrder.jenisBantuanLainnya || "",

    // Survey
    judul_survey: dbOrder.judulSurvey || "",
    deskripsi_survey: dbOrder.deskripsiSurvey || "",
    target_responden: dbOrder.targetResponden || "",
    deadline_survey: dbOrder.deadlineSurvey ? (dbOrder.deadlineSurvey instanceof Date ? dbOrder.deadlineSurvey.toISOString().split("T")[0] : String(dbOrder.deadlineSurvey).split("T")[0]) : "",
    link_gdrive_brief: dbOrder.linkGdriveBrief || "",
    hadiah_survey: dbOrder.hadiahSurvey,
  } as Order;
}

// Fetch all orders
export async function getOrders(): Promise<{ data: Order[] | null; error: string | null }> {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { data: orders.map(formatOrder), error: null };
  } catch (error: any) {
    console.error("Error fetching orders from MySQL:", error);
    return { data: null, error: error.message || "Failed to fetch orders" };
  }
}

// Create new order from client form
export async function createOrder(data: any): Promise<{ success: boolean; data?: Order; error?: string }> {
  try {
    const dbData: any = {
      nama: data.nama,
      kementerian: data.kementerian,
      nomorWhatsapp: data.nomor_whatsapp,
      sudahBacaSop: Boolean(data.sudah_baca_sop),
      menuType: data.menu_type,
      status: "new",
      isHidden: false,
    };

    // Desain & Publikasi fields
    if (data.menu_type === "desain_publikasi") {
      dbData.judulDesain = data.judul_desain;
      dbData.platformPublikasi = data.platform_publikasi || [];
      if (data.tanggal_publikasi) {
        dbData.tanggalPublikasi = new Date(data.tanggal_publikasi);
      }
      dbData.waktuPublikasi = data.waktu_publikasi;
      dbData.linkFileKonten = data.link_file_konten;
      dbData.linkCaptionDocs = data.link_caption_docs;
      dbData.requestLagu = data.request_lagu || null;
      dbData.statusPublikasi = {};
    }

    // Website fields
    if (data.menu_type === "website") {
      dbData.websiteSubType = data.website_sub_type;
      dbData.tujuanPemesanan = data.tujuan_pemesanan || null;
      dbData.linkOriginal = data.link_original || null;
      dbData.customShortlink = data.custom_shortlink || null;
      dbData.linkPengajuanFitur = data.link_pengajuan_fitur || null;
      dbData.linkPendaftaranEvent = data.link_pendaftaran_event || null;
      dbData.catatanWebsite = data.catatan_website || null;

      // Twibbon specific fields
      dbData.judulKampanye = data.judul_kampanye || null;
      dbData.namaUrlTwibbon = data.nama_url_twibbon || null;
      dbData.captionTwibbon = data.caption_twibbon || null;
      dbData.formatTwibbon = data.format_twibbon || null;
      dbData.warnaChromaKey = data.warna_chroma_key || null;
      if (data.tanggal_publikasi_twibbon) {
        dbData.tanggalPublikasiTwibbon = new Date(data.tanggal_publikasi_twibbon);
      }
      dbData.linkAssetTwibbon = data.link_asset_twibbon || null;
    }

    // Bantuan Teknis fields
    if (data.menu_type === "bantuan_teknis") {
      dbData.namaKegiatan = data.nama_kegiatan;
      if (data.tanggal_kegiatan) {
        dbData.tanggalKegiatan = new Date(data.tanggal_kegiatan);
      }
      dbData.waktuKegiatan = data.waktu_kegiatan;
      dbData.tempatKegiatan = data.tempat_kegiatan;
      dbData.jenisBantuan = data.jenis_bantuan;
      dbData.jenisBantuanLainnya = data.jenis_bantuan_lainnya || null;
    }

    // Survey fields
    if (data.menu_type === "survey") {
      dbData.judulSurvey = data.judul_survey;
      dbData.deskripsiSurvey = data.deskripsi_survey;
      dbData.targetResponden = data.target_responden;
      if (data.deadline_survey) {
        dbData.deadlineSurvey = new Date(data.deadline_survey);
      }
      dbData.linkGdriveBrief = data.link_gdrive_brief;
      dbData.hadiahSurvey = data.hadiah_survey;
    }

    const created = await prisma.order.create({
      data: dbData,
    });

    revalidatePath("/monitoring");
    revalidatePath("/admin");
    revalidatePath("/jadwal");
    revalidatePath("/statistik");

    return { success: true, data: formatOrder(created) };
  } catch (error: any) {
    console.error("Error creating order in MySQL:", error);
    return { success: false, error: error.message || "Failed to create order" };
  }
}

// Update order status
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
    revalidatePath("/admin");
    revalidatePath("/monitoring");
    revalidatePath("/jadwal");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating order status:", error);
    return { success: false, error: error.message };
  }
}

// Update arbitrary fields (e.g. link_desain_selesai, status_publikasi, is_hidden)
export async function updateOrder(orderId: string, fields: Record<string, any>): Promise<{ success: boolean; error?: string }> {
  try {
    const updateData: any = {};
    
    if (fields.status !== undefined) updateData.status = fields.status;
    if (fields.link_desain_selesai !== undefined) updateData.linkDesainSelesai = fields.link_desain_selesai;
    if (fields.status_publikasi !== undefined) updateData.statusPublikasi = fields.status_publikasi;
    if (fields.is_hidden !== undefined) updateData.isHidden = Boolean(fields.is_hidden);
    if (fields.tanggal_publikasi !== undefined) {
      updateData.tanggalPublikasi = fields.tanggal_publikasi ? new Date(fields.tanggal_publikasi) : null;
    }
    if (fields.waktu_publikasi !== undefined) updateData.waktuPublikasi = fields.waktu_publikasi;

    await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    });

    revalidatePath("/admin");
    revalidatePath("/monitoring");
    revalidatePath("/jadwal");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating order:", error);
    return { success: false, error: error.message };
  }
}

// Delete an order
export async function deleteOrder(orderId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.order.delete({
      where: { id: orderId },
    });
    revalidatePath("/admin");
    revalidatePath("/monitoring");
    revalidatePath("/jadwal");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting order:", error);
    return { success: false, error: error.message };
  }
}
