import { getMockAnalyticsData } from '@/lib/analytics-mock'
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard'
import { AnalyticsHeader } from '@/components/analytics/AnalyticsHeader'
import { OperationalDashboard } from '@/components/analytics/OperationalDashboard'
import { createClient } from '@supabase/supabase-js'

export default async function AnalyticsPage() {
    const data = await getMockAnalyticsData()

    // Fetch real leads for Operational Dashboard
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: leads } = await supabase
        .from('view_sales_os')
        .select('*')

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
            <AnalyticsHeader />

            <main className="flex-1 overflow-y-auto p-6">
                <AnalyticsDashboard data={data} />
                <OperationalDashboard leads={leads || []} />
            </main>
        </div>
    )
}
