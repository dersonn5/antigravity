'use client'

import { supabase } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react'

import { useSidebar } from '@/context/SidebarContext'

export function Sidebar() {
    const { isOpen, setIsOpen, isCollapsed, setIsCollapsed } = useSidebar()
    const pathname = usePathname()
    const router = useRouter()
    const [profile, setProfile] = useState<{ full_name: string | null, avatar_url: string | null }>({ full_name: null, avatar_url: null })
    const [rank, setRank] = useState<number | null>(null)

    useEffect(() => {
        getProfile()

        const handleProfileUpdate = () => {
            getProfile()
        }

        window.addEventListener('profile-updated', handleProfileUpdate)

        return () => {
            window.removeEventListener('profile-updated', handleProfileUpdate)
        }
    }, [])

    async function getProfile() {
        try {
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select(`full_name, avatar_url`)
                    .eq('id', user.id)
                    .single()

                if (data) {
                    setProfile(data)
                    if (data.full_name) {
                        getRank(data.full_name)
                    }
                }
            }
        } catch (error) {
            console.error('Error loading user profile:', error)
        }
    }

    async function getRank(userName: string) {
        try {
            const { data, error } = await supabase
                .from('view_sales_os')
                .select('vendedor_nome, status')

            if (data) {
                const statsMap: Record<string, number> = {}
                data.forEach((lead: any) => {
                    const vendor = lead.vendedor_nome || 'Sem Dono'
                    if (lead.status && lead.status.toLowerCase() === 'fechado') {
                        statsMap[vendor] = (statsMap[vendor] || 0) + 1
                    }
                })

                const sortedVendors = Object.entries(statsMap)
                    .sort(([, a], [, b]) => b - a)
                    .map(([name]) => name)

                const userRank = sortedVendors.indexOf(userName)
                if (userRank !== -1) {
                    setRank(userRank + 1)
                } else {
                    setRank(null)
                }
            }
        } catch (error) {
            console.error('Error fetching rank:', error)
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`fixed inset-0 z-20 bg-black/50 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsOpen(false)}
            />

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-30 transform bg-emerald-900 text-slate-300 transition-all duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    } ${isCollapsed ? 'w-20' : 'w-64'}`}
            >
                <div className="flex h-full flex-col justify-between">
                    {/* Top Section */}
                    <div>
                        {/* Logo */}
                        {/* Logo */}
                        <div className={`flex h-16 items-center border-b border-emerald-800 transition-all duration-300 ${isCollapsed ? 'justify-center px-2' : 'px-6'}`}>
                            {isCollapsed ? (
                                <div className="flex h-10 w-10 items-center justify-center flex-shrink-0 transition-all duration-300">
                                    <img src="/logo-icon.png" alt="Logo Icon" className="h-full w-full object-contain" />
                                </div>
                            ) : (
                                <div className="flex items-center justify-start w-full transition-all duration-300">
                                    <img src="/logo-white.png" alt="J.Alves Sales" className="h-8 object-contain" />
                                </div>
                            )}
                        </div>

                        {/* Navigation - Top Items */}
                        <nav className="space-y-1 px-3 py-4">
                            <Link
                                href="/"
                                className={`flex items-center rounded-lg px-3 py-2 transition-colors ${pathname === '/' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-emerald-800 hover:text-white'
                                    } ${isCollapsed ? 'justify-center' : 'gap-3'}`}
                                title={isCollapsed ? 'Kanban Board' : ''}
                            >
                                <span className="material-symbols-outlined text-lg">view_kanban</span>
                                {!isCollapsed && <span className="text-sm font-medium">Kanban Board</span>}
                            </Link>
                            <Link
                                href="/analytics"
                                className={`flex items-center rounded-lg px-3 py-2 transition-colors ${pathname === '/analytics' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-emerald-800 hover:text-white'
                                    } ${isCollapsed ? 'justify-center' : 'gap-3'}`}
                                title={isCollapsed ? 'Analytics' : ''}
                            >
                                <span className="material-symbols-outlined text-lg">analytics</span>
                                {!isCollapsed && <span className="text-sm font-medium">Analytics</span>}
                            </Link>
                            <Link
                                href="/ranking"
                                className={`flex items-center rounded-lg px-3 py-2 transition-colors ${pathname === '/ranking' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-emerald-800 hover:text-white'
                                    } ${isCollapsed ? 'justify-center' : 'gap-3'}`}
                                title={isCollapsed ? 'Ranking' : ''}
                            >
                                <span className="material-symbols-outlined text-lg">emoji_events</span>
                                {!isCollapsed && <span className="text-sm font-medium">Ranking 🏆</span>}
                            </Link>
                            <Link
                                href="/chat"
                                className={`flex items-center rounded-lg px-3 py-2 transition-colors ${pathname === '/chat' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-emerald-800 hover:text-white'
                                    } ${isCollapsed ? 'justify-center' : 'gap-3'}`}
                                title={isCollapsed ? 'Inbox' : ''}
                            >
                                <MessageSquare className="h-5 w-5" />
                                {!isCollapsed && <span className="text-sm font-medium">Inbox</span>}
                            </Link>
                        </nav>
                    </div>

                    {/* Bottom Section */}
                    <div className="mt-auto">
                        <nav className="space-y-1 px-3 pb-4">
                            <Link
                                href="/settings"
                                className={`flex items-center rounded-lg px-3 py-2 transition-colors ${pathname === '/settings' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-emerald-800 hover:text-white'
                                    } ${isCollapsed ? 'justify-center' : 'gap-3'}`}
                                title={isCollapsed ? 'Configurações' : ''}
                            >
                                <span className="material-symbols-outlined text-lg">settings</span>
                                {!isCollapsed && <span className="text-sm font-medium">Configurações</span>}
                            </Link>
                            <button
                                onClick={handleLogout}
                                className={`flex w-full items-center rounded-lg px-3 py-2 text-slate-300 hover:bg-emerald-800 hover:text-white transition-colors cursor-pointer ${isCollapsed ? 'justify-center' : 'gap-3'
                                    }`}
                                title={isCollapsed ? 'Logout' : ''}
                            >
                                <span className="material-symbols-outlined text-lg">logout</span>
                                {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
                            </button>
                        </nav>

                        {/* User Profile */}
                        <div className="border-t border-emerald-800 p-4">
                            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                                <div
                                    className={`h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden bg-cover bg-center flex-shrink-0 transition-all
                                        ${rank === 1
                                            ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-emerald-900'
                                            : rank === 2 || rank === 3
                                                ? 'ring-2 ring-slate-300 ring-offset-2 ring-offset-emerald-900'
                                                : 'ring-2 ring-emerald-500 ring-offset-2'
                                        }`}
                                    style={{ backgroundImage: profile.avatar_url ? `url("${profile.avatar_url}")` : 'none' }}
                                >
                                    {!profile.avatar_url && <span className="text-xs font-bold text-white">EU</span>}
                                </div>
                                {!isCollapsed && (
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-medium text-white truncate">{profile.full_name || 'Usuário'}</p>
                                        <p className="text-xs text-slate-400">Vendedor</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Collapse Toggle Button - Desktop Only */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="hidden lg:flex absolute -right-4 top-1/2 transform -translate-y-1/2 z-50 h-8 w-8 bg-white rounded-full border border-slate-300 shadow-lg items-center justify-center cursor-pointer hover:bg-slate-50 hover:shadow-xl transition-all"
                    title={isCollapsed ? 'Expandir' : 'Recolher'}
                >
                    {isCollapsed ? (
                        <ChevronRight className="h-5 w-5 text-emerald-900" />
                    ) : (
                        <ChevronLeft className="h-5 w-5 text-emerald-900" />
                    )}
                </button>
            </aside>
        </>
    )
}
