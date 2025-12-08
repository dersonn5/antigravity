'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/context/ThemeContext'
import { NotificationsMenu } from '@/components/NotificationsMenu'
import { useSidebar } from '@/context/SidebarContext'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface Lead {
    id: number | string
    vendedor_nome?: string
    vendedor_avatar?: string
    status: string | null
    closer_designado?: string
}

interface VendorStats {
    name: string
    avatarUrl?: string | null
    rawAvatar?: string | null
    totalLeads: number
    closedLeads: number
    conversionRate: number
}

export default function RankingPage() {
    const [vendors, setVendors] = useState<VendorStats[]>([])
    const [loading, setLoading] = useState(true)
    const { theme } = useTheme()
    const { toggleSidebar } = useSidebar()

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        try {
            setLoading(true)

            // Import dynamically to avoid build issues
            const { getRankingData } = await import('../actions')
            const result = await getRankingData()

            if (result.success && result.data) {
                setVendors(result.data)
            } else {
                console.error('Error fetching ranking:', result.error)
            }
        } catch (error) {
            console.error('Unexpected error:', error)
        } finally {
            setLoading(false)
        }
    }

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2)
    }

    return (
        <>
            <header className="flex h-auto shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 px-6 py-3 sm:h-16">
                <div className="flex items-center gap-4">

                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Ranking de Vendas 🏆</h2>
                </div>
                <div className="flex items-center gap-4">
                    <NotificationsMenu />
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-6">
                <div className="max-w-5xl mx-auto space-y-6">
                    {vendors.length > 0 ? (
                        vendors.map((vendor, index) => {
                            const isTop1 = index === 0
                            const isTop2 = index === 1
                            const isTop3 = index === 2

                            return (
                                <div
                                    key={vendor.name}
                                    className={`relative flex flex-col md:flex-row items-center gap-6 p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg
                                        ${isTop1
                                            ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-400/50 shadow-yellow-100 dark:from-yellow-900/20 dark:to-amber-900/20 dark:border-yellow-500/30 dark:shadow-none scale-105 z-10'
                                            : isTop2
                                                ? 'bg-slate-50 border-slate-300 dark:bg-slate-800/80 dark:border-slate-600'
                                                : isTop3
                                                    ? 'bg-orange-50 border-orange-200 dark:bg-orange-900/10 dark:border-orange-800/50'
                                                    : 'bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700'
                                        }`}
                                >
                                    {/* Rank Badge */}
                                    <div className="flex-shrink-0 w-16 text-center flex flex-col items-center justify-center">
                                        {isTop1 ? (
                                            <div className="relative">
                                                <span className="text-5xl drop-shadow-md filter">🏆</span>
                                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                                                    LÍDER
                                                </div>
                                            </div>
                                        ) : isTop2 ? (
                                            <span className="text-4xl drop-shadow-sm">🥈</span>
                                        ) : isTop3 ? (
                                            <span className="text-4xl drop-shadow-sm">🥉</span>
                                        ) : (
                                            <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500">
                                                #{index + 1}
                                            </div>
                                        )}
                                    </div>

                                    {/* Avatar & Name */}
                                    <div className="flex items-center gap-4 flex-1 w-full md:w-auto">
                                        <Avatar className={`h-14 w-14 transition-all
                                            ${isTop1
                                                ? 'ring-4 ring-yellow-400 ring-offset-2 shadow-lg shadow-yellow-200/50'
                                                : isTop2
                                                    ? 'ring-2 ring-slate-300 ring-offset-1'
                                                    : isTop3
                                                        ? 'ring-2 ring-orange-400 ring-offset-1'
                                                        : 'ring-2 ring-emerald-500 ring-offset-1'
                                            }`}
                                        >
                                            <AvatarImage src={vendor.avatarUrl || undefined} alt={vendor.name} className="object-cover" />
                                            <AvatarFallback className={`text-lg font-bold
                                                ${isTop1 ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-600'}`}
                                            >
                                                {getInitials(vendor.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className={`font-bold text-xl ${isTop1 ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-200'}`}>
                                                {vendor.name}
                                            </h3>
                                            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                                <span className="material-symbols-outlined text-base">groups</span>
                                                {vendor.totalLeads} leads totais
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="flex flex-1 w-full md:w-auto items-center justify-between md:justify-end gap-8">
                                        {/* Conversion Rate */}
                                        <div className="flex-1 max-w-[200px]">
                                            <div className="flex justify-between text-xs mb-1.5">
                                                <span className="font-medium text-slate-500">Conversão</span>
                                                <span className={`font-bold ${isTop1 ? 'text-yellow-700 dark:text-yellow-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                                    {vendor.conversionRate.toFixed(1)}%
                                                </span>
                                            </div>
                                            <div className="h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-1000 ease-out
                                                        ${isTop1 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' : 'bg-emerald-500'}`}
                                                    style={{ width: `${Math.min(vendor.conversionRate, 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        {/* Sales Count */}
                                        <div className="text-right min-w-[100px]">
                                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-0.5">Vendas</p>
                                            <p className={`text-4xl font-black tracking-tight
                                                ${isTop1
                                                    ? 'text-yellow-600 dark:text-yellow-400 drop-shadow-sm'
                                                    : 'text-emerald-600 dark:text-emerald-500'
                                                }`}
                                            >
                                                {vendor.closedLeads}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                            <div className="rounded-full bg-slate-50 p-6 dark:bg-slate-800/50 mb-4">
                                <span className="material-symbols-outlined text-5xl text-slate-300">emoji_events</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Ranking em processamento</h3>
                            <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
                                Aguardando vendas fechadas para gerar o ranking dos campeões.
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </>
    )
}
