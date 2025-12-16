'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'

interface Conversation {
    id: string
    name: string
    lastMessage: string
    time: string
    unread: number
    avatar?: string
}

const MOCK_CONVERSATIONS: Conversation[] = [
    {
        id: '1',
        name: 'Equipe de Vendas',
        lastMessage: 'Vamos bater a meta hoje!',
        time: '10:30',
        unread: 2,
    },
    {
        id: '2',
        name: 'Suporte Técnico',
        lastMessage: 'O sistema está estável.',
        time: '09:15',
        unread: 0,
    }
]

interface ConversationListProps {
    onSelectChat: (chatId: string) => void
}

export default function ConversationList({ onSelectChat }: ConversationListProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [activeId, setActiveId] = useState<string | null>(null)

    const handleSelect = (id: string) => {
        setActiveId(id)
        onSelectChat(id)
    }

    const filteredConversations = MOCK_CONVERSATIONS.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="flex flex-col h-full w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Conversas</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar conversa..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-none rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {filteredConversations.map((chat) => (
                    <button
                        key={chat.id}
                        onClick={() => handleSelect(chat.id)}
                        className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800/50
                            ${activeId === chat.id ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''}
                        `}
                    >
                        <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-200 font-medium">
                            {chat.avatar ? (
                                <img src={chat.avatar} alt={chat.name} className="h-full w-full rounded-full object-cover" />
                            ) : (
                                chat.name.charAt(0)
                            )}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                            <div className="flex justify-between items-baseline mb-1">
                                <span className="font-semibold text-sm text-slate-800 dark:text-gray-200 truncate">{chat.name}</span>
                                <span className="text-xs text-gray-400 flex-shrink-0">{chat.time}</span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {chat.lastMessage}
                            </p>
                        </div>
                        {chat.unread > 0 && (
                            <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                                {chat.unread}
                            </span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    )
}
