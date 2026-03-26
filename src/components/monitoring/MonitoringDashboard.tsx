"use client";

<<<<<<< Updated upstream
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DatePicker03 } from "@/components/shadcn-studio/date-picker/date-picker-03";
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
  Palette,
  Globe,
  Video,
  ClipboardList,
} from "lucide-react";
=======
import * as React from "react"
import { supabase } from "@/lib/supabase"
import { Order, DesainPublikasiOrder, WebsiteOrder, BantuanTeknisOrder, SurveyOrder } from "@/lib/types"
import { STATUS_OPTIONS, KEMENTERIAN_OPTIONS, PLATFORM_OPTIONS, MENU_OPTIONS, MenuType, JENIS_BANTUAN_OPTIONS } from "@/lib/constants"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Loader2, ExternalLink, Filter, AlertTriangle, Palette, Globe, Video, ClipboardList } from "lucide-react"
>>>>>>> Stashed changes

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

export function MonitoringDashboard() {
<<<<<<< Updated upstream
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeTab, setActiveTab] =
    React.useState<MenuType>("desain_publikasi");
=======
    const [orders, setOrders] = React.useState<Order[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [activeTab, setActiveTab] = React.useState<MenuType>("desain_publikasi")
    
    // Filter states
    const [filterKementerian, setFilterKementerian] = React.useState<string>("all-kementerian")
    const [filterStatus, setFilterStatus] = React.useState<string>("all-status")
    const [filterDate, setFilterDate] = React.useState<string>("")
    const [filterPlatform, setFilterPlatform] = React.useState<string>("all-platform")
    const [sortBy, setSortBy] = React.useState<SortOption>('waktu_pemesanan')
>>>>>>> Stashed changes

  // Filter states
  const [filterKementerian, setFilterKementerian] =
    React.useState<string>("all-kementerian");
  const [filterStatus, setFilterStatus] = React.useState<string>("all-status");
  const [filterDate, setFilterDate] = React.useState<Date | undefined>();
  const [filterPlatform, setFilterPlatform] =
    React.useState<string>("all-platform");
  const [sortBy, setSortBy] = React.useState<SortOption>("waktu_pemesanan");

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
      return new Date(d).toLocaleDateString("id-ID", {
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
      .filter((o) => o.status !== "cancel");
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
      const filterDateString = filterDate.toISOString().split("T")[0];
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

<<<<<<< Updated upstream
  // Collision warning component
  const CollisionWarning = () => {
    const collisionCount = Object.keys(scheduleCollisions).length;
    if (collisionCount === 0 || activeTab !== "desain_publikasi") return null;

    return (
      <Card className="border-yellow-400 bg-yellow-50 mb-6">
        <CardContent className="py-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-800">
                Peringatan: Jadwal Upload Bersamaan
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                Ada {collisionCount} jadwal dengan lebih dari 1 pesanan:
              </p>
              <ul className="text-sm text-yellow-700 mt-2 space-y-1">
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
              {filteredOrders.filter(isDesainPublikasi).map((order) => (
                <TableRow
                  key={order.id}
                  className={
                    hasCollision(order)
                      ? "bg-yellow-50 hover:bg-yellow-100"
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
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="text-xs font-medium">
                      {formatDate(order.tanggal_publikasi)}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {order.waktu_publikasi}
                    </div>
                    {hasCollision(order) && (
                      <div className="flex items-center gap-1 mt-1 text-yellow-600">
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
              ))}
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
                    <div className="text-[10px] text-muted-foreground truncate">
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
          <TabsList className="grid grid-cols-2 md:grid-cols-4 h-auto   rounded-lg   ">
            {MENU_OPTIONS.map((menu) => (
              <TabsTrigger
                key={menu.id}
                value={menu.id}
                className="flex items-center justify-center gap-2 py-2 px-4 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
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
=======
    const hasCollision = (order: DesainPublikasiOrder) => {
        const key = `${order.tanggal_publikasi}_${order.waktu_publikasi}`
        return scheduleCollisions[key] && scheduleCollisions[key].length > 1
    }

    // Filter by menu type and other filters
    const filteredOrders = React.useMemo(() => {
        let result = orders.filter(o => o.menu_type === activeTab)
        
        if (filterKementerian && filterKementerian !== "all-kementerian") {
            result = result.filter(o => o.kementerian === filterKementerian)
        }
        if (filterStatus && filterStatus !== "all-status") {
            result = result.filter(o => o.status === filterStatus)
        }
        
        // Date filter based on menu type
        if (filterDate) {
            result = result.filter(o => {
                if (isDesainPublikasi(o)) return o.tanggal_publikasi === filterDate
                if (isBantuanTeknis(o)) return o.tanggal_kegiatan === filterDate
                if (isSurvey(o)) return o.deadline_survey === filterDate
                return true
            })
        }
        
        // Platform filter (only for desain_publikasi)
        if (filterPlatform && filterPlatform !== "all-platform" && activeTab === 'desain_publikasi') {
            result = result.filter(o => {
                if (isDesainPublikasi(o)) {
                    return o.platform_publikasi?.includes(filterPlatform)
                }
                return true
            })
        }
        
        // Apply sorting
        if (sortBy === 'waktu_pemesanan') {
            result.sort((a, b) => {
                if (a.created_at > b.created_at) return -1
                if (a.created_at < b.created_at) return 1
                return 0
            })
        } else if (sortBy === 'deadline') {
            result.sort((a, b) => {
                const aIsNotCancel = a.status !== 'cancel'
                const bIsNotCancel = b.status !== 'cancel'
                
                if (aIsNotCancel && !bIsNotCancel) return -1
                if (!aIsNotCancel && bIsNotCancel) return 1
                
                // Get deadline dates based on menu type
                const getDeadlineDate = (order: Order): string | null => {
                    if (isDesainPublikasi(order)) return order.tanggal_publikasi
                    if (isBantuanTeknis(order)) return order.tanggal_kegiatan
                    if (isSurvey(order)) return order.deadline_survey
                    return null
                }
                
                const aDate = getDeadlineDate(a)
                const bDate = getDeadlineDate(b)
                
                if (!aDate && !bDate) return 0
                if (!aDate) return 1
                if (!bDate) return -1
                
                return new Date(aDate).getTime() - new Date(bDate).getTime()
            })
        }
        
        return result
    }, [orders, activeTab, filterKementerian, filterStatus, filterDate, filterPlatform, sortBy])

    // Count orders per menu type
    const menuCounts = React.useMemo(() => {
        return {
            desain_publikasi: orders.filter(o => o.menu_type === "desain_publikasi").length,
            website: orders.filter(o => o.menu_type === "website").length,
            bantuan_teknis: orders.filter(o => o.menu_type === "bantuan_teknis").length,
            survey: orders.filter(o => o.menu_type === "survey").length,
        }
    }, [orders])

    const clearFilters = () => {
        setFilterKementerian("all-kementerian")
        setFilterStatus("all-status")
        setFilterDate("")
        setFilterPlatform("all-platform")
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    // Collision warning component
    const CollisionWarning = () => {
        const collisionCount = Object.keys(scheduleCollisions).length
        if (collisionCount === 0 || activeTab !== 'desain_publikasi') return null
        
        return (
            <Card className="border-yellow-400 bg-yellow-50">
                <CardContent className="py-3">
                    <div className="flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold text-yellow-800">Peringatan: Jadwal Upload Bersamaan</p>
                            <p className="text-sm text-yellow-700 mt-1">
                                Ada {collisionCount} jadwal dengan lebih dari 1 pesanan:
                            </p>
                            <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                                {Object.entries(scheduleCollisions).map(([key, orders]) => (
                                    <li key={key} className="flex items-center gap-2">
                                        <span className="font-medium">
                                            {formatDate(key.split('_')[0])} - {key.split('_')[1]}:
                                        </span>
                                        <span>
                                            {orders.map(o => o.judul_desain).join(', ')} ({orders.length} pesanan)
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    // Render table based on active tab
    const renderTable = () => {
        switch (activeTab) {
            case "desain_publikasi":
                return (
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-100 text-gray-600 uppercase">
                            <tr>
                                <th className="px-4 py-3">Waktu</th>
                                <th className="px-4 py-3">Pemesan</th>
                                <th className="px-4 py-3">Judul & Platform</th>
                                <th className="px-4 py-3">Deadline</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Link Desain</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredOrders.filter(isDesainPublikasi).map((order) => (
                                <tr key={order.id} className={`hover:bg-gray-50 ${hasCollision(order) ? 'bg-yellow-50' : 'bg-white'}`}>
                                    <td className="px-4 py-3 font-medium whitespace-nowrap">{helperDate(order.created_at)}</td>
                                    <td className="px-4 py-3">
                                        <div className="font-semibold">{order.nama}</div>
                                        <div className="text-xs text-muted-foreground">{order.kementerian}</div>
                                    </td>
                                    <td className="px-4 py-3 max-w-xs">
                                        <div className="font-medium truncate">{order.judul_desain}</div>
                                        <div className="text-xs mt-1 flex flex-wrap gap-1">
                                            {order.platform_publikasi?.map(p => (
                                                <span key={p} className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-[10px]">{p}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div>{formatDate(order.tanggal_publikasi)}</div>
                                        <div className="text-xs text-muted-foreground">{order.waktu_publikasi}</div>
                                        {hasCollision(order) && (
                                            <div className="flex items-center gap-1 mt-1 text-yellow-600">
                                                <AlertTriangle className="w-3 h-3" />
                                                <span className="text-[10px]">Tabrakan!</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                                            {getStatusLabel(order.status)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        {order.link_desain_selesai ? (
                                            <a href={order.link_desain_selesai} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center text-xs">
                                                <ExternalLink className="w-3 h-3 mr-1" /> Lihat
                                            </a>
                                        ) : <span className="text-xs text-muted-foreground">-</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )
            
            case "website":
                return (
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-100 text-gray-600 uppercase">
                            <tr>
                                <th className="px-4 py-3">Waktu</th>
                                <th className="px-4 py-3">Pemesan</th>
                                <th className="px-4 py-3">Tujuan</th>
                                <th className="px-4 py-3">Link & Shortlink</th>
                                <th className="px-4 py-3">Lampiran</th>
                                <th className="px-4 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredOrders.filter(isWebsite).map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50 bg-white">
                                    <td className="px-4 py-3 font-medium whitespace-nowrap">{helperDate(order.created_at)}</td>
                                    <td className="px-4 py-3">
                                        <div className="font-semibold">{order.nama}</div>
                                        <div className="text-xs text-muted-foreground">{order.kementerian}</div>
                                    </td>
                                    <td className="px-4 py-3 max-w-xs">
                                        <span className="font-medium">{order.tujuan_pemesanan || '-'}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col gap-1 text-xs">
                                            {order.link_original && (
                                                <a href={order.link_original} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center">
                                                    <ExternalLink className="w-3 h-3 mr-1" /> Original
                                                </a>
                                            )}
                                            {order.custom_shortlink && (
                                                <span className="text-gray-700">→ {order.custom_shortlink}</span>
                                            )}
                                            {!order.link_original && !order.custom_shortlink && '-'}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col gap-1">
                                            {order.link_pengajuan_fitur && (
                                                <a href={order.link_pengajuan_fitur} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center text-xs">
                                                    <ExternalLink className="w-3 h-3 mr-1" /> Fitur
                                                </a>
                                            )}
                                            {order.link_pendaftaran_event && (
                                                <a href={order.link_pendaftaran_event} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center text-xs">
                                                    <ExternalLink className="w-3 h-3 mr-1" /> Event
                                                </a>
                                            )}
                                            {!order.link_pengajuan_fitur && !order.link_pendaftaran_event && '-'}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                                            {getStatusLabel(order.status)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )
            
            case "bantuan_teknis":
                return (
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-100 text-gray-600 uppercase">
                            <tr>
                                <th className="px-4 py-3">Waktu</th>
                                <th className="px-4 py-3">Pemesan</th>
                                <th className="px-4 py-3">Kegiatan</th>
                                <th className="px-4 py-3">Jadwal & Tempat</th>
                                <th className="px-4 py-3">Jenis</th>
                                <th className="px-4 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredOrders.filter(isBantuanTeknis).map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50 bg-white">
                                    <td className="px-4 py-3 font-medium whitespace-nowrap">{helperDate(order.created_at)}</td>
                                    <td className="px-4 py-3">
                                        <div className="font-semibold">{order.nama}</div>
                                        <div className="text-xs text-muted-foreground">{order.kementerian}</div>
                                    </td>
                                    <td className="px-4 py-3 max-w-xs">
                                        <div className="font-medium truncate">{order.nama_kegiatan}</div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div>{formatDate(order.tanggal_kegiatan)} - {order.waktu_kegiatan}</div>
                                        <div className="text-xs text-muted-foreground">{order.tempat_kegiatan}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded text-xs">
                                            {getJenisBantuanLabel(order.jenis_bantuan)}
                                        </span>
                                        {order.jenis_bantuan === 'lainnya' && order.jenis_bantuan_lainnya && (
                                            <div className="text-xs text-muted-foreground mt-1">{order.jenis_bantuan_lainnya}</div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                                            {getStatusLabel(order.status)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )
            
            case "survey":
                return (
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-100 text-gray-600 uppercase">
                            <tr>
                                <th className="px-4 py-3">Waktu</th>
                                <th className="px-4 py-3">Pemesan</th>
                                <th className="px-4 py-3">Judul Survey</th>
                                <th className="px-4 py-3">Target & Deadline</th>
                                <th className="px-4 py-3">Hadiah</th>
                                <th className="px-4 py-3">Brief</th>
                                <th className="px-4 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredOrders.filter(isSurvey).map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50 bg-white">
                                    <td className="px-4 py-3 font-medium whitespace-nowrap">{helperDate(order.created_at)}</td>
                                    <td className="px-4 py-3">
                                        <div className="font-semibold">{order.nama}</div>
                                        <div className="text-xs text-muted-foreground">{order.kementerian}</div>
                                    </td>
                                    <td className="px-4 py-3 max-w-xs">
                                        <div className="font-medium truncate">{order.judul_survey}</div>
                                        <div className="text-xs text-muted-foreground truncate">{order.deskripsi_survey}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="text-xs">{order.target_responden}</div>
                                        <div className="text-xs text-muted-foreground">Deadline: {formatDate(order.deadline_survey)}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-1.5 py-0.5 rounded text-xs ${order.hadiah_survey === 'ada' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                            {order.hadiah_survey === 'ada' ? 'Ada' : 'Tidak'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <a href={order.link_gdrive_brief} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center text-xs">
                                            <ExternalLink className="w-3 h-3 mr-1" /> Lihat
                                        </a>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                                            {getStatusLabel(order.status)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )
        }
    }

    return (
        <div className="space-y-6">
            <Tabs defaultValue="desain_publikasi" value={activeTab} onValueChange={(v) => setActiveTab(v as MenuType)} className="w-full">
                <div className="flex justify-center mb-6">
                    <TabsList className="grid grid-cols-2 md:grid-cols-4 h-auto p-1 bg-muted">
                        {MENU_OPTIONS.map((menu) => (
                            <TabsTrigger 
                                key={menu.id} 
                                value={menu.id}
                                className="flex items-center gap-2 py-2 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                            >
                                <MenuIcon icon={menu.icon} className="w-4 h-4" />
                                <span className="hidden sm:inline">{menu.label}</span>
                                <span className="sm:hidden">{menu.label.split(' ')[0]}</span>
                                <span className="ml-1 bg-muted-foreground/10 px-1.5 py-0.5 rounded-full text-[10px]">
                                    {menuCounts[menu.id]}
                                </span>
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>

                {/* Collision Warning */}
                <CollisionWarning />

                {/* Filter Section */}
                <Card className="mb-6">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4" />
                            <CardTitle className="text-base">Filter & Sortir</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                            <div className="space-y-1">
                                <Label className="text-[10px] uppercase text-muted-foreground">Kementerian/Biro</Label>
                                <Select value={filterKementerian} onValueChange={setFilterKementerian}>
                                    <SelectTrigger className="h-8 text-xs">
                                        <SelectValue placeholder="Semua" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all-kementerian">Semua</SelectItem>
                                        {KEMENTERIAN_OPTIONS.map(k => (
                                            <SelectItem key={k} value={k}>{k}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] uppercase text-muted-foreground">Tanggal Deadline</Label>
                                <Input
                                    type="date"
                                    value={filterDate}
                                    onChange={(e) => setFilterDate(e.target.value)}
                                    className="h-8 text-xs"
                                />
                            </div>
                            {activeTab === 'desain_publikasi' && (
                                <div className="space-y-1">
                                    <Label className="text-[10px] uppercase text-muted-foreground">Platform</Label>
                                    <Select value={filterPlatform} onValueChange={setFilterPlatform}>
                                        <SelectTrigger className="h-8 text-xs">
                                            <SelectValue placeholder="Semua" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all-platform">Semua</SelectItem>
                                            {PLATFORM_OPTIONS.map(p => (
                                                <SelectItem key={p} value={p}>{p}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            <div className="space-y-1">
                                <Label className="text-[10px] uppercase text-muted-foreground">Status</Label>
                                <Select value={filterStatus} onValueChange={setFilterStatus}>
                                    <SelectTrigger className="h-8 text-xs">
                                        <SelectValue placeholder="Semua" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all-status">Semua</SelectItem>
                                        {STATUS_OPTIONS.map(s => (
                                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] uppercase text-muted-foreground">Urutkan</Label>
                                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                                    <SelectTrigger className="h-8 text-xs">
                                        <SelectValue placeholder="Urutkan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="waktu_pemesanan">Waktu Pemesanan</SelectItem>
                                        <SelectItem value="deadline">Deadline Terdekat</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-end">
                                <Button
                                    variant="outline"
                                    onClick={clearFilters}
                                    className="h-8 w-full text-xs"
                                >
                                    Reset Filter
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Table Content */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MenuIcon icon={MENU_OPTIONS.find(m => m.id === activeTab)?.icon || ''} className="w-5 h-5" />
                            {MENU_OPTIONS.find(m => m.id === activeTab)?.label} ({filteredOrders.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            {filteredOrders.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    Tidak ada pesanan {MENU_OPTIONS.find(m => m.id === activeTab)?.label.toLowerCase()}.
                                </div>
                            ) : renderTable()}
                        </div>
                    </CardContent>
                </Card>
            </Tabs>
>>>>>>> Stashed changes
        </div>

        {/* Collision Warning */}
        <CollisionWarning />

        {/* Filter Section */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 " />
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
          <CardHeader className="pb-3 border-b mb-4">
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
