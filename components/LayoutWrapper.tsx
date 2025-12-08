'use client'

import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/Sidebar'
import { useSidebar } from '@/context/SidebarContext'
import { cn } from '@/lib/utils'
import { Menu } from 'lucide-react'

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const { isCollapsed, setIsOpen } = useSidebar()
    const pathname = usePathname()

    const isAuthPage = pathname === '/login' || pathname === '/register'

    return (
        <div className="relative min-h-screen bg-slate-50 dark:bg-slate-900">
            {/* Fixed Sidebar - Only show if not on auth pages */}
            {!isAuthPage && <Sidebar />}

            {/* Main Content with Dynamic Margin */}
            <div
                className={cn(
                    "min-h-screen transition-all duration-300 ease-in-out flex flex-col",
                    !isAuthPage && (isCollapsed ? "lg:ml-20" : "lg:ml-64")
                )}
            >
                {/* Mobile Header */}
                {!isAuthPage && (
                    <div className="lg:hidden flex items-center p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 sticky top-0 z-10">
                        <button
                            onClick={() => setIsOpen(true)}
                            className="p-2 -ml-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <Menu className="h-6 w-6 text-slate-700 dark:text-slate-200" />
                        </button>

                    </div>
                )}
                {children}
            </div>
        </div>
    )
}
