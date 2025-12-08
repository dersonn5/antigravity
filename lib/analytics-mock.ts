export type DailyMetric = {
    date: string;
    spend: number;
    revenue: number;
    sales: number;
    leads: number;
};

export type AnalyticsSummary = {
    totalSpend: number;
    totalRevenue: number;
    roas: number;
    cac: number;
    totalLeads: number;
    conversionRate: number;
    dailyData: DailyMetric[];
    sources: { name: string; value: number; color: string }[];
};

export async function getMockAnalyticsData(days: number = 30): Promise<AnalyticsSummary> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const dailyData: DailyMetric[] = [];
    let totalSpend = 0;
    let totalRevenue = 0;
    let totalLeads = 0;
    let totalSales = 0;

    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        // Randomize daily stats with logic
        // Spend between 200 and 800
        const spend = Math.floor(Math.random() * 600) + 200;

        // Revenue always higher than spend (profit)
        // ROI between 2x and 5x
        const roi = (Math.random() * 3) + 2;
        const revenue = Math.floor(spend * roi);

        // CPL between 15 and 40
        const cpl = Math.floor(Math.random() * 25) + 15;
        const leads = Math.floor(spend / cpl);

        // Sales based on leads (5% to 15% conversion)
        const conversionRate = (Math.random() * 0.1) + 0.05;
        const sales = Math.floor(leads * conversionRate);

        totalSpend += spend;
        totalRevenue += revenue;
        totalLeads += leads;
        totalSales += sales;

        dailyData.push({
            date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            spend,
            revenue,
            sales,
            leads
        });
    }

    return {
        totalSpend,
        totalRevenue,
        roas: totalSpend > 0 ? Number((totalRevenue / totalSpend).toFixed(2)) : 0,
        cac: totalSales > 0 ? Number((totalSpend / totalSales).toFixed(2)) : 0,
        totalLeads,
        conversionRate: totalLeads > 0 ? Number(((totalSales / totalLeads) * 100).toFixed(1)) : 0,
        dailyData,
        sources: [
            { name: 'Google Ads', value: 60, color: '#3b82f6' },
            { name: 'Meta Ads', value: 30, color: '#8b5cf6' },
            { name: 'Indicação', value: 10, color: '#10b981' },
        ]
    };
}
