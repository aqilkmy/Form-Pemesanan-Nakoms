
"use client"

import * as React from "react"
import { supabase } from "@/lib/supabase"
import { Order } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ExternalLink } from "lucide-react"

export function AdminDashboard() {
    const [orders, setOrders] = React.useState<Order[]>([])
    const [isLoading, setIsLoading] = React.useState(true)

    React.useEffect(() => {
        fetchOrders()

        const channel = supabase
            .channel('orders_realtime')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'orders' },
                (payload) => {
                    console.log('New order received!', payload)
                    setOrders((prev) => [payload.new as Order, ...prev])
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const fetchOrders = async () => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            if (data) setOrders(data as Order[])
        } catch (error) {
            console.error('Error fetching orders:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const helperDate = (d: string) => {
        try {
            return new Date(d).toLocaleString('id-ID', {
                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
            })
        } catch (e) {
            return d
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Pesanan Masuk ({orders.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-100 text-gray-600 uppercase">
                                <tr>
                                    <th className="px-4 py-3">Waktu</th>
                                    <th className="px-4 py-3">Pemesan</th>
                                    <th className="px-4 py-3">Judul & Platform</th>
                                    <th className="px-4 py-3">Deadline</th>
                                    <th className="px-4 py-3">Aset</th>
                                    <th className="px-4 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {orders.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                            Belum ada pesanan.
                                        </td>
                                    </tr>
                                ) : (
                                    orders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50 bg-white">
                                            <td className="px-4 py-3 font-medium whitespace-nowrap">
                                                {helperDate(order.created_at)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-semibold">{order.nama}</div>
                                                <div className="text-xs text-muted-foreground">{order.kementerian}</div>
                                                <div className="text-xs text-muted-foreground">{order.nomor_whatsapp}</div>
                                            </td>
                                            <td className="px-4 py-3 max-w-xs">
                                                <div className="font-medium truncate" title={order.judul_desain}>{order.judul_desain}</div>
                                                <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-1">
                                                    {order.platform_publikasi.map(p => (
                                                        <span key={p} className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-[10px]">{p}</span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div>{order.tanggal_publikasi}</div>
                                                <div className="text-xs text-muted-foreground">{order.waktu_publikasi}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col gap-1">
                                                    <a href={order.link_thumbnail} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center text-xs">
                                                        <ExternalLink className="w-3 h-3 mr-1" /> Thumb
                                                    </a>
                                                    <a href={order.link_file_konten} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center text-xs">
                                                        <ExternalLink className="w-3 h-3 mr-1" /> Files
                                                    </a>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold
                          ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        order.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                        `}>
                                                    {order.status || 'Pending'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
