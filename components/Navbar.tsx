'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BarChart3, Trophy } from 'lucide-react'

export function Navbar() {
    const pathname = usePathname()

    const links = [
        { href: '/', label: 'Kanban', icon: LayoutDashboard },
        { href: '/analytics', label: 'Analytics', icon: BarChart3 },
        { href: '/ranking', label: 'Ranking', icon: Trophy },
    ]

    return (
        <nav className="border-b bg-white px-8 py-4 shadow-sm">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">J.Alves Sales OS</h1>
                        <p className="text-xs text-gray-500">Enterprise Edition</p>
                    </div>

                    <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                        {links.map((link) => {
                            const Icon = link.icon
                            const isActive = pathname === link.href

                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${isActive
                                            ? 'bg-white text-blue-600 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
                                        }`}
                                >
                                    <Icon size={18} />
                                    {link.label}
                                </Link>
                            )
                        })}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                        JA
                    </div>
                </div>
            </div>
        </nav>
    )
}
