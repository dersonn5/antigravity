'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
    PieChart, Pie, Cell, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
    CartesianGrid
} from 'recharts'
import { Users, Filter, CheckCircle2, Clock, Target } from 'lucide-react'

interface Lead {
    id: number | string
    origem: string
    status: string | null
    created_at?: string
    vendedor_nome?: string
}

interface OperationalDashboardProps {
    leads: Lead[]
}

export function OperationalDashboard({ leads }: OperationalDashboardProps) {
    // KPI Calculation
    const totalLeads = leads.length
    const newLeads = leads.filter(l => !l.status || l.status.toLowerCase() === 'novo').length
    const inNegotiation = leads.filter(l => l.status?.toLowerCase() === 'em_atendimento').length
    const closedLeads = leads.filter(l => l.status?.toLowerCase() === 'fechado').length
    const conversionRate = totalLeads > 0 ? ((closedLeads / totalLeads) * 100).toFixed(1) : '0.0'

    // Charts Data
    // 1. Origin (Pie)
    const originData = Object.entries(leads.reduce((acc, lead) => {
        const origin = lead.origem || 'Desconhecido'
        acc[origin] = (acc[origin] || 0) + 1
        return acc
    }, {} as Record<string, number>))
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)

    // 2. Funnel (Bar)
    const statusData = [
        { name: 'Novos', value: newLeads },
        { name: 'Em Negociação', value: inNegotiation },
        { name: 'Fechados', value: closedLeads },
    ]

    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#6366f1', '#ec4899']

    return (
        <div className="space-y-6 mt-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Target className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-foreground tracking-tight">
                        Operacional (Real-Time)
                    </h2>
                    <p className="text-sm text-muted-foreground">Monitoramento em tempo real da equipe de vendas</p>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="hover:shadow-md transition-shadow duration-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total de Leads</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">{totalLeads}</div>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow duration-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Conversão</CardTitle>
                        <Filter className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end gap-2">
                            <div className="text-2xl font-bold text-emerald-600">{conversionRate}%</div>
                            <span className="text-xs text-muted-foreground mb-1">de fechamento</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow duration-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Em Negociação</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-500">{inNegotiation}</div>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow duration-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Vendas Realizadas</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">{closedLeads}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Origin Pie */}
                <Card className="lg:col-span-1 hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                        <CardTitle>Origem dos Leads</CardTitle>
                        <CardDescription>Distribuição por fonte</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={originData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {originData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--card))',
                                            borderColor: 'hsl(var(--border))',
                                            borderRadius: 'var(--radius)',
                                            color: 'hsl(var(--foreground))'
                                        }}
                                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        formatter={(value) => <span className="text-muted-foreground text-sm">{value}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Funnel Bar */}
                <Card className="lg:col-span-2 hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                        <CardTitle>Funil de Vendas</CardTitle>
                        <CardDescription>Volume de leads por etapa do funil</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={statusData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                                    <XAxis
                                        dataKey="name"
                                        stroke="hsl(var(--muted-foreground))"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="hsl(var(--muted-foreground))"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--card))',
                                            borderColor: 'hsl(var(--border))',
                                            borderRadius: 'var(--radius)',
                                            color: 'hsl(var(--foreground))'
                                        }}
                                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                                    />
                                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={60}>
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={
                                                entry.name === 'Fechados' ? '#10b981' :
                                                    entry.name === 'Em Negociação' ? '#f59e0b' :
                                                        'hsl(var(--primary))'
                                            } />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
