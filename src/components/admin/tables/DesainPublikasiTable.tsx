"use client";

import * as React from "react";
import { format } from "date-fns";
import { parseDateOnly } from "@/lib/date";
import { helperDate, getStatusColor } from "@/lib/order-utils";
import { DesainPublikasiOrder, Order, OrderStatus } from "@/lib/types";
import {
  STATUS_OPTIONS,
  WAKTU_PUBLIKASI_OPTIONS,
} from "@/lib/constants";
import { updateOrder as updateOrderAction } from "@/lib/actions/orders";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker03 } from "@/components/shadcn-studio/date-picker/date-picker-03";
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Trash2,
  AlertTriangle,
  Eye,
  EyeOff,
  Loader2,
  Check,
} from "lucide-react";

interface DesainPublikasiTableProps {
  orders: DesainPublikasiOrder[];
  hasCollision: (order: DesainPublikasiOrder) => boolean;
  updateStatus: (orderId: string, newStatus: OrderStatus) => Promise<void>;
  updateField: (orderId: string, field: string, value: unknown) => Promise<void>;
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  toggleHideOrder: (orderId: string, currentHidden: boolean) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
}

export function DesainPublikasiTable({
  orders,
  hasCollision,
  updateStatus,
  updateField,
  setOrders,
  toggleHideOrder,
  deleteOrder,
}: DesainPublikasiTableProps) {
  const [expandedOrderIds, setExpandedOrderIds] = React.useState<string[]>([]);

  const toggleDetail = (id: string) => {
    setExpandedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

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
        {orders.map((order) => {
          const isExpanded = expandedOrderIds.includes(order.id);

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
                    onClick={() => toggleDetail(order.id)}
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
                                const res = await updateOrderAction(order.id, {
                                  status_publikasi: newStatusPublikasi,
                                });
                                if (!res.success) throw new Error(res.error);
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
                  <LinkDesainCell
                    orderId={order.id}
                    initialValue={order.link_desain_selesai || ""}
                    updateField={updateField}
                  />
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
}

interface LinkDesainCellProps {
  orderId: string;
  initialValue?: string;
  updateField: (orderId: string, field: string, value: unknown) => Promise<void>;
}

function LinkDesainCell({ orderId, initialValue = "", updateField }: LinkDesainCellProps) {
  const [value, setValue] = React.useState(initialValue || "");
  const [status, setStatus] = React.useState<"idle" | "saving" | "saved" | "error">("idle");
  const [isFocused, setIsFocused] = React.useState(false);

  // Sync with prop when outside update happens, but only when not actively typing/saving
  React.useEffect(() => {
    if (!isFocused && status !== "saving") {
      setValue(initialValue || "");
    }
  }, [initialValue, isFocused, status]);

  const handleSave = async (val: string) => {
    const trimmed = val.trim();
    if (trimmed === (initialValue || "")) return;

    setStatus("saving");
    try {
      await updateField(orderId, "link_desain_selesai", trimmed);
      setStatus("saved");
      setTimeout(() => {
        setStatus("idle");
      }, 2000);
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      <div className="relative flex items-center">
        <Input
          type="text"
          placeholder="Link Drive..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            handleSave(value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSave(value);
              (e.target as HTMLInputElement).blur();
            }
          }}
          disabled={status === "saving"}
          className={`h-7 text-[10px] w-28 px-2 pr-6 transition-all ${
            status === "saved"
              ? "border-emerald-500 bg-emerald-50/50 text-emerald-900 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-200"
              : status === "error"
              ? "border-destructive bg-destructive/10 text-destructive"
              : ""
          }`}
          title="Tekan Enter atau klik di luar untuk menyimpan link"
        />
        <div className="absolute right-1.5 pointer-events-none flex items-center">
          {status === "saving" && (
            <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
          )}
          {status === "saved" && (
            <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          )}
        </div>
      </div>
      {value && (
        <a
          href={value.startsWith("http") ? value : `https://${value}`}
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1 shrink-0 rounded hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
          title="Buka Link Desain"
        >
          <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  );
}
