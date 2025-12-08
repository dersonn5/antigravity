'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { AnalyticsSummary } from '@/lib/analytics-mock'
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ArrowUpRight, ArrowDownRight, DollarSign, TrendingUp, Users, Wallet } from 'lucide-react'

interface AnalyticsDashboardProps {
    data: AnalyticsSummary
}

export function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value)
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* KPI Cards - Bento Row 1 */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="relative overflow-hidden border-l-4 border-l-primary shadow-md hover:shadow-lg transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Investimento
                        </CardTitle>
                        <div className="p-2 bg-primary/10 rounded-full">
                            <Wallet className="h-4 w-4 text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">{formatCurrency(data.totalSpend)}</div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center">
                            <ArrowUpRight className="h-3 w-3 text-emerald-500 mr-1" />
                            <span className="text-emerald-500 font-medium">+12.5%</span>
                            <span className="ml-1">vs mês anterior</span>
                        </p>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-l-4 border-l-emerald-500 shadow-md hover:shadow-lg transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Receita
                        </CardTitle>
                        <div className="p-2 bg-emerald-500/10 rounded-full">
                            <DollarSign className="h-4 w-4 text-emerald-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">{formatCurrency(data.totalRevenue)}</div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center">
                            <ArrowUpRight className="h-3 w-3 text-emerald-500 mr-1" />
                            <span className="text-emerald-500 font-medium">+8.2%</span>
                            <span className="ml-1">vs mês anterior</span>
                        </p>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            ROAS
                        </CardTitle>
                        <div className="p-2 bg-blue-500/10 rounded-full">
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${data.roas > 3 ? 'text-emerald-500' : data.roas < 1 ? 'text-destructive' : 'text-yellow-500'}`}>
                            {data.roas}x
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center">
                            <ArrowDownRight className="h-3 w-3 text-destructive mr-1" />
                            <span className="text-destructive font-medium">-2.1%</span>
                            <span className="ml-1">vs mês anterior</span>
                        </p>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-l-4 border-l-orange-500 shadow-md hover:shadow-lg transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            CAC
                        </CardTitle>
                        <div className="p-2 bg-orange-500/10 rounded-full">
                            <Users className="h-4 w-4 text-orange-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">{formatCurrency(data.cac)}</div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center">
                            <ArrowUpRight className="h-3 w-3 text-destructive mr-1" />
                            <span className="text-destructive font-medium">+5.4%</span>
                            <span className="ml-1">vs mês anterior</span>
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section - Bento Row 2 */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-7">
                {/* Area Chart - Spend vs Revenue (Takes up 5/7 columns) */}
                <Card className="col-span-1 lg:col-span-4 shadow-md hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                        <CardTitle>Performance Financeira</CardTitle>
                        <CardDescription>Comparativo de Investimento vs Receita nos últimos 30 dias</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.dailyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis
                                        dataKey="date"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        stroke="hsl(var(--muted-foreground))"
                                    />
                                    <YAxis
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `R$${value}`}
                                        stroke="hsl(var(--muted-foreground))"
                                    />
                                    <Tooltip
                                        formatter={(value: number) => formatCurrency(value)}
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--card))',
                                            borderColor: 'hsl(var(--border))',
                                            borderRadius: 'var(--radius)',
                                            color: 'hsl(var(--foreground))',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                        }}
                                    />
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        name="Receita"
                                        stroke="#10b981"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorRevenue)"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="spend"
                                        name="Investimento"
                                        stroke="#6366f1"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorSpend)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Pie Chart - Traffic Sources (Takes up 2/7 columns) */}
                <Card className="col-span-1 lg:col-span-3 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col">
                    <CardHeader>
                        <CardTitle>Fontes de Tráfego</CardTitle>
                        <CardDescription>Distribuição por canal de aquisição</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-center">
                        <div className="h-[250px] w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.sources}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {data.sources.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--card))',
                                            borderColor: 'hsl(var(--border))',
                                            borderRadius: 'var(--radius)',
                                            color: 'hsl(var(--foreground))'
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                                <span className="text-3xl font-bold text-foreground">100%</span>
                                <span className="text-xs text-muted-foreground">Total</span>
                            </div>
                        </div>
                        <div className="mt-6 space-y-3">
                            {data.sources.map((source, index) => (
                                <div key={index} className="flex items-center justify-between text-sm group cursor-default">
                                    <div className="flex items-center gap-3">
                                        <div className="h-3 w-3 rounded-full ring-2 ring-transparent group-hover:ring-offset-1 transition-all" style={{ backgroundColor: source.color, '--tw-ring-color': source.color } as React.CSSProperties} />
                                        <span className="text-muted-foreground font-medium">{source.name}</span>
                                    </div>
                                    <span className="font-bold text-foreground">{source.value}%</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
