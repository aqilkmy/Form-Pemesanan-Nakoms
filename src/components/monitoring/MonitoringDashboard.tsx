"use client"

import * as React from "react"
import { supabase } from "@/lib/supabase"
import { Order } from "@/lib/types"
import { STATUS_OPTIONS, KEMENTERIAN_OPTIONS, PLATFORM_OPTIONS } from "@/lib/constants"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ExternalLink, Filter, ArrowUpDown } from "lucide-react"

type SortOption = 'waktu_pemesanan' | 'deadline'

export function MonitoringDashboard() {
    const [orders, setOrders] = React.useState<Order[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    
    // Filter states
    const [filterKementerian, setFilterKementerian] = React.useState<string>("")
    const [filterDate, setFilterDate] = React.useState<string>("")
    const [filterPlatform, setFilterPlatform] = React.useState<string>("")
    const [filterStatus, setFilterStatus] = React.useState<string>("")
    
    // Sort state
    const [sortBy, setSortBy] = React.useState<SortOption>('waktu_pemesanan')

    React.useEffect(() => {
        fetchOrders()

        const channel = supabase
            .channel('orders_realtime_monitoring')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'orders' },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setOrders((prev) => [payload.new as Order, ...prev])
                    } else if (payload.eventType === 'UPDATE') {
                        setOrders((prev) =>
                            prev.map((order) =>
                                order.id === (payload.new as Order).id ? (payload.new as Order) : order
                            )
                        )
                    }
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

    const getStatusColor = (status: string) => {
        const option = STATUS_OPTIONS.find(opt => opt.value === status)
        return option?.color || 'bg-gray-100 text-gray-800'
    }

    const getStatusLabel = (status: string) => {
        const option = STATUS_OPTIONS.find(opt => opt.value === status)
        return option?.label || status || 'New'
    }

    // Filter and sort logic
    const filteredAndSortedOrders = React.useMemo(() => {
        let result = [...orders]
        
        // Apply filters
        if (filterKementerian) {
            result = result.filter(o => o.kementerian === filterKementerian)
        }
        if (filterDate) {
            result = result.filter(o => o.tanggal_publikasi === filterDate)
        }
        if (filterPlatform) {
            result = result.filter(o => o.platform_publikasi.includes(filterPlatform))
        }
        if (filterStatus) {
            result = result.filter(o => o.status === filterStatus)
        }
        
        // Apply sorting
        if (sortBy === 'waktu_pemesanan') {
            result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        } else if (sortBy === 'deadline') {
            result.sort((a, b) => {
                const aIsNotReady = a.status !== 'ready' && a.status !== 'cancel'
                const bIsNotReady = b.status !== 'ready' && b.status !== 'cancel'
                
                // Prioritize non-ready items
                if (aIsNotReady && !bIsNotReady) return -1
                if (!aIsNotReady && bIsNotReady) return 1
                
                // Sort by deadline (closest first)
                const aDate = new Date(a.tanggal_publikasi).getTime()
                const bDate = new Date(b.tanggal_publikasi).getTime()
                return aDate - bDate
            })
        }
        
        return result
    }, [orders, filterKementerian, filterDate, filterPlatform, filterStatus, sortBy])

    const clearFilters = () => {
        setFilterKementerian("")
        setFilterDate("")
        setFilterPlatform("")
        setFilterStatus("")
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
            {/* Filter & Sort Section */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4" />
                        <CardTitle className="text-base">Filter & Sortir</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        <div>
                            <label className="text-xs text-muted-foreground mb-1 block">Kementerian/Biro</label>
                            <select
                                value={filterKementerian}
                                onChange={(e) => setFilterKementerian(e.target.value)}
                                className="w-full px-2 py-1.5 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                                <option value="">Semua</option>
                                {KEMENTERIAN_OPTIONS.map(k => (
                                    <option key={k} value={k}>{k}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground mb-1 block">Tanggal Deadline</label>
                            <input
                                type="date"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                                className="w-full px-2 py-1.5 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground mb-1 block">Platform</label>
                            <select
                                value={filterPlatform}
                                onChange={(e) => setFilterPlatform(e.target.value)}
                                className="w-full px-2 py-1.5 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                                <option value="">Semua</option>
                                {PLATFORM_OPTIONS.map(p => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground mb-1 block">Status</label>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full px-2 py-1.5 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                                <option value="">Semua</option>
                                {STATUS_OPTIONS.map(s => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground mb-1 block">Urutkan</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as SortOption)}
                                className="w-full px-2 py-1.5 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                                <option value="waktu_pemesanan">Waktu Pemesanan</option>
                                <option value="deadline">Deadline Terdekat</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={clearFilters}
                                className="w-full px-2 py-1.5 text-xs border rounded hover:bg-gray-100 transition-colors"
                            >
                                Reset Filter
                            </button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Pesanan Masuk ({filteredAndSortedOrders.length} dari {orders.length})</CardTitle>
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
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Link Desain</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredAndSortedOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                            Tidak ada pesanan yang sesuai filter.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAndSortedOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50 bg-white">
                                            <td className="px-4 py-3 font-medium whitespace-nowrap">
                                                {helperDate(order.created_at)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-semibold">{order.nama}</div>
                                                <div className="text-xs text-muted-foreground">{order.kementerian}</div>
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
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                                                    {getStatusLabel(order.status)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
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
