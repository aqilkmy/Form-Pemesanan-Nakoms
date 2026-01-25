
import { OrderFormValues } from "./schema"

export interface Order extends OrderFormValues {
    id: string
    created_at: string
    status: 'pending' | 'processing' | 'completed' | 'rejected'
}
