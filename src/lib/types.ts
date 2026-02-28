
import { OrderFormValues } from "./schema"

export type OrderStatus = 'new' | 'in progress' | 'under review' | 'ready' | 'pause' | 'cancel'

export interface Order extends OrderFormValues {
    id: string
    created_at: string
    status: OrderStatus
    link_desain_selesai?: string
}
