import { supabase } from "./supabase";
import {
  PJ_DESAIN_GRAFIS,
  PJ_WEBSITE,
  PJ_TWIBBON,
  PJ_BANTUAN_TEKNIS,
  PJ_SURVEY,
  PJ_PLATFORM_KHUSUS,
} from "./constants";

// ─── Types ───
export interface PJContact {
  id: string;
  nama: string;
  nomor: string;
  role: PJCategory | string | null;
  created_at: string;
}

export interface PJMapping {
  id: string;
  category: string;
  lookup_key: string;
  pj_id: string | null;
  platforms: string[] | null;
  updated_at: string;
  pj_contacts?: PJContact | null;
}

export const DAYS_OF_WEEK = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
  "Minggu",
] as const;

export type PJCategory =
  | "desain_grafis"
  | "website"
  | "twibbon"
  | "bantuan_teknis"
  | "survey"
  | "platform_khusus"
  | "publikasi";

export const PJ_CATEGORY_LABELS: Record<PJCategory, string> = {
  desain_grafis: "PJ Desain Grafis",
  website: "PJ Website",
  twibbon: "PJ Twibbon",
  bantuan_teknis: "PJ Bantuan Teknis",
  survey: "PJ Survey",
  platform_khusus: "PJ Platform Khusus",
  publikasi: "PJ Publikasi",
};

// ─── Contacts CRUD ───
export async function fetchPJContacts(): Promise<PJContact[]> {
  const { data, error } = await supabase
    .from("pj_contacts")
    .select("*")
    .order("nama");
  if (error) {
    console.error("Error fetching PJ contacts:", error);
    return [];
  }
  return data as PJContact[];
}

export async function createPJContact(nama: string, nomor: string, role: string | null): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from("pj_contacts")
    .insert([{ nama, nomor, role }]);
  if (error) {
    console.error("Error creating PJ contact:", error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function updatePJContact(
  id: string,
  nama: string,
  nomor: string,
  role: string | null
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from("pj_contacts")
    .update({ nama, nomor, role })
    .eq("id", id);
  if (error) {
    console.error("Error updating PJ contact:", error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function deletePJContact(id: string): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from("pj_contacts")
    .delete()
    .eq("id", id);
  if (error) {
    console.error("Error deleting PJ contact:", error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

// ─── Mappings ───
export async function fetchAllPJMappings(): Promise<PJMapping[]> {
  const { data, error } = await supabase
    .from("pj_mappings")
    .select("*, pj_contacts(*)")
    .order("category")
    .order("lookup_key");

  if (error) {
    console.error("Error fetching PJ mappings:", error);
    return [];
  }

  return data as PJMapping[];
}

export async function updatePJMapping(
  id: string,
  pj_id: string | null,
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from("pj_mappings")
    .update({
      pj_id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Error updating PJ mapping:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function createPJMapping(
  category: string,
  lookup_key: string,
  pj_id: string | null = null,
  platforms: string[] | null = null
): Promise<{ success: boolean; data?: PJMapping; error?: string }> {
  const { data, error } = await supabase
    .from("pj_mappings")
    .insert([{ category, lookup_key, pj_id, platforms }])
    .select("*, pj_contacts(*)")
    .single();

  if (error) {
    console.error("Error creating PJ mapping:", error);
    return { success: false, error: error.message };
  }

  return { success: true, data: data as PJMapping };
}

// ─── Convert DB mappings to the same format as constants (for SuccessMessage) ───
export function buildPJLookups(mappings: PJMapping[]) {
  const desainGrafis: Record<string, { nama: string; nomor: string }> = {};
  const website: Record<string, { nama: string; nomor: string }> = {};
  const twibbon: Record<string, { nama: string; nomor: string }> = {};
  const bantuanTeknis: Record<string, { nama: string; nomor: string }> = {};
  let survey: { nama: string; nomor: string } = { nama: "", nomor: "" };
  const platformKhusus: Record<
    string,
    { nama: string; nomor: string; platforms: string[] }
  > = {};
  const publikasi: Record<string, { nama: string; nomor: string }> = {};

  mappings.forEach((m) => {
    // Skip if no PJ is assigned
    if (!m.pj_contacts) return;
    
    const contact = { nama: m.pj_contacts.nama, nomor: m.pj_contacts.nomor };

    switch (m.category) {
      case "desain_grafis":
        desainGrafis[m.lookup_key] = contact;
        break;
      case "website":
        website[m.lookup_key] = contact;
        break;
      case "twibbon":
        twibbon[m.lookup_key] = contact;
        break;
      case "bantuan_teknis":
        bantuanTeknis[m.lookup_key] = contact;
        break;
      case "survey":
        survey = contact;
        break;
      case "platform_khusus":
        platformKhusus[m.lookup_key] = {
          ...contact,
          platforms: m.platforms || [],
        };
        break;
      case "publikasi":
        publikasi[m.lookup_key] = contact;
        break;
    }
  });

  return { desainGrafis, website, twibbon, bantuanTeknis, survey, platformKhusus, publikasi };
}

// ─── Get PJ lookups with fallback to constants ───
export async function getPJLookupsWithFallback() {
  const mappings = await fetchAllPJMappings();

  if (mappings.length === 0) {
    // Fallback to constants
    return {
      desainGrafis: PJ_DESAIN_GRAFIS,
      website: PJ_WEBSITE,
      twibbon: PJ_TWIBBON,
      bantuanTeknis: PJ_BANTUAN_TEKNIS as Record<
        string,
        { nama: string; nomor: string }
      >,
      survey: PJ_SURVEY,
      platformKhusus: PJ_PLATFORM_KHUSUS,
      publikasi: {},
    };
  }

  return buildPJLookups(mappings);
}
