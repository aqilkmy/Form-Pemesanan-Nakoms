"use client"

import * as React from "react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import interactionPlugin from "@fullcalendar/interaction"
import { EventClickArg } from "@fullcalendar/core"
import { supabase } from "@/lib/supabase"
import { Order, DesainPublikasiOrder, BantuanTeknisOrder, SurveyOrder } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Calendar, X } from "lucide-react"
import { STATUS_OPTIONS } from "@/lib/constants"

interface CalendarEvent {
    id: string
    title: string
    start: string
    extendedProps: {
        order: Order
    }
    backgroundColor: string
    borderColor: string
}

export function ScheduleCalendar() {
    const [orders, setOrders] = React.useState<Order[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null)
    const [isMobile, setIsMobile] = React.useState(false)
    const [showMobileDetail, setShowMobileDetail] = React.useState(false)

    React.useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024)
        }
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    React.useEffect(() => {
        fetchOrders()

        const channel = supabase
            .channel('orders_calendar_realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'orders' },
                () => {
                    fetchOrders()
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
                .neq('status', 'cancel')

            if (error) throw error
            if (data) setOrders(data as Order[])
        } catch (error) {
            console.error('Error fetching orders:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const getEventTitle = (order: Order): string => {
        switch (order.menu_type) {
            case 'desain_publikasi':
                return `${order.waktu_publikasi} - ${order.judul_desain}`
            case 'bantuan_teknis':
                return `${order.waktu_kegiatan} - ${order.nama_kegiatan}`
            case 'survey':
                return `Survey: ${order.judul_survey}`
            case 'website':
                return `Website: ${order.custom_shortlink || order.nama}`
        }
    }

    const getEventDate = (order: Order): string | null => {
        switch (order.menu_type) {
            case 'desain_publikasi':
                return order.tanggal_publikasi
            case 'bantuan_teknis':
                return order.tanggal_kegiatan
            case 'survey':
                return order.deadline_survey
            case 'website':
                return null // Website orders don't have a date
            default:
                return null
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'new':
                return { bg: '#3b82f6', border: '#2563eb' } // blue
            case 'in progress':
                return { bg: '#eab308', border: '#ca8a04' } // yellow
            case 'under review':
                return { bg: '#a855f7', border: '#9333ea' } // purple
            case 'ready':
                return { bg: '#22c55e', border: '#16a34a' } // green
            case 'pause':
                return { bg: '#f97316', border: '#ea580c' } // orange
            default:
                return { bg: '#6b7280', border: '#4b5563' } // gray
        }
    }

    const events: CalendarEvent[] = orders
        .filter(order => getEventDate(order) !== null)
        .map(order => {
            const colors = getStatusColor(order.status)
            return {
                id: order.id,
                title: getEventTitle(order),
                start: getEventDate(order)!,
                extendedProps: {
                    order: order
                },
                backgroundColor: colors.bg,
                borderColor: colors.border
            }
        })

    const handleEventClick = (info: EventClickArg) => {
        const order = info.event.extendedProps.order as Order
        setSelectedOrder(order)
        if (isMobile) {
            setShowMobileDetail(true)
        }
    }

    const getStatusLabel = (status: string) => {
        const option = STATUS_OPTIONS.find(opt => opt.value === status)
        return option?.label || status
    }

    const getStatusBadgeColor = (status: string) => {
        const option = STATUS_OPTIONS.find(opt => opt.value === status)
        return option?.color || 'bg-gray-100 text-gray-800'
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    const getOrderTitle = (order: Order): string => {
        switch (order.menu_type) {
            case 'desain_publikasi':
                return order.judul_desain
            case 'bantuan_teknis':
                return order.nama_kegiatan
            case 'survey':
                return order.judul_survey
            case 'website':
                return order.custom_shortlink || 'Website Request'
        }
    }

    const getOrderSchedule = (order: Order): string => {
        switch (order.menu_type) {
            case 'desain_publikasi':
                return `${order.tanggal_publikasi} • ${order.waktu_publikasi}`
            case 'bantuan_teknis':
                return `${order.tanggal_kegiatan} • ${order.waktu_kegiatan}`
            case 'survey':
                return `Deadline: ${order.deadline_survey}`
            case 'website':
                return '-'
        }
    }

    const getMenuTypeLabel = (menuType: string): string => {
        switch (menuType) {
            case 'desain_publikasi':
                return 'Desain & Publikasi'
            case 'bantuan_teknis':
                return 'Bantuan Teknis'
            case 'survey':
                return 'Survey'
            case 'website':
                return 'Website'
            default:
                return menuType
        }
    }

    const DetailContent = () => {
        if (!selectedOrder) return null

        return (
            <div className="space-y-3">
                <div>
                    <div className="text-xs text-muted-foreground">Tipe Layanan</div>
                    <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-xs font-medium">
                        {getMenuTypeLabel(selectedOrder.menu_type)}
                    </span>
                </div>
                <div>
                    <div className="text-xs text-muted-foreground">Judul</div>
                    <div className="font-semibold">{getOrderTitle(selectedOrder)}</div>
                </div>
                <div>
                    <div className="text-xs text-muted-foreground">Pemesan</div>
                    <div className="font-medium">{selectedOrder.nama}</div>
                    <div className="text-xs text-muted-foreground">{selectedOrder.kementerian}</div>
                </div>
                <div>
                    <div className="text-xs text-muted-foreground">Jadwal</div>
                    <div className="font-medium">{getOrderSchedule(selectedOrder)}</div>
                </div>
                {selectedOrder.menu_type === 'desain_publikasi' && (
                    <div>
                        <div className="text-xs text-muted-foreground">Platform</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {selectedOrder.platform_publikasi.map((p: string) => (
                                <span key={p} className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">
                                    {p}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
                {selectedOrder.menu_type === 'bantuan_teknis' && (
                    <div>
                        <div className="text-xs text-muted-foreground">Tempat</div>
                        <div className="font-medium">{selectedOrder.tempat_kegiatan}</div>
                    </div>
                )}
                <div>
                    <div className="text-xs text-muted-foreground">Status</div>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold mt-1 ${getStatusBadgeColor(selectedOrder.status)}`}>
                        {getStatusLabel(selectedOrder.status)}
                    </span>
                </div>
                <div>
                    <div className="text-xs text-muted-foreground">WhatsApp</div>
                    <a 
                        href={`https://wa.me/${selectedOrder.nomor_whatsapp}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                    >
                        {selectedOrder.nomor_whatsapp}
                    </a>
                </div>
            </div>
        )
    }

    return (
        <>
            {/* Mobile Detail Modal */}
            {showMobileDetail && selectedOrder && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div 
                        className="absolute inset-0 bg-black/50" 
                        onClick={() => setShowMobileDetail(false)}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-4 max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Detail Konten
                            </h3>
                            <button 
                                onClick={() => setShowMobileDetail(false)}
                                className="p-1 hover:bg-gray-100 rounded-full"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <DetailContent />
                    </div>
                </div>
            )}

            {/* Legend - Horizontal on mobile */}
            <Card className="mb-4">
                <CardContent className="py-3 px-4">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                        <span className="text-xs font-medium text-muted-foreground">Keterangan:</span>
                        {STATUS_OPTIONS.filter(s => s.value !== 'cancel').map(status => (
                            <div key={status.value} className="flex items-center gap-1.5 text-xs">
                                <div 
                                    className="w-2.5 h-2.5 rounded"
                                    style={{ backgroundColor: getStatusColor(status.value).bg }}
                                />
                                <span>{status.label}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
                <div className="lg:col-span-3 order-1">
                    <Card>
                        <CardContent className="p-2 sm:p-4">
                            <style jsx global>{`
                                .fc {
                                    font-size: 12px;
                                }
                                @media (min-width: 640px) {
                                    .fc {
                                        font-size: 14px;
                                    }
                                }
                                .fc .fc-toolbar {
                                    flex-wrap: wrap;
                                    gap: 8px;
                                }
                                .fc .fc-toolbar-title {
                                    font-size: 1rem;
                                }
                                @media (min-width: 640px) {
                                    .fc .fc-toolbar-title {
                                        font-size: 1.25rem;
                                    }
                                }
                                .fc .fc-button {
                                    padding: 4px 8px;
                                    font-size: 11px;
                                }
                                @media (min-width: 640px) {
                                    .fc .fc-button {
                                        padding: 6px 12px;
                                        font-size: 13px;
                                    }
                                }
                                .fc .fc-daygrid-event {
                                    font-size: 10px;
                                    padding: 1px 3px;
                                    white-space: nowrap;
                                    overflow: hidden;
                                    text-overflow: ellipsis;
                                }
                                @media (min-width: 640px) {
                                    .fc .fc-daygrid-event {
                                        font-size: 12px;
                                        padding: 2px 4px;
                                    }
                                }
                                .fc .fc-daygrid-day-number {
                                    font-size: 11px;
                                    padding: 4px;
                                }
                                @media (min-width: 640px) {
                                    .fc .fc-daygrid-day-number {
                                        font-size: 14px;
                                        padding: 8px;
                                    }
                                }
                                .fc .fc-col-header-cell-cushion {
                                    font-size: 10px;
                                    padding: 4px 2px;
                                }
                                @media (min-width: 640px) {
                                    .fc .fc-col-header-cell-cushion {
                                        font-size: 13px;
                                        padding: 8px 4px;
                                    }
                                }
                            `}</style>
                            <FullCalendar
                                plugins={[dayGridPlugin, interactionPlugin]}
                                initialView={isMobile ? "dayGridMonth" : "dayGridMonth"}
                                events={events}
                                eventClick={handleEventClick}
                                headerToolbar={isMobile ? {
                                    left: 'prev,next',
                                    center: 'title',
                                    right: 'today'
                                } : {
                                    left: 'prev,next today',
                                    center: 'title',
                                    right: 'dayGridMonth,dayGridWeek'
                                }}
                                locale="id"
                                buttonText={{
                                    today: 'Hari Ini',
                                    month: 'Bulan',
                                    week: 'Minggu'
                                }}
                                height="auto"
                                eventDisplay="block"
                                eventTimeFormat={{
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: false
                                }}
                                dayMaxEvents={isMobile ? 2 : 4}
                                moreLinkText={(num) => `+${num}`}
                                fixedWeekCount={false}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Desktop Detail Panel */}
                <div className="hidden lg:block lg:col-span-1 order-2">
                    <Card className="sticky top-4">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Detail Konten
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {selectedOrder ? (
                                <DetailContent />
                            ) : (
                                <div className="text-muted-foreground text-sm text-center py-8">
                                    Klik event di kalender untuk melihat detail
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    )
}
