"use client";

import * as React from "react";
import { format } from "date-fns";
import { parseDateOnly } from "@/lib/date";
import {
  helperDate,
  getStatusColor,
  getJenisBantuanLabel,
} from "@/lib/order-utils";
import { BantuanTeknisOrder, OrderStatus } from "@/lib/types";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker03 } from "@/components/shadcn-studio/date-picker/date-picker-03";
import { Trash2, Eye, EyeOff } from "lucide-react";

interface BantuanTeknisTableProps {
  orders: BantuanTeknisOrder[];
  updateStatus: (orderId: string, newStatus: OrderStatus) => Promise<void>;
  updateField: (orderId: string, field: string, value: unknown) => Promise<void>;
  toggleHideOrder: (orderId: string, currentHidden: boolean) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
}

export function BantuanTeknisTable({
  orders,
  updateStatus,
  updateField,
  toggleHideOrder,
  deleteOrder,
}: BantuanTeknisTableProps) {
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
        {orders.map((order) => (
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
                    const formatted = date ? format(date, "yyyy-MM-dd") : "";
                    if (formatted !== order.tanggal_kegiatan) {
                      updateField(order.id, "tanggal_kegiatan", formatted);
                    }
                  }}
                  className="h-7 text-[10px] w-28 px-2"
                />
                <Input
                  type="time"
                  defaultValue={order.waktu_kegiatan}
                  onBlur={(e) => {
                    if (e.target.value !== order.waktu_kegiatan) {
                      updateField(order.id, "waktu_kegiatan", e.target.value);
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
                  onClick={() => toggleHideOrder(order.id, !order.is_hidden)}
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
