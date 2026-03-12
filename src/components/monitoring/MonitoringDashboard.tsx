"use client"

import * as React from "react"
import { supabase } from "@/lib/supabase"
import { Order, DesainPublikasiOrder, WebsiteOrder, BantuanTeknisOrder, SurveyOrder } from "@/lib/types"
import { STATUS_OPTIONS, KEMENTERIAN_OPTIONS, PLATFORM_OPTIONS, MENU_OPTIONS, MenuType, JENIS_BANTUAN_OPTIONS } from "@/lib/constants"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ExternalLink, Filter, AlertTriangle } from "lucide-react"

type SortOption = 'waktu_pemesanan' | 'deadline'

// Type guards
function isDesainPublikasi(order: Order): order is DesainPublikasiOrder {
    return order.menu_type === "desain_publikasi"
}
function isWebsite(order: Order): order is WebsiteOrder {
    return order.menu_type === "website"
}
function isBantuanTeknis(order: Order): order is BantuanTeknisOrder {
    return order.menu_type === "bantuan_teknis"
}
function isSurvey(order: Order): order is SurveyOrder {
    return order.menu_type === "survey"
}

export function MonitoringDashboard() {
    const [orders, setOrders] = React.useState<Order[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [activeTab, setActiveTab] = React.useState<MenuType>("desain_publikasi")
    
    // Filter states
    const [filterKementerian, setFilterKementerian] = React.useState<string>("")
    const [filterStatus, setFilterStatus] = React.useState<string>("")
    const [filterDate, setFilterDate] = React.useState<string>("")
    const [filterPlatform, setFilterPlatform] = React.useState<string>("")
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

    const formatDate = (d: string) => {
        if (!d) return '-'
        try {
            return new Date(d).toLocaleDateString('id-ID', {
                day: 'numeric', month: 'short', year: 'numeric'
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

    const getJenisBantuanLabel = (jenis: string) => {
        const option = JENIS_BANTUAN_OPTIONS.find(o => o.id === jenis)
        return option?.label || jenis
    }

    // Check for schedule collisions (same date + time) for Desain & Publikasi
    const scheduleCollisions = React.useMemo(() => {
        const desainOrders = orders.filter(isDesainPublikasi).filter(o => o.status !== 'cancel')
        const collisionMap: { [key: string]: DesainPublikasiOrder[] } = {}
        
        desainOrders.forEach(order => {
            const key = `${order.tanggal_publikasi}_${order.waktu_publikasi}`
            if (!collisionMap[key]) {
                collisionMap[key] = []
            }
            collisionMap[key].push(order)
        })
        
        // Return only keys with more than 1 order
        const collisions: { [key: string]: DesainPublikasiOrder[] } = {}
        Object.keys(collisionMap).forEach(key => {
            if (collisionMap[key].length > 1) {
                collisions[key] = collisionMap[key]
            }
        })
        
        return collisions
    }, [orders])

    const hasCollision = (order: DesainPublikasiOrder) => {
        const key = `${order.tanggal_publikasi}_${order.waktu_publikasi}`
        return scheduleCollisions[key] && scheduleCollisions[key].length > 1
    }

    // Filter by menu type and other filters
    const filteredOrders = React.useMemo(() => {
        let result = orders.filter(o => o.menu_type === activeTab)
        
        if (filterKementerian) {
            result = result.filter(o => o.kementerian === filterKementerian)
        }
        if (filterStatus) {
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
        if (filterPlatform && activeTab === 'desain_publikasi') {
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
        setFilterKementerian("")
        setFilterStatus("")
        setFilterDate("")
        setFilterPlatform("")
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
                                <th className="px-4 py-3">Shortlink</th>
                                <th className="px-4 py-3">Catatan</th>
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
                                    <td className="px-4 py-3">
                                        <span className="font-medium text-blue-600">{order.custom_shortlink}</span>
                                    </td>
                                    <td className="px-4 py-3 max-w-xs">
                                        <span className="text-sm truncate">{order.catatan_website || '-'}</span>
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
            {/* Menu Tabs */}
            <div className="flex flex-wrap gap-2 border-b pb-4">
                {MENU_OPTIONS.map((menu) => (
                    <button
                        key={menu.id}
                        onClick={() => setActiveTab(menu.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                            activeTab === menu.id
                                ? 'bg-primary text-white shadow-md'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        <span>{menu.icon}</span>
                        <span>{menu.label}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                            activeTab === menu.id ? 'bg-white/20' : 'bg-gray-200'
                        }`}>
                            {menuCounts[menu.id]}
                        </span>
                    </button>
                ))}
            </div>

            {/* Collision Warning */}
            <CollisionWarning />

            {/* Filter Section */}
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
                        {activeTab === 'desain_publikasi' && (
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
                        )}
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

            {/* Table */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        {MENU_OPTIONS.find(m => m.id === activeTab)?.icon} {MENU_OPTIONS.find(m => m.id === activeTab)?.label} ({filteredOrders.length})
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
        </div>
    )
}
