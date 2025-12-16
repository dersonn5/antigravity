'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/Sidebar'
import ConversationList from '@/components/chat/ConversationList'
import ChatWindow from '@/components/chat/ChatWindow'
import { MessageSquare } from 'lucide-react'

export default function ChatPage() {
    // Esse estado guarda QUAL cliente está selecionado no momento
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null)

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-black overflow-hidden">
            {/* 1. Menu Lateral (Preto) */}
            <Sidebar />

            {/* Área Principal do CRM de Mensagens */}
            <div className="flex flex-1 h-full">

                {/* 2. Coluna Esquerda: Lista de Conversas */}
                <div className="hidden md:block h-full">
                    <ConversationList onSelectChat={setSelectedChatId} />
                </div>

                {/* 3. Coluna Central: A Janela de Chat */}
                <main className="flex-1 h-full bg-white dark:bg-gray-900 relative border-l border-gray-200 dark:border-gray-800">

                    {selectedChatId ? (
                        // Se tiver um chat selecionado, mostra a janela
                        <ChatWindow conversationId={selectedChatId} />
                    ) : (
                        // Se não tiver nenhum selecionado, mostra tela de "Bem-vindo"
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center bg-[#f0f2f5] dark:bg-gray-900">
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-full shadow-sm mb-4">
                                <MessageSquare size={48} className="text-emerald-500" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                Automax CORE Inbox
                            </h2>
                            <p className="max-w-md text-sm">
                                Selecione uma conversa ao lado para começar o atendimento, ou aguarde novos leads entrarem via WhatsApp.
                            </p>
                            <div className="mt-8 flex gap-2 text-xs text-gray-400">
                                <span className="flex items-center gap-1">🔒 Criptografado</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">⚡ Tempo Real</span>
                            </div>
                        </div>
                    )}
                </main>

                {/* 4. Coluna Direita: Detalhes do Lead (Futuro) */}
                {/* Vamos adicionar essa coluna depois que o chat estiver rodando liso */}

            </div>
        </div>
    )
}
