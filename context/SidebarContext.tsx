'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface SidebarContextType {
    isOpen: boolean
    setIsOpen: (isOpen: boolean) => void
    isCollapsed: boolean
    setIsCollapsed: (isCollapsed: boolean) => void
    toggleSidebar: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false)
    const [isCollapsed, setIsCollapsed] = useState(false)

    // Close mobile sidebar when route changes (optional, but good UX)
    // We can add this later if needed

    const toggleSidebar = () => setIsCollapsed(prev => !prev)

    return (
        <SidebarContext.Provider value={{
            isOpen,
            setIsOpen,
            isCollapsed,
            setIsCollapsed,
            toggleSidebar
        }}>
            {children}
        </SidebarContext.Provider>
    )
}

export function useSidebar() {
    const context = useContext(SidebarContext)
    if (context === undefined) {
        throw new Error('useSidebar must be used within a SidebarProvider')
    }
    return context
}
