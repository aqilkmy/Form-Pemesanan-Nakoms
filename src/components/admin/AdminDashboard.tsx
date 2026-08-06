"use client";

import * as React from "react";
import { supabase } from "@/lib/supabase";
import { PostgrestError } from "@supabase/supabase-js";
import {
  PJMapping,
  PJContact,
  PJCategory,
  PJ_CATEGORY_LABELS,
  DAYS_OF_WEEK,
  fetchAllPJMappings,
  fetchPJContacts,
  createPJContact,
  updatePJContact,
  deletePJContact,
  updatePJMapping,
  createPJMapping,
} from "@/lib/pj";
import {
  Order,
  OrderStatus,
  DesainPublikasiOrder,
  WebsiteOrder,
  BantuanTeknisOrder,
  SurveyOrder,
} from "@/lib/types";
import {
  STATUS_OPTIONS,
  KEMENTERIAN_OPTIONS,
  PLATFORM_OPTIONS,
  WAKTU_PUBLIKASI_OPTIONS,
  MENU_OPTIONS,
  MenuType,
  JENIS_BANTUAN_OPTIONS,
} from "@/lib/constants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { DatePicker03 } from "@/components/shadcn-studio/date-picker/date-picker-03";
import { formatDateOnly, parseDateOnly } from "@/lib/date";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
  Loader2,
  ExternalLink,
  Filter,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Palette,
  Globe,
  Video,
  ClipboardList,
  Trash2,
  BarChart3,
  TrendingUp,
  Users2,
  CalendarRange,
  CalendarDays,
  Flame,
  Activity,
  CheckCircle2,
  XCircle,
  UserCog,
  Pencil,
  Save,
  X,
  Phone,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";
import { format } from "date-fns";

const MenuIcon = ({
  icon,
  className,
}: {
  icon: string;
  className?: string;
}) => {
  switch (icon) {
    case "palette":
      return <Palette className={className} />;
    case "globe":
      return <Globe className={className} />;
    case "video":
      return <Video className={className} />;
    case "clipboard-list":
      return <ClipboardList className={className} />;
    default:
      return null;
  }
};

type SortOption = "waktu_pemesanan" | "deadline";
type DashboardTab = MenuType | "statistik" | "kelola_pj";

const COLLISION_EXEMPT_WAKTU_PUBLIKASI = new Set([
  "12.00 (Instagram Story)",
  "18.00 (Instagram Story)",
]);

const HEATMAP_LEVEL_CLASSES = [
  "bg-emerald-50 dark:bg-emerald-950",
  "bg-emerald-100 dark:bg-emerald-900",
  "bg-emerald-200 dark:bg-emerald-800",
  "bg-emerald-300 dark:bg-emerald-700",
  "bg-emerald-400 dark:bg-emerald-600",
  "bg-emerald-500 dark:bg-emerald-500",
  "bg-emerald-600 dark:bg-emerald-400",
  "bg-emerald-700 dark:bg-emerald-300",
  "bg-emerald-800 dark:bg-emerald-200",
  "bg-emerald-900 dark:bg-emerald-100",
];

const MENU_BADGE_STYLES: Record<MenuType, string> = {
  desain_publikasi: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200",
  website: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200",
  bantuan_teknis: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  survey: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
};

