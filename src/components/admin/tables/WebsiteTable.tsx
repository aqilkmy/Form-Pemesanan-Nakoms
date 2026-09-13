"use client";

import * as React from "react";
import { helperDate, getStatusColor } from "@/lib/order-utils";
import { WebsiteOrder, OrderStatus } from "@/lib/types";
import { STATUS_OPTIONS } from "@/lib/constants";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";
import { TwibbonDetailRow } from "@/components/shared/TwibbonDetailRow";

interface WebsiteTableProps {
  orders: WebsiteOrder[];
  updateStatus: (orderId: string, newStatus: OrderStatus) => Promise<void>;
  toggleHideOrder: (orderId: string, currentHidden: boolean) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
}

export function WebsiteTable({
  orders,
  updateStatus,
  toggleHideOrder,
  deleteOrder,
}: WebsiteTableProps) {
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
          <TableHead>Tujuan</TableHead>
          <TableHead>Link & Shortlink</TableHead>
          <TableHead>Lampiran</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => {
          const isExpanded = expandedOrderIds.includes(order.id);
          return (
            <React.Fragment key={order.id}>
              <TableRow>
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
                    {order.website_sub_type === "twibbon"
                      ? order.judul_kampanye || "-"
                      : order.tujuan_pemesanan || "-"}
                  </span>
                  {order.website_sub_type && (
                    <div className="mt-0.5">
                      <span
                        className={`inline-block text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                          order.website_sub_type === "twibbon"
                            ? "bg-purple-100 text-purple-700"
                            : order.website_sub_type === "shortlink"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {order.website_sub_type === "twibbon"
                          ? "Twibbon"
                          : order.website_sub_type === "shortlink"
                            ? "Shortlink"
                            : "Laman"}
                      </span>
                    </div>
                  )}
                  {order.website_sub_type === "twibbon" && (
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

              {isExpanded && order.website_sub_type === "twibbon" && (
                <TwibbonDetailRow order={order} colSpan={7} />
              )}
            </React.Fragment>
          );
        })}
      </TableBody>
    </Table>
  );
}
