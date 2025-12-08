'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'
type KanbanBackground = string

interface ThemeContextType {
    theme: Theme
    toggleTheme: () => void
    kanbanBackground: KanbanBackground
    setKanbanBackground: (bg: KanbanBackground) => void
    pipelineColor: string
    setPipelineColor: (color: string) => void
    pipelineTexture: string
    setPipelineTexture: (texture: string) => void
    cardTexture: string
    setCardTexture: (texture: string) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('light')
    const [kanbanBackground, setKanbanBackground] = useState<KanbanBackground>('clean')
    const [pipelineColor, setPipelineColor] = useState<string>('#f1f5f9') // Default slate-100
    const [pipelineTexture, setPipelineTexture] = useState<string>('none')
    const [cardTexture, setCardTexture] = useState<string>('none')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as Theme
        const savedBg = localStorage.getItem('kanbanBackground') as KanbanBackground
        const savedPipelineColor = localStorage.getItem('pipelineColor')
        const savedPipelineTexture = localStorage.getItem('pipelineTexture')
        const savedCardTexture = localStorage.getItem('cardTexture')

        if (savedTheme) setTheme(savedTheme)
        if (savedBg) setKanbanBackground(savedBg)
        if (savedPipelineColor) setPipelineColor(savedPipelineColor)
        if (savedPipelineTexture) setPipelineTexture(savedPipelineTexture)
        if (savedCardTexture) setCardTexture(savedCardTexture)

        setMounted(true)
    }, [])

    useEffect(() => {
        if (!mounted) return
        localStorage.setItem('theme', theme)
        if (theme === 'dark') {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }, [theme, mounted])

    useEffect(() => {
        if (!mounted) return
        localStorage.setItem('kanbanBackground', kanbanBackground)
    }, [kanbanBackground, mounted])

    useEffect(() => {
        if (!mounted) return
        localStorage.setItem('pipelineColor', pipelineColor)
    }, [pipelineColor, mounted])

    useEffect(() => {
        if (!mounted) return
        localStorage.setItem('pipelineTexture', pipelineTexture)
    }, [pipelineTexture, mounted])

    useEffect(() => {
        if (!mounted) return
        localStorage.setItem('cardTexture', cardTexture)
    }, [cardTexture, mounted])

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light')
    }

    return (
        <ThemeContext.Provider value={{
            theme, toggleTheme,
            kanbanBackground, setKanbanBackground,
            pipelineColor, setPipelineColor,
            pipelineTexture, setPipelineTexture,
            cardTexture, setCardTexture
        }}>
            {mounted ? children : <div className="invisible">{children}</div>}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => {
    const context = useContext(ThemeContext)
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return context
}
