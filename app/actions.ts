'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

// Initialize Supabase client for server-side operations
// Note: In a real production app with RLS, you might want to use createServerComponentClient from @supabase/auth-helpers-nextjs
// or use the service role key if this is an admin action.
// For this prototype, we'll use the env vars directly.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function updateLeadStatus(
    id: number | string,
    newStatus: string,
    closerData?: { closer_id?: string, closer_designado?: string }
) {
    try {
        const updatePayload: any = { status: newStatus }

        if (closerData) {
            if (closerData.closer_id) updatePayload.closer_id = closerData.closer_id
            if (closerData.closer_designado) updatePayload.closer_designado = closerData.closer_designado
        }

        const { error } = await supabase
            .from('jalves_leads')
            .update(updatePayload)
            .eq('id', id)

        if (error) {
            console.error('Error updating lead:', error)
            return { success: false, error: error.message }
        }

        revalidatePath('/')
        return { success: true }
    } catch (error) {
        console.error('Unexpected error:', error)
        return { success: false, error: 'Internal Server Error' }
    }
}

export async function updateLead(id: number | string, data: {
    name: string
    whatsapp: string
    city: string
    origin: string
    type: string
    ages: string
    status: string
}) {
    try {
        const { error } = await supabase
            .from('jalves_leads')
            .update({
                name: data.name,
                remotejid: data.whatsapp, // Mapping to correct column
                cidade: data.city,
                origem: data.origin,
                tipo_contratacao: data.type,
                idades: data.ages,
                status: data.status
            })
            .eq('id', id)

        if (error) {
            console.error('Error updating lead:', error)
            return { success: false, error: error.message }
        }

        revalidatePath('/')
        return { success: true }
    } catch (error) {
        console.error('Unexpected error:', error)
        return { success: false, error: 'Internal Server Error' }
    }
}

export async function createLead(data: {
    name: string
    whatsapp: string
    city: string
    type: string
    origin: string
    ages?: string
    vendor?: string
    closer_id?: string
}) {
    try {
        const { error } = await supabase
            .from('jalves_leads')
            .insert({
                name: data.name,
                remotejid: data.whatsapp,
                cidade: data.city,
                tipo_contratacao: data.type,
                origem: data.origin,
                idades: data.ages,
                closer_designado: data.vendor,
                closer_id: data.closer_id,
                status: 'novo',
                data_atribuicao: new Date().toISOString()
            })

        if (error) {
            console.error('Error creating lead:', error)
            return { success: false, error: error.message }
        }

        revalidatePath('/')
        return { success: true }
    } catch (error) {
        console.error('Unexpected error:', error)
        return { success: false, error: 'Internal Server Error' }
    }
}

export async function getRankingData() {
    try {
        // Fetch leads
        const { data: leads, error: leadsError } = await supabase
            .from('jalves_leads')
            .select('*')

        if (leadsError) throw leadsError

        // Fetch profiles for avatars
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')

        if (profilesError) throw profilesError

        const statsMap: Record<string, { total: number; closed: number; avatar: string | null; id: string }> = {}

        // Helper to find profile by ID or Name
        const findProfile = (id?: string, name?: string) => {
            if (id) return profiles?.find(p => p.id === id)
            if (name) return profiles?.find(p => p.full_name === name)
            return null
        }

        leads?.forEach((lead: any) => {
            // Determine responsible person
            // 1. Use closer_id if available
            // 2. Use closer_designado if available
            // 3. Fallback to 'Sem Dono' (ignored)

            let responsibleId = lead.closer_id
            let responsibleName = lead.closer_designado

            // If no explicit closer, try to map from legacy fields if they exist? 
            // Assuming closer_designado is the main field now.

            if (!responsibleName || responsibleName === 'Aguardando Atribuição' || responsibleName === 'Sem Dono') {
                return
            }

            // Normalize name key
            const key = responsibleName

            if (!statsMap[key]) {
                const profile = findProfile(responsibleId, responsibleName)
                statsMap[key] = {
                    total: 0,
                    closed: 0,
                    avatar: profile?.avatar_url || null,
                    id: profile?.id || ''
                }
            }

            statsMap[key].total += 1

            if (lead.status && lead.status.toLowerCase() === 'fechado') {
                statsMap[key].closed += 1
            }
        })

        const projectId = process.env.NEXT_PUBLIC_SUPABASE_URL?.split('.')[0].replace('https://', '')

        const statsArray = Object.entries(statsMap).map(([name, stat]) => {
            const avatarPath = stat.avatar
            const fullUrl = avatarPath?.startsWith("http")
                ? avatarPath
                : avatarPath
                    ? `https://${projectId}.supabase.co/storage/v1/object/public/avatars/${avatarPath}`
                    : null

            return {
                name,
                avatarUrl: fullUrl,
                rawAvatar: stat.avatar,
                totalLeads: stat.total,
                closedLeads: stat.closed,
                conversionRate: stat.total > 0 ? (stat.closed / stat.total) * 100 : 0
            }
        })

        statsArray.sort((a, b) => b.closedLeads - a.closedLeads)

        return { success: true, data: statsArray }

    } catch (error) {
        console.error('Error fetching ranking data:', error)
        return { success: false, error: 'Failed to fetch ranking' }
    }
}
