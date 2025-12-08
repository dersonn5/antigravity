export interface SystemNotification {
    id: string
    type: 'NEW_LEAD' | 'STATUS_CHANGE' | 'SALE'
    title: string
    message: string
    metadata: {
        lead_id?: number
        lead_name?: string
        vendedor?: string
        old_status?: string
        new_status?: string
        [key: string]: any
    }
    read: boolean
    created_at: string
}
