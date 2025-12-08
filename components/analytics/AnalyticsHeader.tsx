'use client'

import { useSidebar } from '@/context/SidebarContext'
import { Button } from '@/components/ui/button'

export function AnalyticsHeader() {
    const { toggleSidebar } = useSidebar()

    return (
        <header className="flex h-auto shrink-0 flex-wrap items-center justify-between gap-y-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 px-6 py-4 sm:h-20 sm:flex-nowrap">
            <div className="flex items-center gap-4">

                <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        📊 Performance de Vendas
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Visão geral dos últimos 30 dias
                    </p>
                </div>
            </div>

            <Button variant="outline" disabled className="gap-2 bg-slate-50 text-slate-500 border-slate-200">
                <span className="material-symbols-outlined text-base">sync_disabled</span>
                Conectar Google Ads
            </Button>
        </header>
    )
}
