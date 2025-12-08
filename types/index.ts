export type TrackingInfo = {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
    gclid?: string;
};

export interface Lead {
    id: number | string
    name: string
    cidade: string
    origem: string
    status: string | null
    whatsapp_id: string
    phone?: string // Telefone limpo
    vendedor?: string
    tipo?: string
    feeling?: string
    telefone?: string
    tipo_contratacao?: string
    idades?: string
    feeling_ia?: string
    created_at?: string
    tracking_info?: TrackingInfo | null
}
