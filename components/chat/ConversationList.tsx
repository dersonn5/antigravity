'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Search, MessageCircle, Instagram, Facebook } from 'lucide-react'

interface Conversation {
    id: string
    lead_id: string
    last_message_content: string
    last_message_at: string
    unread_count: number
    platform: 'whatsapp' | 'instagram' | 'facebook'
    status: 'open' | 'closed'
    leads: {
        name: string
        avatar_url: string | null
    }
}

export default function ConversationList({ onSelectChat }: { onSelectChat: (id: string) => void }) {
    const [conversations, setConversations] = useState<Conversation[]>([])


    // Busca as conversas no banco
    useEffect(() => {
        const fetchConversations = async () => {
            // Busca conversas e os dados do Lead associado
            const { data, error } = await supabase
                .from('conversations')
                .select(`
          *,
          leads (name, avatar_url)
        `)
                .order('last_message_at', { ascending: false })

            if (error) {
                console.error('Erro ao buscar conversas:', error)
            } else {
                setConversations(data as any)
            }
        }

        fetchConversations()

        // Inscreva-se no Realtime para atualizar a lista quando chegar msg nova
        const channel = supabase
            .channel('conversations_list')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, () => {
                fetchConversations()
            })
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [])

    const formatTime = (dateString: string) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }

    const getIcon = (platform: string) => {
        switch (platform) {
            case 'instagram': return <Instagram size={14} className="text-pink-600" />
            case 'facebook': return <Facebook size={14} className="text-blue-600" />
            default: return <MessageCircle size={14} className="text-green-600" />
        }
    }

    return (
        <div className="w-80 h-full border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Inbox</h2>
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar cliente..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                        <p className="text-sm">Nenhuma conversa encontrada.</p>
                    </div>
                ) : (
                    conversations.map((chat) => (
                        <div
                            key={chat.id}
                            onClick={() => onSelectChat(chat.id)}
                            className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer border-b border-gray-50 dark:border-gray-800 transition-colors relative"
                        >
                            <div className="flex justify-between items-start mb-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                                        {chat.leads?.name || 'Lead Sem Nome'}
                                    </span>
                                    <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded-full">
                                        {getIcon(chat.platform)}
                                    </div>
                                </div>
                                <span className="text-xs text-gray-400">
                                    {formatTime(chat.last_message_at)}
                                </span>
                            </div>
                            <div className="flex justify-between items-end">
                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 w-5/6">
                                    {chat.last_message_content || 'Nova conversa'}
                                </p>
                                {chat.unread_count > 0 && (
                                    <span className="min-w-[20px] h-5 px-1.5 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                        {chat.unread_count}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}