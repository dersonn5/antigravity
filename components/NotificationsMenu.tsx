'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { SystemNotification } from '@/types/notification'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function NotificationsMenu() {
    const [isOpen, setIsOpen] = useState(false)
    const [notifications, setNotifications] = useState<SystemNotification[]>([])
    const [loading, setLoading] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        fetchNotifications()
        subscribeToNotifications()

        // Close on click outside
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    async function fetchNotifications() {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('system_notifications')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(20)

            if (error) {
                console.error('Error fetching notifications:', error)
                return
            }

            if (data) {
                setNotifications(data as SystemNotification[])
                setUnreadCount(data.filter((n: SystemNotification) => !n.read).length)
            }
        } catch (error) {
            console.error('Unexpected error:', error)
        } finally {
            setLoading(false)
        }
    }

    function subscribeToNotifications() {
        const channel = supabase
            .channel('realtime-notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'system_notifications'
                },
                (payload) => {
                    const newNotification = payload.new as SystemNotification
                    setNotifications(prev => [newNotification, ...prev])
                    setUnreadCount(prev => prev + 1)

                    // Play sound
                    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3')
                    audio.play().catch(() => {
                        // Silent error if user hasn't interacted
                    })
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }

    const markAsRead = async () => {
        if (unreadCount === 0) return

        try {
            const { error } = await supabase
                .from('system_notifications')
                .update({ read: true })
                .eq('read', false)

            if (!error) {
                setUnreadCount(0)
                setNotifications(prev => prev.map(n => ({ ...n, read: true })))
            }
        } catch (error) {
            console.error('Error marking as read:', error)
        }
    }

    const handleToggle = () => {
        const newIsOpen = !isOpen
        setIsOpen(newIsOpen)

        if (newIsOpen && unreadCount > 0) {
            markAsRead()
        }
    }

    const getIcon = (type: string) => {
        const t = type.toUpperCase()
        switch (t) {
            case 'NEW_LEAD': return 'person_add'
            case 'SALE': return 'emoji_events' // Trophy/Money
            case 'STATUS_CHANGE': return 'sync_alt' // Arrow/Refresh
            case 'SYSTEM': return 'settings' // Info/Gear
            default: return 'notifications'
        }
    }

    const getColor = (type: string) => {
        const t = type.toUpperCase()
        switch (t) {
            case 'NEW_LEAD': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
            case 'SALE': return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
            case 'STATUS_CHANGE': return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            case 'SYSTEM': return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
            default: return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
        }
    }

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={handleToggle}
                className="relative flex size-10 cursor-pointer items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-500 transition-colors"
            >
                <span className="material-symbols-outlined text-xl">notifications</span>
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 size-2.5 rounded-full bg-red-500 border-2 border-white dark:border-slate-800"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 origin-top-right rounded-xl bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Central de Eventos</h3>
                        <span className="text-xs text-slate-500 dark:text-slate-400">Últimas atualizações</span>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto py-2">
                        {loading ? (
                            <div className="flex justify-center py-4">
                                <div className="size-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
                            </div>
                        ) : notifications.length > 0 ? (
                            notifications.map((notification) => (
                                <div key={notification.id} className={`flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${!notification.read ? 'bg-slate-50/50 dark:bg-slate-800/50' : ''}`}>
                                    <div className={`mt-1 flex size-8 shrink-0 items-center justify-center rounded-full ${getColor(notification.type)}`}>
                                        <span className="material-symbols-outlined text-sm">{getIcon(notification.type)}</span>
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex justify-between items-start">
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                {notification.title}
                                            </p>
                                            <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: ptBR })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                            {notification.message}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-8 text-center">
                                <p className="text-sm text-slate-500 dark:text-slate-400">Nenhuma notificação recente.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
