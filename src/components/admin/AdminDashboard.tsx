
"use client"

import * as React from "react"
import { supabase } from "@/lib/supabase"
import { Order, OrderStatus } from "@/lib/types"
import { STATUS_OPTIONS, KEMENTERIAN_OPTIONS, PLATFORM_OPTIONS, WAKTU_PUBLIKASI_OPTIONS } from "@/lib/constants"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ExternalLink, Filter } from "lucide-react"

type SortOption = 'waktu_pemesanan' | 'deadline'

export function AdminDashboard() {
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

    const updateStatus = async (orderId: string, newStatus: OrderStatus) => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', orderId)

            if (error) throw error

            setOrders((prev) =>
                prev.map((order) =>
                    order.id === orderId ? { ...order, status: newStatus } : order
                )
            )
        } catch (error) {
            console.error('Error updating status:', error)
            alert('Gagal mengubah status')
        }
    }

    const getStatusColor = (status: string) => {
        const option = STATUS_OPTIONS.find(opt => opt.value === status)
        return option?.color || 'bg-gray-100 text-gray-800'
    }

    // Detect duplicate deadlines (same date + time)
    const duplicateDeadlines = React.useMemo(() => {
        const deadlineCount: Record<string, string[]> = {}
        // Check all orders that are not cancelled
        orders.forEach(order => {
            if (order.status !== 'cancel') {
                // Normalize key: trim whitespace and convert to lowercase
                const normalizedDate = (order.tanggal_publikasi || '').trim()
                const normalizedTime = (order.waktu_publikasi || '').trim().toLowerCase()
                const key = `${normalizedDate}_${normalizedTime}`
                if (!deadlineCount[key]) {
                    deadlineCount[key] = []
                }
                deadlineCount[key].push(order.id)
            }
        })
        // Return set of order IDs that have duplicates
        const duplicateIds = new Set<string>()
        Object.values(deadlineCount).forEach(ids => {
            if (ids.length > 1) {
                ids.forEach(id => duplicateIds.add(id))
            }
        })
        console.log('Duplicate detection:', { deadlineCount, duplicateIds: Array.from(duplicateIds) })
        return duplicateIds
    }, [orders])

    // Helper to check if deadline has passed
    const isDeadlinePassed = (tanggal: string, waktu: string) => {
        const now = new Date()
        const [hour] = waktu.split('.').map(Number)
        const deadlineDate = new Date(tanggal)
        deadlineDate.setHours(hour || 0, 0, 0, 0)
        return deadlineDate < now
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
            // ISO timestamps can be sorted as strings directly (newest first = descending)
            result.sort((a, b) => {
                if (a.created_at > b.created_at) return -1
                if (a.created_at < b.created_at) return 1
                return 0
            })
        } else if (sortBy === 'deadline') {
            result.sort((a, b) => {
                const aIsNotCancel = a.status !== 'cancel'
                const bIsNotCancel = b.status !== 'cancel'
                
                // Cancelled items go to bottom
                if (aIsNotCancel && !bIsNotCancel) return -1
                if (!aIsNotCancel && bIsNotCancel) return 1
                
                // Check if deadline has passed
                const aIsPassed = isDeadlinePassed(a.tanggal_publikasi, a.waktu_publikasi)
                const bIsPassed = isDeadlinePassed(b.tanggal_publikasi, b.waktu_publikasi)
                
                // Passed deadlines go to bottom (but above cancelled)
                if (!aIsPassed && bIsPassed) return -1
                if (aIsPassed && !bIsPassed) return 1
                
                // Sort by deadline (closest first)
                const aDate = new Date(a.tanggal_publikasi).getTime()
                const bDate = new Date(b.tanggal_publikasi).getTime()
                if (isNaN(aDate) || isNaN(bDate)) {
                    return a.tanggal_publikasi.localeCompare(b.tanggal_publikasi)
                }
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

    const updateLinkDesain = async (orderId: string, link: string) => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ link_desain_selesai: link })
                .eq('id', orderId)

            if (error) throw error

            setOrders((prev) =>
                prev.map((order) =>
                    order.id === orderId ? { ...order, link_desain_selesai: link } : order
                )
            )
        } catch (error) {
            console.error('Error updating link desain:', error)
            alert('Gagal menyimpan link desain')
        }
    }

    const updateDeadline = async (orderId: string, newDate: string) => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ tanggal_publikasi: newDate })
                .eq('id', orderId)

            if (error) throw error

            setOrders((prev) =>
                prev.map((order) =>
                    order.id === orderId ? { ...order, tanggal_publikasi: newDate } : order
                )
            )
        } catch (error) {
            console.error('Error updating deadline:', error)
            alert('Gagal mengubah deadline')
        }
    }

    const updateWaktuPublikasi = async (orderId: string, newTime: string) => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ waktu_publikasi: newTime })
                .eq('id', orderId)

            if (error) throw error

            setOrders((prev) =>
                prev.map((order) =>
                    order.id === orderId ? { ...order, waktu_publikasi: newTime } : order
                )
            )
        } catch (error) {
            console.error('Error updating waktu publikasi:', error)
            alert('Gagal mengubah jam publikasi')
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
                                    <th className="px-4 py-3">Aset</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Link Desain</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredAndSortedOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
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
                                            <td className={`px-4 py-3 whitespace-nowrap ${duplicateDeadlines.has(order.id) ? 'bg-red-100 border-l-4 border-l-red-500' : ''}`}>
                                                <div>
                                                    <input
                                                        type="date"
                                                        defaultValue={order.tanggal_publikasi}
                                                        onBlur={(e) => {
                                                            if (e.target.value !== order.tanggal_publikasi) {
                                                                updateDeadline(order.id, e.target.value)
                                                            }
                                                        }}
                                                        className={`px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer ${duplicateDeadlines.has(order.id) ? 'border-red-500 bg-red-50' : ''}`}
                                                    />
                                                </div>
                                                <div className="mt-1">
                                                    <select
                                                        value={order.waktu_publikasi}
                                                        onChange={(e) => updateWaktuPublikasi(order.id, e.target.value)}
                                                        className={`px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer ${duplicateDeadlines.has(order.id) ? 'border-red-500 bg-red-50' : ''}`}
                                                    >
                                                        {WAKTU_PUBLIKASI_OPTIONS.map((time) => (
                                                            <option key={time} value={time}>{time}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                {duplicateDeadlines.has(order.id) && (
                                                    <div className="text-xs text-red-600 font-bold mt-1 flex items-center gap-1">
                                                        <span className="animate-pulse">⚠️</span> Jadwal bentrok
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col gap-1">
                                                    <a href={order.link_file_konten} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center text-xs">
                                                        <ExternalLink className="w-3 h-3 mr-1" /> Files
                                                    </a>
                                                    <a href={order.link_caption_docs} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center text-xs">
                                                        <ExternalLink className="w-3 h-3 mr-1" /> Caption
                                                    </a>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <select
                                                    value={order.status || 'new'}
                                                    onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)}
                                                    className={`px-2 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer ${getStatusColor(order.status)}`}
                                                >
                                                    {STATUS_OPTIONS.map((opt) => (
                                                        <option key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1">
                                                    <input
                                                        type="text"
                                                        placeholder="Paste link..."
                                                        defaultValue={order.link_desain_selesai || ''}
                                                        onBlur={(e) => {
                                                            if (e.target.value !== (order.link_desain_selesai || '')) {
                                                                updateLinkDesain(order.id, e.target.value)
                                                            }
                                                        }}
                                                        className="w-32 px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                                                    />
                                                    {order.link_desain_selesai && (
                                                        <a href={order.link_desain_selesai} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800">
                                                            <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                    )}
                                                </div>
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