function getHeatmapLevel(count: number, maxCount: number): string {
  if (count === 0) return "bg-muted/40 ring-1 ring-inset ring-border";

  const ratio = count / Math.max(maxCount, 1);
  const levelIndex = Math.min(
    HEATMAP_LEVEL_CLASSES.length - 1,
    Math.max(0, Math.ceil(ratio * HEATMAP_LEVEL_CLASSES.length) - 1),
  );

  return HEATMAP_LEVEL_CLASSES[levelIndex];
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="border-border/60 bg-linear-to-br from-background to-muted/30 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              {title}
            </p>
            <div className="mt-2 text-2xl font-bold tracking-tight">{value}</div>
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          </div>
          <div className="rounded-xl bg-primary/10 p-2 text-primary">
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Type guard functions
function isDesainPublikasi(order: Order): order is DesainPublikasiOrder {
  return order.menu_type === "desain_publikasi";
}
function isWebsite(order: Order): order is WebsiteOrder {
  return order.menu_type === "website";
}
function isBantuanTeknis(order: Order): order is BantuanTeknisOrder {
  return order.menu_type === "bantuan_teknis";
}
function isSurvey(order: Order): order is SurveyOrder {
  return order.menu_type === "survey";
}

function isPublicationChecklistCompleted(order: DesainPublikasiOrder): boolean {
  if (!order.platform_publikasi || order.platform_publikasi.length === 0) {
    return false;
  }

  return order.platform_publikasi.every(
    (platform) => order.status_publikasi?.[platform] === true,
  );
}

function isCollisionExempt(order: DesainPublikasiOrder): boolean {
  return COLLISION_EXEMPT_WAKTU_PUBLIKASI.has(order.waktu_publikasi);
}

/** Returns the relevant content/upload date key (yyyy-MM-dd) for heatmap.
 *  - desain_publikasi → tanggal_publikasi
 *  - bantuan_teknis   → tanggal_kegiatan
 *  - survey           → deadline_survey
 *  - website          → created_at (no content date field)
 */
function getContentDateKey(order: Order): string | null {
  switch (order.menu_type) {
    case "desain_publikasi":
      return (order as DesainPublikasiOrder).tanggal_publikasi || null;
    case "bantuan_teknis":
      return (order as BantuanTeknisOrder).tanggal_kegiatan || null;
    case "survey":
      return (order as SurveyOrder).deadline_survey || null;
    case "website": {
      const d = new Date(order.created_at);
      return Number.isNaN(d.getTime()) ? null : format(d, "yyyy-MM-dd");
    }
    default:
      return null;
  }
}

export function AdminDashboard() {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<DashboardTab>(
    "desain_publikasi",
  );

  // Filter states
  const [filterKementerian, setFilterKementerian] =
    React.useState<string>("all-kementerian");
  const [filterStatus, setFilterStatus] = React.useState<string>("all-status");
  const [filterDate, setFilterDate] = React.useState<string>("");
  const [filterPlatform, setFilterPlatform] =
    React.useState<string>("all-platform");
  const [filterVisibility, setFilterVisibility] =
    React.useState<string>("all-visibility");
  const [sortBy, setSortBy] = React.useState<SortOption>("waktu_pemesanan");
  const [expandedDesainOrderIds, setExpandedDesainOrderIds] = React.useState<
    string[]
  >([]);

  // Pagination states
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState("25");

  // PJ management states
  const [pjMappings, setPjMappings] = React.useState<PJMapping[]>([]);
  const [pjContacts, setPjContacts] = React.useState<PJContact[]>([]);
  const [isPjLoading, setIsPjLoading] = React.useState(false);

  // States for Master PJ
  const [editingContactId, setEditingContactId] = React.useState<string | null>(null);
  const [contactNama, setContactNama] = React.useState("");
  const [contactNomor, setContactNomor] = React.useState("");
  const [contactRole, setContactRole] = React.useState<string | null>(null);
  const [contactSaving, setContactSaving] = React.useState(false);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, filterKementerian, filterStatus, filterDate, filterPlatform, filterVisibility, sortBy]);

  React.useEffect(() => {
    fetchOrders();
    fetchPJs();

    const channel = supabase
      .channel("orders_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setOrders((prev) => [payload.new as Order, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setOrders((prev) =>
              prev.map((order) =>
                order.id === (payload.new as Order).id
                  ? (payload.new as Order)
                  : order,
              ),
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setOrders(data as Order[]);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPJs = async () => {
    setIsPjLoading(true);
    try {
      let [mappings, contacts] = await Promise.all([
        fetchAllPJMappings(),
        fetchPJContacts(),
      ]);

      // Ensure default day mappings exist for 'publikasi' category
      const existingPublikasiDays = new Set(
        mappings.filter((m) => m.category === "publikasi").map((m) => m.lookup_key)
      );
      let createdAny = false;
      for (const day of DAYS_OF_WEEK) {
        if (!existingPublikasiDays.has(day)) {
          await createPJMapping("publikasi", day);
          createdAny = true;
        }
      }
      if (createdAny) {
        mappings = await fetchAllPJMappings();
      }

      setPjMappings(mappings);
      setPjContacts(contacts);
    } catch (error) {
      console.error("Error fetching PJs:", error);
    } finally {
      setIsPjLoading(false);
    }
  };

  const startEditContact = (contact: PJContact | null) => {
    if (contact) {
      setEditingContactId(contact.id);
      setContactNama(contact.nama);
      setContactNomor(contact.nomor);
      setContactRole(contact.role || null);
    } else {
      setEditingContactId("new");
      setContactNama("");
      setContactNomor("");
      setContactRole(null);
    }
  };

  const cancelEditContact = () => {
    setEditingContactId(null);
    setContactNama("");
    setContactNomor("");
    setContactRole(null);
  };

  const saveContact = async () => {
    if (!contactNama || !contactNomor || !contactRole) {
      alert("Nama, Nomor, dan Kategori Role harus diisi!");
      return;
    }
    setContactSaving(true);
    try {
      let res;
      if (editingContactId && editingContactId !== "new") {
        res = await updatePJContact(editingContactId, contactNama, contactNomor, contactRole);
      } else {
        res = await createPJContact(contactNama, contactNomor, contactRole);
      }
      
      if (res.success) {
        await fetchPJs();
        cancelEditContact();
      } else {
        alert("Gagal menyimpan kontak PJ: " + res.error);
      }
    } catch (e) {
      console.error(e);
      alert("Terjadi kesalahan");
    } finally {
      setContactSaving(false);
    }
  };

  const hapusContact = async (id: string) => {
    if (!confirm("Yakin ingin menghapus PJ ini? Kementrian yang ditugaskan akan menjadi kosong.")) return;
    setContactSaving(true);
    try {
      const res = await deletePJContact(id);
      if (res.success) {
        await fetchPJs();
      } else {
        alert("Gagal menghapus PJ: " + res.error);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setContactSaving(false);
    }
  };

  const handleMappingChange = async (mappingId: string, newPjId: string) => {
    const pjId = newPjId === "none" ? null : newPjId;
    try {
      const res = await updatePJMapping(mappingId, pjId);
      if (res.success) {
        await fetchPJs();
      } else {
        alert("Gagal merubah penugasan PJ.");
      }
    } catch(e) {
      console.error(e);
    }
  };

  const helperDate = (d: string) => {
    try {
      return new Date(d).toLocaleString("id-ID", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return d;
    }
  };

  const formatDate = (d: string) => {
    if (!d) return "-";
    try {
      return formatDateOnly(d, {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (e) {
      return d;
    }
  };

  const updateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order,
        ),
      );
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Gagal mengubah status");
    }
  };

  const updateField = async (orderId: string, field: string, value: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ [field]: value })
        .eq("id", orderId);

      if (error) throw error;

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, [field]: value } : order,
        ),
      );
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      alert(`Gagal menyimpan ${field}`);
    }
  };

  const toggleHideOrder = async (orderId: string, currentIsHidden: boolean) => {
    const nextState = !currentIsHidden;
    try {
      const { error } = await supabase
        .from("orders")
        .update({ is_hidden: nextState })
        .eq("id", orderId);

      if (error) throw error;

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, is_hidden: nextState } : order,
        ),
      );
    } catch (error) {
      console.error("Error updating is_hidden:", error);
      alert("Gagal mengubah status visibilitas pesanan");
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus pesanan ini?")) {
      return;
    }

    try {
      const { data, error, status } = await supabase
        .from("orders")
        .delete()
        .eq("id", orderId)
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
        console.error("No rows deleted. Status:", status);
        alert(
          "Gagal menghapus: Data tidak ditemukan atau izin ditolak (RLS). Pastikan SQL Policy DELETE sudah diaktifkan di Supabase Dashboard.",
        );
        return;
      }

      setOrders((prev) => prev.filter((order) => order.id !== orderId));
    } catch (error) {
      const postgrestError = error as PostgrestError;
      console.error("Error deleting order:", postgrestError);
      alert(`Error: ${postgrestError.message || "Terjadi kesalahan saat menghapus"}`);
    }
  };

  const getStatusColor = (status: string) => {
    const option = STATUS_OPTIONS.find((opt) => opt.value === status);
    return option?.color || "bg-gray-100 text-gray-800";
  };



  const getJenisBantuanLabel = (jenis: string) => {
    const option = JENIS_BANTUAN_OPTIONS.find((o) => o.id === jenis);
    return option?.label || jenis;
  };

  // Check for schedule collisions (same date + time) for Desain & Publikasi
  const scheduleCollisions = React.useMemo(() => {
    const desainOrders = orders
      .filter(isDesainPublikasi)
      .filter((o) => o.status !== "cancel")
      .filter((o) => !isPublicationChecklistCompleted(o))
      .filter((o) => !isCollisionExempt(o));
    const collisionMap: { [key: string]: DesainPublikasiOrder[] } = {};

    desainOrders.forEach((order) => {
      const key = `${order.tanggal_publikasi}_${order.waktu_publikasi}`;
      if (!collisionMap[key]) {
        collisionMap[key] = [];
      }
      collisionMap[key].push(order);
    });

    // Return only keys with more than 1 order
    const collisions: { [key: string]: DesainPublikasiOrder[] } = {};
    Object.keys(collisionMap).forEach((key) => {
      if (collisionMap[key].length > 1) {
        collisions[key] = collisionMap[key];
      }
    });

    return collisions;
  }, [orders]);

  const hasCollision = (order: DesainPublikasiOrder) => {
    const key = `${order.tanggal_publikasi}_${order.waktu_publikasi}`;
    return scheduleCollisions[key] && scheduleCollisions[key].length > 1;
  };

  // Filter by menu type and other filters
  const filteredOrders = React.useMemo(() => {
    let result = orders.filter((o) => o.menu_type === activeTab);

    if (filterKementerian && filterKementerian !== "all-kementerian") {
      result = result.filter((o) => o.kementerian === filterKementerian);
    }
    if (filterStatus && filterStatus !== "all-status") {
      result = result.filter((o) => o.status === filterStatus);
    }

    // Date filter based on menu type
    if (filterDate) {
      result = result.filter((o) => {
        if (isDesainPublikasi(o)) return o.tanggal_publikasi === filterDate;
        if (isBantuanTeknis(o)) return o.tanggal_kegiatan === filterDate;
        if (isSurvey(o)) return o.deadline_survey === filterDate;
        return true;
      });
    }

    // Platform filter (only for desain_publikasi)
    if (
      filterPlatform &&
      filterPlatform !== "all-platform" &&
      activeTab === "desain_publikasi"
    ) {
      result = result.filter((o) => {
        if (isDesainPublikasi(o)) {
          return o.platform_publikasi?.includes(filterPlatform);
        }
        return true;
      });
    }

    // Apply sorting
    if (sortBy === "waktu_pemesanan") {
      result.sort((a, b) => {
        if (a.created_at > b.created_at) return -1;
        if (a.created_at < b.created_at) return 1;
        return 0;
      });
    } else if (sortBy === "deadline") {
      result.sort((a, b) => {
        const aIsNotCancel = a.status !== "cancel";
        const bIsNotCancel = b.status !== "cancel";

        if (aIsNotCancel && !bIsNotCancel) return -1;
        if (!aIsNotCancel && bIsNotCancel) return 1;

        // Get deadline dates based on menu type
        const getDeadlineDate = (order: Order): string | null => {
          if (isDesainPublikasi(order)) return order.tanggal_publikasi;
          if (isBantuanTeknis(order)) return order.tanggal_kegiatan;
          if (isSurvey(order)) return order.deadline_survey;
          return null;
        };

        const aDate = getDeadlineDate(a);
        const bDate = getDeadlineDate(b);

        if (!aDate && !bDate) return 0;
        if (!aDate) return 1;
        if (!bDate) return -1;

        return new Date(aDate).getTime() - new Date(bDate).getTime();
      });

      if (activeTab === "desain_publikasi") {
        result = result.filter(
          (order) =>
            !isDesainPublikasi(order) ||
            !isPublicationChecklistCompleted(order),
        );
      }
    }

    if (filterVisibility === "visible") {
      result = result.filter((o) => !o.is_hidden);
    } else if (filterVisibility === "hidden") {
      result = result.filter((o) => o.is_hidden === true);
    }

    return result;
  }, [
    orders,
    activeTab,
    filterKementerian,
    filterStatus,
    filterDate,
    filterPlatform,
    filterVisibility,
    sortBy,
  ]);

  // Pagination logic
  const paginatedOrders = React.useMemo(() => {
    if (itemsPerPage === "all") return filteredOrders;
    const limit = parseInt(itemsPerPage, 10);
    const start = (currentPage - 1) * limit;
    return filteredOrders.slice(start, start + limit);
  }, [filteredOrders, currentPage, itemsPerPage]);

  const totalPages = React.useMemo(() => {
    if (itemsPerPage === "all") return 1;
    const limit = parseInt(itemsPerPage, 10);
    return Math.max(1, Math.ceil(filteredOrders.length / limit));
  }, [filteredOrders.length, itemsPerPage]);

  // Handle schedule collision for desain_publikasi type
  const menuCounts = React.useMemo(() => {
    return {
      desain_publikasi: orders.filter((o) => o.menu_type === "desain_publikasi")
        .length,
      website: orders.filter((o) => o.menu_type === "website").length,
      bantuan_teknis: orders.filter((o) => o.menu_type === "bantuan_teknis")
        .length,
      survey: orders.filter((o) => o.menu_type === "survey").length,
    };
  }, [orders]);

  const statusCounts = React.useMemo(() => {
    return STATUS_OPTIONS.map((status) => ({
      ...status,
      count: orders.filter((order) => order.status === status.value).length,
    }));
  }, [orders]);

  const kementerianStats = React.useMemo(() => {
    const counts = new Map<string, number>();
    const menuCountsByKementerian = new Map<
      string,
      Record<MenuType, number>
    >();

    orders.forEach((order) => {
      counts.set(order.kementerian, (counts.get(order.kementerian) || 0) + 1);

      const currentMenuCounts = menuCountsByKementerian.get(order.kementerian) ?? {
        desain_publikasi: 0,
        website: 0,
        bantuan_teknis: 0,
        survey: 0,
      };
      currentMenuCounts[order.menu_type] += 1;
      menuCountsByKementerian.set(order.kementerian, currentMenuCounts);
    });

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "id"))
      .map(([kementerian, count]) => ({
        kementerian,
        count,
        menuCounts: menuCountsByKementerian.get(kementerian) ?? {
          desain_publikasi: 0,
          website: 0,
          bantuan_teknis: 0,
          survey: 0,
        },
      }));
  }, [orders]);

  const orderStats = React.useMemo(() => {
    const total = orders.length;
    const active = orders.filter((order) => order.status !== "cancel").length;
    const completed = orders.filter((order) => order.status === "ready").length;
    const uniqueKementerian = new Set(orders.map((order) => order.kementerian)).size;

    const menuBreakdown = MENU_OPTIONS.map((menu) => ({
      ...menu,
      count: orders.filter((order) => order.menu_type === menu.id).length,
    }));

    // Per-menu breakdown: completed (ready) and cancelled counts
    const menuStatusBreakdown = MENU_OPTIONS.map((menu) => {
      const menuOrders = orders.filter((o) => o.menu_type === menu.id);
      return {
        ...menu,
        total: menuOrders.length,
        completed: menuOrders.filter((o) => o.status === "ready").length,
        cancelled: menuOrders.filter((o) => o.status === "cancel").length,
      };
    });

    // Heatmap: use content dates (tanggal_publikasi / tanggal_kegiatan / deadline_survey)
    const contentDateCounts = new Map<string, number>();
    orders.forEach((order) => {
      const key = getContentDateKey(order);
      if (!key) return;
      contentDateCounts.set(key, (contentDateCounts.get(key) || 0) + 1);
    });

    const days: { date: Date; key: string; count: number }[] = [];
    const today = new Date();
    for (let offset = 83; offset >= 0; offset -= 1) {
      const day = new Date(today);
      day.setDate(today.getDate() - offset);
      const key = format(day, "yyyy-MM-dd");
      days.push({ date: day, key, count: contentDateCounts.get(key) || 0 });
    }

    const heatmapWeeks: typeof days[] = [];
    for (let index = 0; index < days.length; index += 7) {
      heatmapWeeks.push(days.slice(index, index + 7));
    }

    const busiestDay = days.reduce(
      (best, current) => (current.count > best.count ? current : best),
      days[0] || { date: today, key: format(today, "yyyy-MM-dd"), count: 0 },
    );

    // Count only orders with content dates that fall within the 84-day window for average
    const windowStart = format(
      new Date(today.getFullYear(), today.getMonth(), today.getDate() - 83),
      "yyyy-MM-dd",
    );
    const windowEnd = format(today, "yyyy-MM-dd");
    let contentCountInWindow = 0;
    orders.forEach((order) => {
      const key = getContentDateKey(order);
      if (key && key >= windowStart && key <= windowEnd) {
        contentCountInWindow += 1;
      }
    });

    return {
      total,
      active,
      completed,
      uniqueKementerian,
      menuBreakdown,
      menuStatusBreakdown,
      days,
      heatmapWeeks,
      busiestDay,
      averagePerDay: contentCountInWindow / 84,
    };
  }, [orders]);

  const heatmapMaxCount = React.useMemo(
    () => Math.max(1, ...orderStats.days.map((day) => day.count)),
    [orderStats.days],
  );

  const heatmapMonthLabels = React.useMemo(() => {
    return orderStats.heatmapWeeks.map((week, index) => {
      const firstDay = week[0];
      const currentLabel = firstDay ? format(firstDay.date, "MMM") : "";
      const previousWeek = orderStats.heatmapWeeks[index - 1];
      const previousLabel = previousWeek?.[0]
        ? format(previousWeek[0].date, "MMM")
        : "";

      return currentLabel !== previousLabel ? currentLabel : "";
    });
  }, [orderStats.heatmapWeeks]);

  const heatmapLabels = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  const percentageFromTotal = (count: number) =>
    orderStats.total > 0 ? Math.round((count / orderStats.total) * 100) : 0;

  const clearFilters = () => {
    setFilterKementerian("all-kementerian");
    setFilterStatus("all-status");
    setFilterDate("");
    setFilterPlatform("all-platform");
    setFilterVisibility("all-visibility");
  };

  const toggleDesainOrderDetail = (orderId: string) => {
    setExpandedDesainOrderIds((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId],
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Collision warning component
  const CollisionWarning = () => {
    const collisionCount = Object.keys(scheduleCollisions).length;
    if (collisionCount === 0 || activeTab !== "desain_publikasi") return null;

    return (
      <Card className="border-destructive/20 bg-destructive/10 mb-6">
        <CardContent className="py-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div className="text-destructive">
              <p className="font-semibold">
                Peringatan: Jadwal Upload Bersamaan
              </p>
              <p className="text-sm text-destructive/90 mt-1">
                Ada {collisionCount} jadwal dengan lebih dari 1 pesanan:
              </p>
              <ul className="text-sm text-destructive/90 mt-2 space-y-1">
                {Object.entries(scheduleCollisions).map(([key, orders]) => (
                  <li key={key} className="flex items-center gap-2">
                    <span className="font-medium">
                      {formatDate(key.split("_")[0])} - {key.split("_")[1]}:
                    </span>
                    <span>
                      {orders.map((o) => o.judul_desain).join(", ")} (
                      {orders.length} pesanan)
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render table based on active tab
  const renderTable = () => {
    switch (activeTab) {
      case "statistik":
        return null;
      case "desain_publikasi":
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Waktu</TableHead>
                <TableHead>Pemesan</TableHead>
                <TableHead>Judul & Platform</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Aset</TableHead>
                <TableHead>Request Lagu</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Status Publikasi</TableHead>
                <TableHead>Link Desain</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOrders.filter(isDesainPublikasi).map((order) => {
                const isExpanded = expandedDesainOrderIds.includes(order.id);

                return (
                  <React.Fragment key={order.id}>
                    <TableRow
                      className={
                        hasCollision(order)
                          ? "bg-destructive/10 hover:bg-destructive/20"
                          : ""
                      }
                    >
                      <TableCell className="font-medium whitespace-nowrap">
                        {helperDate(order.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold">{order.nama}</span>
                          {order.is_hidden && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 font-medium whitespace-nowrap inline-flex items-center gap-0.5">
                              <EyeOff className="w-2.5 h-2.5" />
                              Tersembunyi
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {order.kementerian}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {order.nomor_whatsapp}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="font-medium truncate">
                          {order.judul_desain}
                        </div>
                        <div className="text-[10px] mt-1 flex flex-wrap gap-1">
                          {order.platform_publikasi?.map((p) => (
                            <span
                              key={p}
                              className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-[9px]"
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleDesainOrderDetail(order.id)}
                          className="h-6 px-2 mt-1 text-[10px]"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-3 h-3 mr-1" />
                          ) : (
                            <ChevronDown className="w-3 h-3 mr-1" />
                          )}
                          {isExpanded ? "Sembunyikan" : "Detail"}
                        </Button>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <DatePicker03
                            date={parseDateOnly(order.tanggal_publikasi)}
                            setDate={(date) => {
                              const formatted = date
                                ? format(date, "yyyy-MM-dd")
                                : "";
                              if (formatted !== order.tanggal_publikasi) {
                                updateField(
                                  order.id,
                                  "tanggal_publikasi",
                                  formatted,
                                );
                              }
                            }}
                            className="h-7 text-[10px] w-28 px-2"
                          />
                          <Select
                            defaultValue={order.waktu_publikasi}
                            onValueChange={(v) =>
                              updateField(order.id, "waktu_publikasi", v)
                            }
                          >
                            <SelectTrigger className="h-7 text-[10px] w-28 px-2">
                              <SelectValue placeholder="Waktu" />
                            </SelectTrigger>
                            <SelectContent>
                              {WAKTU_PUBLIKASI_OPTIONS.map((w) => (
                                <SelectItem key={w} value={w}>
                                  {w}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {hasCollision(order) && (
                          <div className="flex items-center gap-1 mt-1 text-destructive">
                            <AlertTriangle className="w-3 h-3" />
                            <span className="text-[9px]">Tabrakan!</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <a
                            href={order.link_file_konten}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline flex items-center text-[10px]"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" /> Files
                          </a>
                          <a
                            href={order.link_caption_docs}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline flex items-center text-[10px]"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" /> Caption
                          </a>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-37.5">
                        <div
                          className="text-[10px] text-gray-700 truncate"
                          title={order.request_lagu || ""}
                        >
                          {order.request_lagu || "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={order.status || "new"}
                          onValueChange={(v) =>
                            updateStatus(order.id, v as OrderStatus)
                          }
                        >
                          <SelectTrigger
                            className={`h-7 text-[10px] w-24 px-2 rounded-full font-semibold border-0 ${getStatusColor(order.status)}`}
                          >
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1.5">
                          {order.platform_publikasi?.map((platform) => {
                            const isChecked =
                              order.status_publikasi?.[platform] || false;
                            return (
                              <div
                                key={platform}
                                className="flex items-center gap-1.5"
                              >
                                <Checkbox
                                  id={`status-${order.id}-${platform}`}
                                  checked={isChecked}
                                  onCheckedChange={async (checked) => {
                                    const newStatusPublikasi = {
                                      ...(order.status_publikasi || {}),
                                      [platform]: checked === true,
                                    };
                                    try {
                                      const { error } = await supabase
                                        .from("orders")
                                        .update({
                                          status_publikasi: newStatusPublikasi,
                                        })
                                        .eq("id", order.id);
                                      if (error) throw error;
                                      setOrders((prev) =>
                                        prev.map((o) =>
                                          o.id === order.id
                                            ? ({
                                                ...o,
                                                status_publikasi:
                                                  newStatusPublikasi,
                                              } as Order)
                                            : o,
                                        ),
                                      );
                                    } catch (error) {
                                      console.error(
                                        "Error updating status_publikasi:",
                                        error,
                                      );
                                    }
                                  }}
                                  className="h-3 w-3"
                                />
                                <Label
                                  htmlFor={`status-${order.id}-${platform}`}
                                  className={`text-[9px] cursor-pointer leading-none ${isChecked ? "text-green-700 line-through" : "text-gray-600"}`}
                                >
                                  {platform}
                                </Label>
                              </div>
                            );
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Input
                            type="text"
                            placeholder="Link..."
                            defaultValue={order.link_desain_selesai || ""}
                            onBlur={(e) => {
                              if (
                                e.target.value !==
                                (order.link_desain_selesai || "")
                              ) {
                                updateField(
                                  order.id,
                                  "link_desain_selesai",
                                  e.target.value,
                                );
                              }
                            }}
                            className="h-7 text-[10px] w-24 px-2"
                          />
                          {order.link_desain_selesai && (
                            <a
                              href={order.link_desain_selesai}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`h-7 w-7 transition-colors ${
                              order.is_hidden
                                ? "text-amber-600 bg-amber-50 hover:bg-amber-100 hover:text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 dark:hover:bg-amber-900/60"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                            }`}
                            title={
                              order.is_hidden
                                ? "Pesanan tersembunyi dari monitoring (Klik untuk tampilkan)"
                                : "Sembunyikan dari monitoring non-admin"
                            }
                            onClick={() => toggleHideOrder(order.id, !!order.is_hidden)}
                          >
                            {order.is_hidden ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => deleteOrder(order.id)}
                            title="Hapus pesanan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>

                    {isExpanded && (
                      <TableRow className="bg-muted/30">
                        <TableCell colSpan={10}>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs py-1">
                            <div>
                              <span className="font-semibold">Judul lengkap:</span>{" "}
                              {order.judul_desain}
                            </div>
                            <div>
                              <span className="font-semibold">Platform:</span>{" "}
                              {order.platform_publikasi?.join(", ") || "-"}
                            </div>
                            <div>
                              <span className="font-semibold">File konten:</span>{" "}
                              <a
                                href={order.link_file_konten}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                Lihat file konten
                              </a>
                            </div>
                            <div>
                              <span className="font-semibold">Caption docs:</span>{" "}
                              <a
                                href={order.link_caption_docs}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                Lihat caption docs
                              </a>
                            </div>
                            <div>
                              <span className="font-semibold">Request lagu:</span>{" "}
                              {order.request_lagu || "-"}
                            </div>
                            <div>
                              <span className="font-semibold">Nomor WhatsApp:</span>{" "}
                              {order.nomor_whatsapp}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        );

      case "website":
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Waktu</TableHead>
                <TableHead>Pemesan</TableHead>
                <TableHead>Tujuan</TableHead>
                <TableHead>Link & Shortlink</TableHead>
                <TableHead>Lampiran</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOrders.filter(isWebsite).map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium whitespace-nowrap">
                    {helperDate(order.created_at)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold">{order.nama}</span>
                      {order.is_hidden && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 font-medium whitespace-nowrap inline-flex items-center gap-0.5">
                          <EyeOff className="w-2.5 h-2.5" />
                          Tersembunyi
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {order.kementerian}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {order.nomor_whatsapp}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <span className="font-medium text-xs">
                      {order.website_sub_type === "twibbon" ? (order.judul_kampanye || "-") : (order.tujuan_pemesanan || "-")}
                    </span>
                    {order.website_sub_type && (
                      <div className="mt-0.5">
                        <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                          order.website_sub_type === "twibbon" ? "bg-purple-100 text-purple-700" :
                          order.website_sub_type === "shortlink" ? "bg-amber-100 text-amber-700" :
                          "bg-blue-100 text-blue-700"
                        }`}>
                          {order.website_sub_type === "twibbon" ? "Twibbon" :
                           order.website_sub_type === "shortlink" ? "Shortlink" : "Laman"}
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-[10px]">
                      {order.link_original && (
                        <a
                          href={order.link_original}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline flex items-center"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" /> Original
                        </a>
                      )}
                      {order.custom_shortlink && (
                        <span className="text-gray-700 font-medium">
                          → {order.custom_shortlink}
                        </span>
                      )}
                      {!order.link_original && !order.custom_shortlink && "-"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {order.link_pengajuan_fitur && (
                        <a
                          href={order.link_pengajuan_fitur}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline flex items-center text-[10px]"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" /> Fitur
                        </a>
                      )}
                      {order.link_pendaftaran_event && (
                        <a
                          href={order.link_pendaftaran_event}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline flex items-center text-[10px]"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" /> Event
                        </a>
                      )}
                      {!order.link_pengajuan_fitur &&
                        !order.link_pendaftaran_event &&
                        "-"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={order.status || "new"}
                      onValueChange={(v) =>
                        updateStatus(order.id, v as OrderStatus)
                      }
                    >
                      <SelectTrigger
                        className={`h-7 text-[10px] w-24 px-2 rounded-full font-semibold border-0 ${getStatusColor(order.status)}`}
                      >
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-7 w-7 transition-colors ${
                          order.is_hidden
                            ? "text-amber-600 bg-amber-50 hover:bg-amber-100 hover:text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 dark:hover:bg-amber-900/60"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                        title={
                          order.is_hidden
                            ? "Pesanan tersembunyi dari monitoring (Klik untuk tampilkan)"
                            : "Sembunyikan dari monitoring non-admin"
                        }
                        onClick={() => toggleHideOrder(order.id, !!order.is_hidden)}
                      >
                        {order.is_hidden ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => deleteOrder(order.id)}
                        title="Hapus pesanan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );

      case "bantuan_teknis":
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Waktu</TableHead>
                <TableHead>Pemesan</TableHead>
                <TableHead>Kegiatan</TableHead>
                <TableHead>Jadwal & Tempat</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOrders.filter(isBantuanTeknis).map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium whitespace-nowrap">
                    {helperDate(order.created_at)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold">{order.nama}</span>
                      {order.is_hidden && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 font-medium whitespace-nowrap inline-flex items-center gap-0.5">
                          <EyeOff className="w-2.5 h-2.5" />
                          Tersembunyi
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {order.kementerian}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {order.nomor_whatsapp}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="font-medium text-xs truncate">
                      {order.nama_kegiatan}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <DatePicker03
                        date={parseDateOnly(order.tanggal_kegiatan)}
                        setDate={(date) => {
                          const formatted = date
                            ? format(date, "yyyy-MM-dd")
                            : "";
                          if (formatted !== order.tanggal_kegiatan) {
                            updateField(
                              order.id,
                              "tanggal_kegiatan",
                              formatted,
                            );
                          }
                        }}
                        className="h-7 text-[10px] w-28 px-2"
                      />
                      <Input
                        type="time"
                        defaultValue={order.waktu_kegiatan}
                        onBlur={(e) => {
                          if (e.target.value !== order.waktu_kegiatan) {
                            updateField(
                              order.id,
                              "waktu_kegiatan",
                              e.target.value,
                            );
                          }
                        }}
                        className="h-7 text-[10px] w-28 px-2"
                      />
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1">
                      {order.tempat_kegiatan}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded text-[10px] font-medium">
                      {getJenisBantuanLabel(order.jenis_bantuan)}
                    </span>
                    {order.jenis_bantuan === "lainnya" &&
                      order.jenis_bantuan_lainnya && (
                        <div className="text-[10px] text-muted-foreground mt-1">
                          {order.jenis_bantuan_lainnya}
                        </div>
                      )}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={order.status || "new"}
                      onValueChange={(v) =>
                        updateStatus(order.id, v as OrderStatus)
                      }
                    >
                      <SelectTrigger
                        className={`h-7 text-[10px] w-24 px-2 rounded-full font-semibold border-0 ${getStatusColor(order.status)}`}
                      >
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-7 w-7 transition-colors ${
                          order.is_hidden
                            ? "text-amber-600 bg-amber-50 hover:bg-amber-100 hover:text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 dark:hover:bg-amber-900/60"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                        title={
                          order.is_hidden
                            ? "Pesanan tersembunyi dari monitoring (Klik untuk tampilkan)"
                            : "Sembunyikan dari monitoring non-admin"
                        }
                        onClick={() => toggleHideOrder(order.id, !!order.is_hidden)}
                      >
                        {order.is_hidden ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => deleteOrder(order.id)}
                        title="Hapus pesanan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );

      case "survey":
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Waktu</TableHead>
                <TableHead>Pemesan</TableHead>
                <TableHead>Judul Survey</TableHead>
                <TableHead>Target & Deadline</TableHead>
                <TableHead>Hadiah</TableHead>
                <TableHead>Brief</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOrders.filter(isSurvey).map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium whitespace-nowrap">
                    {helperDate(order.created_at)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold">{order.nama}</span>
                      {order.is_hidden && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 font-medium whitespace-nowrap inline-flex items-center gap-0.5">
                          <EyeOff className="w-2.5 h-2.5" />
                          Tersembunyi
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {order.kementerian}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {order.nomor_whatsapp}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="font-medium text-xs truncate">
                      {order.judul_survey}
                    </div>
                    <div className="text-[10px] text-muted-foreground whitespace-normal wrap-break-word">
                      {order.deskripsi_survey}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-[10px] mb-1">{order.target_responden}</div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-muted-foreground">
                        Deadline:
                      </span>
                      <DatePicker03
                        date={parseDateOnly(order.deadline_survey)}
                        setDate={(date) => {
                          const formatted = date
                            ? format(date, "yyyy-MM-dd")
                            : "";
                          if (formatted !== order.deadline_survey) {
                            updateField(order.id, "deadline_survey", formatted);
                          }
                        }}
                        className="h-6 text-[10px] w-28 px-2"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${order.hadiah_survey === "ada" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}
                    >
                      {order.hadiah_survey === "ada" ? "Ada" : "Tidak"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <a
                      href={order.link_gdrive_brief}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline flex items-center text-[10px]"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" /> Lihat
                    </a>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={order.status || "new"}
                      onValueChange={(v) =>
                        updateStatus(order.id, v as OrderStatus)
                      }
                    >
                      <SelectTrigger
                        className={`h-7 text-[10px] w-24 px-2 rounded-full font-semibold border-0 ${getStatusColor(order.status)}`}
                      >
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-7 w-7 transition-colors ${
                          order.is_hidden
                            ? "text-amber-600 bg-amber-50 hover:bg-amber-100 hover:text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 dark:hover:bg-amber-900/60"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                        title={
                          order.is_hidden
                            ? "Pesanan tersembunyi dari monitoring (Klik untuk tampilkan)"
                            : "Sembunyikan dari monitoring non-admin"
                        }
                        onClick={() => toggleHideOrder(order.id, !!order.is_hidden)}
                      >
                        {order.is_hidden ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => deleteOrder(order.id)}
                        title="Hapus pesanan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );
    }
  };

  const renderStatistics = () => {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Pesanan"
            value={orderStats.total}
            description="Semua pesanan dari seluruh menu"
            icon={BarChart3}
          />
          <StatCard
            title="Pesanan Aktif"
            value={orderStats.active}
            description="Status selain cancel"
            icon={Activity}
          />
          <StatCard
            title="Pesanan Selesai"
            value={orderStats.completed}
            description="Status ready"
            icon={TrendingUp}
          />
          <StatCard
            title="Kementerian"
            value={orderStats.uniqueKementerian}
            description="Jumlah kementerian/biro"
            icon={Users2}
          />
        </div>

        {/* Per-Menu Status Breakdown */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {orderStats.menuStatusBreakdown.map((menu) => (
            <Card key={menu.id} className="border-border/60 bg-linear-to-br from-background to-muted/30 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      {menu.label}
                    </p>
                    <div className="text-2xl font-bold tracking-tight">{menu.total}</div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span className="font-semibold">{menu.completed}</span>
                        <span className="text-muted-foreground">selesai</span>
                      </span>
                      <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                        <XCircle className="h-3.5 w-3.5" />
                        <span className="font-semibold">{menu.cancelled}</span>
                        <span className="text-muted-foreground">cancel</span>
                      </span>
                    </div>
                  </div>
                  <div className="rounded-xl bg-primary/10 p-2 text-primary">
                    <MenuIcon icon={menu.icon} className="h-4 w-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-primary" />
                <CardTitle className="text-base font-semibold">
                  Pemesan Terbanyak
                </CardTitle>
              </div>
              <CardDescription>
                Diurutkan dari paling banyak hingga paling sedikit berdasarkan kementerian.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Kementerian/Biro</TableHead>
                    <TableHead>Rincian Jenis</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {kementerianStats.map((item, index) => (
                    <TableRow key={item.kementerian}>
                      <TableCell className="font-medium text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{item.kementerian}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1.5">
                          {orderStats.menuBreakdown
                            .map((menu) => ({
                              ...menu,
                              count: item.menuCounts[menu.id],
                            }))
                            .filter((menu) => menu.count > 0)
                            .sort((a, b) => b.count - a.count)
                            .map((menu) => (
                              <span
                                key={menu.id}
                                className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${MENU_BADGE_STYLES[menu.id]}`}
                                title={menu.label}
                              >
                                {menu.label}: {menu.count}
                              </span>
                            ))}
                          {orderStats.menuBreakdown.every(
                            (menu) => item.menuCounts[menu.id] === 0,
                          ) && (
                            <span className="text-xs text-muted-foreground">
                              -
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {item.count}
                      </TableCell>
                    </TableRow>
                  ))}
                  {kementerianStats.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="py-6 text-center text-muted-foreground">
                        Belum ada data pesanan.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CalendarRange className="h-4 w-4 text-primary" />
                <CardTitle className="text-base font-semibold">
                  Ringkasan Aktivitas
                </CardTitle>
              </div>
              <CardDescription>
                Rata-rata {orderStats.averagePerDay.toFixed(2)} konten per hari dalam 84 hari terakhir (berdasar tanggal konten).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border bg-muted/30 p-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Hari tersibuk
                  </p>
                  <div className="mt-2 text-sm font-semibold">
                    {orderStats.busiestDay.count > 0
                      ? format(orderStats.busiestDay.date, "dd MMM yyyy")
                      : "Belum ada data"}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {orderStats.busiestDay.count} konten dijadwalkan
                  </p>
                </div>
                <div className="rounded-xl border bg-muted/30 p-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Total menu aktif
                  </p>
                  <div className="mt-2 text-sm font-semibold">
                    {orderStats.menuBreakdown.filter((menu) => menu.count > 0).length} menu
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Dari {orderStats.menuBreakdown.length} kategori layanan
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {orderStats.menuBreakdown.map((menu) => (
                  <div key={menu.id} className="rounded-xl border bg-background p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-medium">{menu.label}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {menu.description}
                        </p>
                      </div>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold">
                        {menu.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1fr_1.1fr]">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                Jumlah Berdasar Status
              </CardTitle>
              <CardDescription>
                Distribusi status pesanan dari seluruh data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {statusCounts.map((status) => {
                const percent = percentageFromTotal(status.count);

                return (
                  <div key={status.value} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${status.color}`}>
                        {status.label}
                      </span>
                      <span className="font-semibold">
                        {status.count} <span className="text-muted-foreground">({percent}%)</span>
                      </span>
                    </div>
                    <Progress value={percent} className="h-2" />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <CardTitle className="text-base font-semibold">
                  Heatmap Konten 84 Hari
                </CardTitle>
              </div>
              <CardDescription>
                Berdasarkan tanggal konten (publikasi/kegiatan/deadline). Semakin gelap, semakin banyak konten dijadwalkan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-3 flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="h-3 w-3 rounded-sm bg-muted/40 ring-1 ring-inset ring-border" />
                  0
                </span>
                <span className="flex items-center gap-1">
                  {HEATMAP_LEVEL_CLASSES.map((levelClass, index) => (
                    <span
                      key={levelClass}
                      className={`h-3 w-3 rounded-sm ${levelClass}`}
                      title={`Level ${index + 1}`}
                    />
                  ))}
                  <span className="ml-1">1-10</span>
                </span>
              </div>

              <div className="flex gap-1 overflow-x-auto pb-2">
                <div className="flex flex-col gap-1 pr-1 pt-[1.1rem] text-[10px] text-muted-foreground">
                  {heatmapLabels.map((label) => (
                    <span key={label} className="h-3.5 leading-none">
                      {label}
                    </span>
                  ))}
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-end gap-1 pl-px pb-1 text-[10px] font-medium text-muted-foreground">
                    {heatmapMonthLabels.map((label, index) => (
                      <span
                        key={`${label || "month"}-${index}`}
                        className="w-3.5 text-center leading-none"
                      >
                        {label}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-1">
                    {orderStats.heatmapWeeks.map((week, weekIndex) => (
                      <div key={weekIndex} className="flex flex-col gap-1">
                        {week.map((day) => (
                          <div
                            key={day.key}
                            title={`${format(day.date, "dd MMM yyyy")} · ${day.count} konten`}
                            className={`h-3.5 w-3.5 rounded-sm border border-transparent ${getHeatmapLevel(day.count, heatmapMaxCount)}`}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderKelolaPJ = () => {
    if (isPjLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      );
    }

    const categories: PJCategory[] = [
      "desain_grafis",
      "website",
      "bantuan_teknis",
      "survey",
      "platform_khusus",
      "publikasi",
    ];

    return (
      <div className="space-y-6">
        <div className="px-3 sm:px-6 pt-2 sm:pt-4 mb-2">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight">Kelola Penanggung Jawab (PJ)</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Atur Master Data PJ dan ubah Penugasan Kementerian.
          </p>
        </div>

        <div className="px-3 sm:px-6">
          <Accordion type="multiple" defaultValue={["master", "penugasan"]} className="w-full space-y-4">
            
            {/* Master Data PJ */}
            <AccordionItem value="master" className="border rounded-lg bg-card text-card-foreground shadow-xs px-3 sm:px-4">
              <AccordionTrigger className="hover:no-underline py-3 sm:py-4">
                <div className="flex items-center gap-2 font-bold text-base sm:text-lg">
                  <Users2 className="w-5 h-5 text-primary" />
                  Master Data PJ
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 pt-1">
                <div className="flex justify-end mb-3 sm:mb-4">
                  {!editingContactId && (
                    <Button size="sm" onClick={() => startEditContact(null)} className="h-8 text-xs px-3">
                      Tambah PJ
                    </Button>
                  )}
                </div>

                {/* Mobile View for Master Data PJ */}
                <div className="block sm:hidden space-y-3">
                  {editingContactId === "new" && (
                    <div className="p-3 border rounded-lg bg-accent/20 space-y-2.5">
                      <h4 className="font-semibold text-xs text-primary">Tambah PJ Baru</h4>
                      <Input
                        value={contactNama}
                        onChange={(e) => setContactNama(e.target.value)}
                        placeholder="Nama PJ"
                        className="h-8 text-xs"
                      />
                      <Input
                        value={contactNomor}
                        onChange={(e) => setContactNomor(e.target.value)}
                        placeholder="Nomor WA (628...)"
                        className="h-8 text-xs"
                      />
                      <Select
                        value={contactRole || ""}
                        onValueChange={(val) => setContactRole(val)}
                      >
                        <SelectTrigger className="h-8 text-xs w-full">
                          <SelectValue placeholder="Pilih Kategori Role..." />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((c) => (
                            <SelectItem key={c} value={c}>
                              {PJ_CATEGORY_LABELS[c]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex justify-end gap-2 pt-1">
                        <Button size="sm" variant="outline" className="h-8 text-xs px-3" onClick={cancelEditContact} disabled={contactSaving}>
                          Batal
                        </Button>
                        <Button size="sm" className="h-8 text-xs px-3 bg-green-600 hover:bg-green-700 text-white" onClick={saveContact} disabled={contactSaving}>
                          Simpan
                        </Button>
                      </div>
                    </div>
                  )}

                  {pjContacts.map((contact) => (
                    <div key={contact.id} className="p-3 border rounded-lg bg-background shadow-xs space-y-2">
                      {editingContactId === contact.id ? (
                        <div className="space-y-2.5">
                          <h4 className="font-semibold text-xs text-primary">Edit PJ: {contact.nama}</h4>
                          <Input
                            value={contactNama}
                            onChange={(e) => setContactNama(e.target.value)}
                            placeholder="Nama PJ"
                            className="h-8 text-xs"
                          />
                          <Input
                            value={contactNomor}
                            onChange={(e) => setContactNomor(e.target.value)}
                            placeholder="Nomor WA"
                            className="h-8 text-xs"
                          />
                          <Select
                            value={contactRole || ""}
                            onValueChange={(val) => setContactRole(val)}
                          >
                            <SelectTrigger className="h-8 text-xs w-full">
                              <SelectValue placeholder="Pilih Kategori..." />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((c) => (
                                <SelectItem key={c} value={c}>
                                  {PJ_CATEGORY_LABELS[c]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <div className="flex justify-end gap-2 pt-1">
                            <Button size="sm" variant="outline" className="h-8 text-xs px-3" onClick={cancelEditContact} disabled={contactSaving}>
                              Batal
                            </Button>
                            <Button size="sm" className="h-8 text-xs px-3 bg-green-600 hover:bg-green-700 text-white" onClick={saveContact} disabled={contactSaving}>
                              Simpan
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between gap-2">
                            <div className="font-semibold text-sm">{contact.nama}</div>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground">
                              {contact.role ? PJ_CATEGORY_LABELS[contact.role as PJCategory] || contact.role : "Belum Diatur"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Phone className="w-3.5 h-3.5 text-muted-foreground/70" />
                            <span>{contact.nomor}</span>
                          </div>
                          <div className="flex justify-end gap-2 pt-1 border-t mt-2">
                            <Button size="sm" variant="ghost" className="h-7 text-xs px-2" onClick={() => startEditContact(contact)}>
                              <Pencil className="w-3 h-3 mr-1" /> Edit
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 text-xs px-2 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => hapusContact(contact.id)}>
                              <Trash2 className="w-3 h-3 mr-1" /> Hapus
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}

                  {pjContacts.length === 0 && editingContactId !== "new" && (
                    <div className="text-center text-xs text-muted-foreground py-4 italic border rounded-lg">
                      Belum ada data Master PJ.
                    </div>
                  )}
                </div>

                {/* Desktop View for Master Data PJ */}
                <div className="hidden sm:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama PJ</TableHead>
                        <TableHead>Nomor WA</TableHead>
                        <TableHead>Kategori PJ</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {editingContactId === "new" && (
                        <TableRow>
                          <TableCell>
                            <Input
                              value={contactNama}
                              onChange={(e) => setContactNama(e.target.value)}
                              placeholder="Nama PJ"
                              className="h-8 text-xs min-w-[120px]"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={contactNomor}
                              onChange={(e) => setContactNomor(e.target.value)}
                              placeholder="Nomor WA (628...)"
                              className="h-8 text-xs min-w-[120px]"
                            />
                          </TableCell>
                          <TableCell>
                            <Select
                              value={contactRole || ""}
                              onValueChange={(val) => setContactRole(val)}
                            >
                              <SelectTrigger className="h-8 text-xs w-full min-w-[140px]">
                                <SelectValue placeholder="Pilih Kategori..." />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map((c) => (
                                  <SelectItem key={c} value={c}>
                                    {PJ_CATEGORY_LABELS[c]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="outline" className="h-7 px-2" onClick={cancelEditContact} disabled={contactSaving}>
                                Batal
                              </Button>
                              <Button size="sm" className="h-7 px-2 bg-green-600 hover:bg-green-700 text-white" onClick={saveContact} disabled={contactSaving}>
                                Simpan
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                      {pjContacts.map((contact) => (
                        <TableRow key={contact.id}>
                          <TableCell>
                            {editingContactId === contact.id ? (
                              <Input
                                value={contactNama}
                                onChange={(e) => setContactNama(e.target.value)}
                                className="h-8 text-xs min-w-[120px]"
                              />
                            ) : (
                              <span className="font-medium">{contact.nama}</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {editingContactId === contact.id ? (
                              <Input
                                value={contactNomor}
                                onChange={(e) => setContactNomor(e.target.value)}
                                className="h-8 text-xs min-w-[120px]"
                              />
                            ) : (
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Phone className="w-3 h-3" />
                                {contact.nomor}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {editingContactId === contact.id ? (
                              <Select
                                value={contactRole || ""}
                                onValueChange={(val) => setContactRole(val)}
                              >
                                <SelectTrigger className="h-8 text-xs w-full min-w-[140px]">
                                  <SelectValue placeholder="Pilih Kategori..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {categories.map((c) => (
                                    <SelectItem key={c} value={c}>
                                      {PJ_CATEGORY_LABELS[c]}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <div className="text-xs">
                                {contact.role
                                  ? PJ_CATEGORY_LABELS[contact.role as PJCategory] || contact.role
                                  : <span className="text-muted-foreground italic">Belum Diatur</span>}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {editingContactId === contact.id ? (
                              <div className="flex flex-wrap justify-end gap-2">
                                <Button size="sm" variant="outline" className="h-7 px-2" onClick={cancelEditContact} disabled={contactSaving}>
                                  Batal
                                </Button>
                                <Button size="sm" className="h-7 px-2 bg-green-600 hover:bg-green-700 text-white" onClick={saveContact} disabled={contactSaving}>
                                  Simpan
                                </Button>
                              </div>
                            ) : (
                              <div className="flex flex-wrap justify-end gap-2">
                                <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => startEditContact(contact)}>
                                  <Pencil className="w-3 h-3 mr-1" /> Edit
                                </Button>
                                <Button size="sm" variant="ghost" className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => hapusContact(contact.id)}>
                                  <Trash2 className="w-3 h-3 mr-1" /> Hapus
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      {pjContacts.length === 0 && editingContactId !== "new" && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                            Belum ada data Master PJ.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </AccordionContent>
            </AccordionItem>

          </Accordion>
        </div>

        {/* Penugasan Kementerian */}
        <div className="px-3 sm:px-6 mt-6 sm:mt-8 mb-4">
          <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-primary" />
            Penugasan Kementerian
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 mb-3 sm:mb-4">
            Pilih kategori di bawah untuk mengatur PJ kementerian.
          </p>
          <Accordion type="multiple" className="w-full space-y-3">
            {categories.map((cat) => {
              const pjs = pjMappings.filter((p) => p.category === cat);
              return (
                        <AccordionItem key={cat} value={cat} className="border rounded-md px-2.5 sm:px-3 bg-muted/20">
                          <AccordionTrigger className="hover:no-underline py-2.5 sm:py-3">
                            <div className="flex items-center gap-2 font-semibold text-sm sm:text-base">
                              <UserCog className="w-4 h-4 text-primary" />
                              {PJ_CATEGORY_LABELS[cat]}
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pb-3">
                            {cat === "publikasi" ? (
                              <div className="space-y-4 pt-2">
                                {/* Ringkasan Penugasan PJ Publikasi */}
                                <div className="p-3 sm:p-4 bg-background/60 rounded-lg border">
                                  <h4 className="font-semibold text-xs sm:text-sm flex items-center gap-2 mb-2">
                                    <CalendarDays className="w-4 h-4 text-primary" />
                                    Ringkasan Penugasan PJ Publikasi (Maks. 2 Hari / Orang)
                                  </h4>
                                  {pjContacts.filter((c) => c.role === "publikasi").length === 0 ? (
                                    <p className="text-xs text-muted-foreground italic">
                                      Belum ada Kontak PJ dengan Kategori &quot;PJ Publikasi&quot;. Silakan tambahkan Kontak PJ dengan role PJ Publikasi di Master Data PJ di atas.
                                    </p>
                                  ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3">
                                      {pjContacts
                                        .filter((c) => c.role === "publikasi")
                                        .map((contact) => {
                                          const assignedDays = pjMappings
                                            .filter((m) => m.category === "publikasi" && m.pj_id === contact.id)
                                            .map((m) => m.lookup_key);
                                          const count = assignedDays.length;
                                          const isMax = count >= 2;

                                          return (
                                            <div
                                              key={contact.id}
                                              className={`p-2.5 sm:p-3 rounded-md border text-xs flex flex-col justify-between transition-all ${
                                                isMax
                                                  ? "bg-amber-500/10 border-amber-500/30"
                                                  : count > 0
                                                  ? "bg-emerald-500/10 border-emerald-500/30"
                                                  : "bg-background border-border"
                                              }`}
                                            >
                                              <div className="flex items-center justify-between font-semibold">
                                                <span>{contact.nama}</span>
                                                <span
                                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                    isMax
                                                      ? "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                                                      : count > 0
                                                      ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                                                      : "bg-muted text-muted-foreground"
                                                  }`}
                                                >
                                                  {count}/2 Hari
                                                </span>
                                              </div>
                                              <div className="mt-1.5 text-[11px] text-muted-foreground">
                                                {count > 0 ? (
                                                  <span>Hari: <strong>{assignedDays.join(", ")}</strong></span>
                                                ) : (
                                                  <span className="italic">Belum ada hari</span>
                                                )}
                                              </div>
                                            </div>
                                          );
                                        })}
                                    </div>
                                  )}
                                </div>

                                {/* Mobile View for PJ Publikasi per Hari */}
                                <div className="block sm:hidden space-y-3">
                                  {DAYS_OF_WEEK.map((day) => {
                                    const mapping = pjMappings.find(
                                      (m) => m.category === "publikasi" && m.lookup_key === day
                                    );
                                    const currentPjId = mapping?.pj_id || null;
                                    const pubContacts = pjContacts.filter((c) => c.role === "publikasi");

                                    return (
                                      <div key={day} className="p-3 border rounded-lg bg-background space-y-2.5">
                                        <div className="flex items-center justify-between">
                                          <div className="font-semibold text-xs sm:text-sm flex items-center gap-1.5">
                                            <CalendarDays className="w-4 h-4 text-primary" />
                                            {day}
                                          </div>
                                          {mapping?.pj_contacts ? (
                                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                              <CheckCircle2 className="w-3 h-3" />
                                              {mapping.pj_contacts.nama}
                                            </span>
                                          ) : (
                                            <span className="text-[10px] text-muted-foreground italic bg-muted px-2 py-0.5 rounded-full">
                                              Belum ditugaskan
                                            </span>
                                          )}
                                        </div>

                                        <div className="space-y-1">
                                          <div className="text-[11px] text-muted-foreground font-medium">Pilih PJ Publikasi:</div>
                                          <div className="flex flex-wrap gap-1.5">
                                            {pubContacts.length === 0 ? (
                                              <span className="text-xs text-muted-foreground italic">
                                                Belum ada kontak PJ Publikasi
                                              </span>
                                            ) : (
                                              pubContacts.map((contact) => {
                                                const isChecked = currentPjId === contact.id;
                                                const contactAssignedDays = pjMappings
                                                  .filter((m) => m.category === "publikasi" && m.pj_id === contact.id)
                                                  .map((m) => m.lookup_key);
                                                const count = contactAssignedDays.length;
                                                const isLimitReached = count >= 2 && !isChecked;

                                                return (
                                                  <button
                                                    key={contact.id}
                                                    type="button"
                                                    onClick={() => {
                                                      if (!mapping) return;
                                                      if (isChecked) {
                                                        handleMappingChange(mapping.id, "none");
                                                      } else {
                                                        if (count >= 2) {
                                                          alert(
                                                            `PJ ${contact.nama} sudah mengambil 2 hari (${contactAssignedDays.join(
                                                              ", "
                                                            )}). Maksimal 2 hari per 1 orang PJ Publikasi!`
                                                          );
                                                          return;
                                                        }
                                                        handleMappingChange(mapping.id, contact.id);
                                                      }
                                                    }}
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                                      isChecked
                                                        ? "bg-primary text-primary-foreground border-primary shadow-xs"
                                                        : isLimitReached
                                                        ? "bg-muted/50 text-muted-foreground/60 border-transparent opacity-60"
                                                        : "bg-background hover:bg-accent border-input"
                                                    }`}
                                                  >
                                                    <div
                                                      className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${
                                                        isChecked
                                                          ? "bg-primary-foreground text-primary border-primary-foreground"
                                                          : "border-muted-foreground/60"
                                                      }`}
                                                    >
                                                      {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                                    </div>
                                                    <span>{contact.nama}</span>
                                                    <span className="text-[10px] opacity-80 font-mono">
                                                      ({count}/2)
                                                    </span>
                                                  </button>
                                                );
                                              })
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>

                                {/* Desktop View for PJ Publikasi per Hari */}
                                <div className="hidden sm:block overflow-x-auto border rounded-md bg-background">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead className="w-[140px]">Hari</TableHead>
                                        <TableHead>Pilih PJ Publikasi (Checklist)</TableHead>
                                        <TableHead className="w-[180px]">PJ Terpilih</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {DAYS_OF_WEEK.map((day) => {
                                        const mapping = pjMappings.find(
                                          (m) => m.category === "publikasi" && m.lookup_key === day
                                        );
                                        const currentPjId = mapping?.pj_id || null;
                                        const pubContacts = pjContacts.filter((c) => c.role === "publikasi");

                                        return (
                                          <TableRow key={day}>
                                            <TableCell className="font-semibold text-sm">
                                              <div className="flex items-center gap-2">
                                                <CalendarDays className="w-4 h-4 text-primary" />
                                                {day}
                                              </div>
                                            </TableCell>
                                            <TableCell>
                                              <div className="flex flex-wrap gap-2 items-center">
                                                {pubContacts.length === 0 ? (
                                                  <span className="text-xs text-muted-foreground italic">
                                                    Belum ada kontak PJ Publikasi di Master Data
                                                  </span>
                                                ) : (
                                                  pubContacts.map((contact) => {
                                                    const isChecked = currentPjId === contact.id;
                                                    const contactAssignedDays = pjMappings
                                                      .filter(
                                                        (m) =>
                                                          m.category === "publikasi" && m.pj_id === contact.id
                                                      )
                                                      .map((m) => m.lookup_key);
                                                    const count = contactAssignedDays.length;
                                                    const isLimitReached = count >= 2 && !isChecked;

                                                    return (
                                                      <button
                                                        key={contact.id}
                                                        type="button"
                                                        onClick={() => {
                                                          if (!mapping) return;
                                                          if (isChecked) {
                                                            handleMappingChange(mapping.id, "none");
                                                          } else {
                                                            if (count >= 2) {
                                                              alert(
                                                                `PJ ${contact.nama} sudah mengambil 2 hari (${contactAssignedDays.join(
                                                                  ", "
                                                                )}). Maksimal 2 hari per 1 orang PJ Publikasi!`
                                                              );
                                                              return;
                                                            }
                                                            handleMappingChange(mapping.id, contact.id);
                                                          }
                                                        }}
                                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-all ${
                                                          isChecked
                                                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                                            : isLimitReached
                                                            ? "bg-muted/50 text-muted-foreground/60 border-transparent hover:border-amber-500/30"
                                                            : "bg-background hover:bg-accent hover:text-accent-foreground border-input"
                                                        }`}
                                                      >
                                                        <div
                                                          className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                                            isChecked
                                                              ? "bg-primary-foreground text-primary border-primary-foreground"
                                                              : "border-muted-foreground/60"
                                                          }`}
                                                        >
                                                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                                                        </div>
                                                        <span>{contact.nama}</span>
                                                        <span className="text-[10px] opacity-80 font-mono">
                                                          ({count}/2)
                                                        </span>
                                                      </button>
                                                    );
                                                  })
                                                )}
                                              </div>
                                            </TableCell>
                                            <TableCell>
                                              {mapping?.pj_contacts ? (
                                                <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                                  <CheckCircle2 className="w-4 h-4" />
                                                  {mapping.pj_contacts.nama}
                                                </div>
                                              ) : (
                                                <span className="text-xs text-muted-foreground italic">
                                                  Belum ditugaskan
                                                </span>
                                              )}
                                            </TableCell>
                                          </TableRow>
                                        );
                                      })}
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                            ) : (
                              <>
                                {/* Mobile View for Standard Penugasan */}
                                <div className="block sm:hidden space-y-2.5">
                                  {pjs.length === 0 ? (
                                    <div className="text-center text-xs text-muted-foreground py-4 italic border rounded-lg">
                                      Belum ada data penugasan untuk kategori ini.
                                    </div>
                                  ) : (
                                    pjs.map((pjMap) => (
                                      <div key={pjMap.id} className="p-3 border rounded-lg bg-background space-y-2">
                                        <div className="font-semibold text-xs sm:text-sm">
                                          {pjMap.lookup_key}
                                          {cat === "platform_khusus" && pjMap.platforms && (
                                            <div className="text-[10px] text-muted-foreground font-normal mt-0.5">
                                              Platforms: {pjMap.platforms.join(", ")}
                                            </div>
                                          )}
                                        </div>
                                        <Select
                                          value={pjMap.pj_id || "none"}
                                          onValueChange={(val) => handleMappingChange(pjMap.id, val)}
                                        >
                                          <SelectTrigger className="h-9 text-xs w-full">
                                            <SelectValue placeholder="Pilih PJ..." />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="none" className="text-muted-foreground italic">-- Tidak ada PJ --</SelectItem>
                                            {pjContacts
                                              .filter((contact) => contact.role === cat)
                                              .map((contact) => (
                                                <SelectItem key={contact.id} value={contact.id}>
                                                  {contact.nama} ({contact.nomor})
                                                </SelectItem>
                                              ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    ))
                                  )}
                                </div>

                                {/* Desktop View for Standard Penugasan */}
                                <div className="hidden sm:block overflow-x-auto">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead className="w-[40%]">Identifier / Kementerian</TableHead>
                                        <TableHead className="w-[60%]">Penugasan PJ</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {pjs.length === 0 ? (
                                        <TableRow>
                                          <TableCell colSpan={2} className="text-center text-muted-foreground py-6">
                                            Belum ada data penugasan untuk kategori ini.
                                          </TableCell>
                                        </TableRow>
                                      ) : (
                                        pjs.map((pjMap) => (
                                          <TableRow key={pjMap.id}>
                                            <TableCell className="font-medium align-top">
                                              <div className="mt-1.5">{pjMap.lookup_key}</div>
                                              {cat === "platform_khusus" && pjMap.platforms && (
                                                <div className="text-[10px] text-muted-foreground mt-1">
                                                  {pjMap.platforms.join(", ")}
                                                </div>
                                              )}
                                            </TableCell>
                                            <TableCell>
                                              <Select
                                                value={pjMap.pj_id || "none"}
                                                onValueChange={(val) => handleMappingChange(pjMap.id, val)}
                                              >
                                                <SelectTrigger className="h-9 text-xs sm:text-sm w-full min-w-[140px] max-w-[300px]">
                                                  <SelectValue placeholder="Pilih PJ..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  <SelectItem value="none" className="text-muted-foreground italic">-- Tidak ada PJ --</SelectItem>
                                                  {pjContacts
                                                    .filter((contact) => contact.role === cat)
                                                    .map((contact) => (
                                                      <SelectItem key={contact.id} value={contact.id}>
                                                        {contact.nama} ({contact.nomor})
                                                      </SelectItem>
                                                    ))}
                                                </SelectContent>
                                              </Select>
                                            </TableCell>
                                          </TableRow>
                                        ))
                                      )}
                                    </TableBody>
                                  </Table>
                                </div>
                              </>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Tabs
        defaultValue="desain_publikasi"
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as DashboardTab)}
        className="w-full"
      >
        <div className="flex justify-center mb-6">
          <TabsList className="grid grid-cols-2 lg:grid-cols-6 mb-5 md:mb-0 md:grid-cols-3 h-auto p-1 bg-muted">
            {MENU_OPTIONS.map((menu) => (
              <TabsTrigger
                key={menu.id}
                value={menu.id}
                className="flex items-center gap-2 py-2 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <MenuIcon icon={menu.icon} className="w-4 h-4" />
                <span className="hidden sm:inline">{menu.label}</span>
                <span className="sm:hidden">{menu.label.split(" ")[0]}</span>
                <span className="ml-1 bg-muted-foreground/10 px-1.5 py-0.5 rounded-full text-[10px]">
                  {menuCounts[menu.id]}
                </span>
              </TabsTrigger>
            ))}
            <TabsTrigger
              value="statistik"
              className="flex items-center gap-2 py-2 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Statistik</span>
              <span className="sm:hidden">Stat</span>
              <span className="ml-1 bg-muted-foreground/10 px-1.5 py-0.5 rounded-full text-[10px]">
                {orders.length}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="kelola_pj"
              className="flex items-center gap-2 py-2 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <UserCog className="w-4 h-4" />
              <span className="hidden sm:inline">Kelola PJ</span>
              <span className="sm:hidden">PJ</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {activeTab !== "statistik" && activeTab !== "kelola_pj" && (
          <>
            <CollisionWarning />

            <Card className="mb-6">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <CardTitle className="text-base font-semibold">
                    Filter & Sortir
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                      Kementerian/Biro
                    </Label>
                    <Select
                      value={filterKementerian}
                      onValueChange={setFilterKementerian}
                    >
                      <SelectTrigger className="h-9 text-xs w-full">
                        <SelectValue placeholder="Semua" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-kementerian">Semua</SelectItem>
                        {KEMENTERIAN_OPTIONS.map((k) => (
                          <SelectItem key={k} value={k}>
                            {k}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                      Tanggal Deadline
                    </Label>
                    <DatePicker03
                      date={parseDateOnly(filterDate)}
                      setDate={(date) =>
                        setFilterDate(date ? format(date, "yyyy-MM-dd") : "")
                      }
                      className="h-9 text-xs w-full"
                      placeholder="Semua Tanggal"
                    />
                  </div>
                  {activeTab === "desain_publikasi" && (
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                        Platform
                      </Label>
                      <Select
                        value={filterPlatform}
                        onValueChange={setFilterPlatform}
                      >
                        <SelectTrigger className="h-9 text-xs w-full">
                          <SelectValue placeholder="Semua" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all-platform">Semua</SelectItem>
                          {PLATFORM_OPTIONS.map((p) => (
                            <SelectItem key={p} value={p}>
                              {p}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                      Status
                    </Label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="h-9 text-xs w-full">
                        <SelectValue placeholder="Semua" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-status">Semua</SelectItem>
                        {STATUS_OPTIONS.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                      Visibilitas
                    </Label>
                    <Select
                      value={filterVisibility}
                      onValueChange={setFilterVisibility}
                    >
                      <SelectTrigger className="h-9 text-xs w-full">
                        <SelectValue placeholder="Semua" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-visibility">Semua Visibilitas</SelectItem>
                        <SelectItem value="visible">Tampil Saja</SelectItem>
                        <SelectItem value="hidden">Tersembunyi Saja</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                      Urutkan
                    </Label>
                    <Select
                      value={sortBy}
                      onValueChange={(v) => setSortBy(v as SortOption)}
                    >
                      <SelectTrigger className="h-9 text-xs w-full">
                        <SelectValue placeholder="Urutkan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="waktu_pemesanan">
                          Waktu Pemesanan
                        </SelectItem>
                        <SelectItem value="deadline">Deadline Terdekat</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      className="h-9 w-full text-xs font-medium"
                    >
                      Reset Filter
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3  mb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-bold">
                  {MENU_OPTIONS.find((m) => m.id === activeTab)?.label} Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  {renderTable()}
                </div>

                {/* Pagination Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Baris per halaman:</span>
                    <Select value={itemsPerPage} onValueChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}>
                      <SelectTrigger className="h-8 w-[80px] text-xs">
                        <SelectValue placeholder="25" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                        <SelectItem value="all">Semua</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {itemsPerPage !== "all" && totalPages > 1 && (
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        Halaman {currentPage} dari {totalPages}
                      </span>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                        >
                          Prev
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === "statistik" && renderStatistics()}
        {activeTab === "kelola_pj" && renderKelolaPJ()}
      </Tabs>
    </div>
  );
}
