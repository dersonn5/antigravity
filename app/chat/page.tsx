'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation' // Importação nova
import { Sidebar } from '@/components/Sidebar'
import ConversationList from '@/components/chat/ConversationList'
import ChatWindow from '@/components/chat/ChatWindow'
import { MessageSquare } from 'lucide-react'

export default function ChatPage() {
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
    const searchParams = useSearchParams()

    // Efeito Mágico: Se tiver ?id=... na URL, seleciona automaticamente
    useEffect(() => {
        const chatFromUrl = searchParams.get('id')
        if (chatFromUrl) {
            setSelectedChatId(chatFromUrl)
        }
    }, [searchParams])

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-black overflow-hidden">
            <Sidebar />
            <div className="flex flex-1 h-full">
                {/* Esquerda: Lista */}
                <div className={`h-full border-r border-gray-200 dark:border-gray-800 ${selectedChatId ? 'hidden md:block' : 'w-full md:w-80'}`}>
                    <ConversationList onSelectChat={setSelectedChatId} />
                </div>

                {/* Centro: Chat */}
                <main className={`flex-1 h-full bg-white dark:bg-gray-900 relative ${!selectedChatId ? 'hidden md:block' : ''}`}>
                    {selectedChatId ? (
                        <ChatWindow conversationId={selectedChatId} />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center bg-[#f0f2f5] dark:bg-gray-900">
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-full shadow-sm mb-4">
                                <MessageSquare size={48} className="text-emerald-500" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                Automax CORE Inbox
                            </h2>
                            <p className="max-w-md text-sm">
                                Selecione uma conversa ao lado para iniciar.
                            </p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}
