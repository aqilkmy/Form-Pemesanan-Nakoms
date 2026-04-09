"use client";

import * as React from "react";
import { supabase } from "@/lib/supabase";
import {
  Order,
  DesainPublikasiOrder,
  WebsiteOrder,
  BantuanTeknisOrder,
  SurveyOrder,
} from "@/lib/types";
import {
  STATUS_OPTIONS,
  KEMENTERIAN_OPTIONS,
  PLATFORM_OPTIONS,
  MENU_OPTIONS,
  MenuType,
  JENIS_BANTUAN_OPTIONS,
} from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DatePicker03 } from "@/components/shadcn-studio/date-picker/date-picker-03";
import { formatDateOnly } from "@/lib/date";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

// Type guards
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

export function MonitoringDashboard() {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeTab, setActiveTab] =
    React.useState<MenuType>("desain_publikasi");

  // Filter states
  const [filterKementerian, setFilterKementerian] =
    React.useState<string>("all-kementerian");
  const [filterStatus, setFilterStatus] = React.useState<string>("all-status");
  const [filterDate, setFilterDate] = React.useState<Date | undefined>();
  const [filterPlatform, setFilterPlatform] =
    React.useState<string>("all-platform");
  const [sortBy, setSortBy] = React.useState<SortOption>("waktu_pemesanan");
  const [expandedDesainOrderIds, setExpandedDesainOrderIds] = React.useState<
    string[]
  >([]);

  React.useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel("orders_realtime_monitoring")
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

  const getStatusColor = (status: string) => {
    const option = STATUS_OPTIONS.find((opt) => opt.value === status);
    return option?.color || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status: string) => {
    const option = STATUS_OPTIONS.find((opt) => opt.value === status);
    return option?.label || status || "New";
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
      .filter((o) => !isPublicationChecklistCompleted(o));
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
      const filterDateString = format(filterDate, "yyyy-MM-dd");
      result = result.filter((o) => {
        if (isDesainPublikasi(o))
          return o.tanggal_publikasi === filterDateString;
        if (isBantuanTeknis(o)) return o.tanggal_kegiatan === filterDateString;
        if (isSurvey(o)) return o.deadline_survey === filterDateString;
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

    return result;
  }, [
    orders,
    activeTab,
    filterKementerian,
    filterStatus,
    filterDate,
    filterPlatform,
    sortBy,
  ]);

  // Count orders per menu type
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

  const clearFilters = () => {
    setFilterKementerian("all-kementerian");
    setFilterStatus("all-status");
    setFilterDate(undefined);
    setFilterPlatform("all-platform");
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
            <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
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
      case "desain_publikasi":
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Waktu</TableHead>
                <TableHead>Pemesan</TableHead>
                <TableHead>Judul & Platform</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Link Desain</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.filter(isDesainPublikasi).map((order) => {
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
                        <div className="font-semibold">{order.nama}</div>
                        <div className="text-xs text-muted-foreground">
                          {order.kementerian}
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
                        <div className="text-xs font-medium">
                          {formatDate(order.tanggal_publikasi)}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {order.waktu_publikasi}
                        </div>
                        {hasCollision(order) && (
                          <div className="flex items-center gap-1 mt-1 text-destructive">
                            <AlertTriangle className="w-3 h-3" />
                            <span className="text-[9px]">Tabrakan!</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${getStatusColor(order.status)}`}
                        >
                          {getStatusLabel(order.status)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {order.link_desain_selesai ? (
                          <a
                            href={order.link_desain_selesai}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline flex items-center text-xs"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" /> Lihat
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>

                    {isExpanded && (
                      <TableRow className="bg-muted/30">
                        <TableCell colSpan={6}>
                          <div className="text-xs space-y-1.5 py-1">
                            <div>
                              <span className="font-semibold">Judul lengkap:</span>{" "}
                              {order.judul_desain}
                            </div>
                            <div>
                              <span className="font-semibold">Aset konten:</span>{" "}
                              <a
                                href={order.link_file_konten}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                Link file konten
                              </a>
                            </div>
                            <div>
                              <span className="font-semibold">Caption:</span>{" "}
                              <a
                                href={order.link_caption_docs}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                Link caption docs
                              </a>
                            </div>
                            <div>
                              <span className="font-semibold">Request lagu:</span>{" "}
                              {order.request_lagu || "-"}
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.filter(isWebsite).map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium whitespace-nowrap">
                    {helperDate(order.created_at)}
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold">{order.nama}</div>
                    <div className="text-xs text-muted-foreground">
                      {order.kementerian}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <span className="font-medium text-xs">
                      {order.tujuan_pemesanan || "-"}
                    </span>
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
                          className="text-blue-600 hover:underline flex items-center text-xs"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" /> Fitur
                        </a>
                      )}
                      {order.link_pendaftaran_event && (
                        <a
                          href={order.link_pendaftaran_event}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline flex items-center text-xs"
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
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${getStatusColor(order.status)}`}
                    >
                      {getStatusLabel(order.status)}
                    </span>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.filter(isBantuanTeknis).map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium whitespace-nowrap">
                    {helperDate(order.created_at)}
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold">{order.nama}</div>
                    <div className="text-xs text-muted-foreground">
                      {order.kementerian}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="font-medium text-xs truncate">
                      {order.nama_kegiatan}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="text-xs font-medium">
                      {formatDate(order.tanggal_kegiatan)} -{" "}
                      {order.waktu_kegiatan}
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
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${getStatusColor(order.status)}`}
                    >
                      {getStatusLabel(order.status)}
                    </span>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.filter(isSurvey).map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium whitespace-nowrap">
                    {helperDate(order.created_at)}
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold">{order.nama}</div>
                    <div className="text-xs text-muted-foreground">
                      {order.kementerian}
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
                    <div className="text-xs">{order.target_responden}</div>
                    <div className="text-[10px] text-muted-foreground">
                      Deadline: {formatDate(order.deadline_survey)}
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
                      className="text-blue-600 hover:underline flex items-center text-xs"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" /> Lihat
                    </a>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${getStatusColor(order.status)}`}
                    >
                      {getStatusLabel(order.status)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );
    }
  };

  return (
    <div className="space-y-6">
      <Tabs
        defaultValue="desain_publikasi"
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as MenuType)}
        className="w-full"
      >
        <div className="flex justify-center mb-6">
          <TabsList className="grid grid-cols-2 mb-5 md:grid-cols-4 h-auto md:mb-0  rounded-lg  ">
            {MENU_OPTIONS.map((menu) => (
              <TabsTrigger
                key={menu.id}
                value={menu.id}
                className="flex items-center justify-between gap-2 py-2 px-4 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <MenuIcon icon={menu.icon} className="w-4 h-4" />
                <span className="hidden sm:inline">{menu.label}</span>
                <span className="sm:hidden">{menu.label.split(" ")[0]}</span>
                <span className="ml-1 bg-muted-foreground/10 px-1.5 py-0.5 rounded-full text-[10px]">
                  {menuCounts[menu.id]}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Collision Warning */}

        {/* Collision Warning */}
        <CollisionWarning />

        {/* Filter Section */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-primary " />
              <CardTitle className="text-base font-semibold">
                Filter & Sortir
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
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
                  date={filterDate}
                  setDate={setFilterDate}
                  placeholder="Pilih tanggal"
                  className="text-xs"
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

        {/* Table Content */}
        <Card>
          <CardHeader className="pb-3  mb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <MenuIcon
                icon={MENU_OPTIONS.find((m) => m.id === activeTab)?.icon || ""}
                className="w-5 h-5 text-primary"
              />
              {MENU_OPTIONS.find((m) => m.id === activeTab)?.label}
              <span className="ml-auto bg-primary/10 text-primary text-xs px-2.5 py-0.5 rounded-full">
                {filteredOrders.length} Pesanan
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-6 sm:pt-0">
            <div className="overflow-x-auto">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-lg mx-6 my-4">
                  Tidak ada pesanan{" "}
                  {MENU_OPTIONS.find(
                    (m) => m.id === activeTab,
                  )?.label.toLowerCase()}{" "}
                  yang ditemukan.
                </div>
              ) : (
                renderTable()
              )}
            </div>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
