'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Send, Paperclip, Lock } from 'lucide-react'

interface Message {
    id: string
    content: string
    direction: 'inbound' | 'outbound'
    is_internal: boolean
    created_at: string
}

interface ChatWindowProps {
    conversationId: string
}

export default function ChatWindow({ conversationId }: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [isInternal, setIsInternal] = useState(false)

    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!conversationId) return

        const fetchMessages = async () => {
            // ATENÇÃO: Buscando da tabela 'messages' nova, não da 'team_chat_messages'
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: true })

            if (data) setMessages(data as any)
            if (error) console.error('Erro ao buscar msgs:', error)
        }

        fetchMessages()

        const channel = supabase
            .channel(`chat:${conversationId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `conversation_id=eq.${conversationId}`
            }, (payload) => {
                setMessages((current) => [...current, payload.new as any])
            })
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [conversationId])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim()) return

        const content = newMessage
        setNewMessage('')

        try {
            // 1. Salva a mensagem
            await supabase.from('messages').insert([
                {
                    conversation_id: conversationId,
                    content: content,
                    direction: 'outbound',
                    is_internal: isInternal, // Salva se é nota interna ou pública
                    platform: 'whatsapp',
                    status: 'sent'
                }
            ])

            // 2. Atualiza a conversa para subir pro topo da lista
            await supabase.from('conversations').update({
                last_message_content: isInternal ? 'Nota interna da equipe' : content,
                last_message_at: new Date().toISOString()
            }).eq('id', conversationId)

        } catch (error) {
            console.error('Erro ao enviar:', error)
            alert('Erro ao enviar mensagem')
        }
    }

    return (
        <div className="flex flex-col h-full bg-[#EFE7DD] dark:bg-gray-900/50 relative">
            <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')]"></div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 z-10">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] rounded-lg p-3 shadow-sm relative ${msg.is_internal
                            ? 'bg-yellow-100 border border-yellow-300 text-gray-800'
                            : msg.direction === 'outbound'
                                ? 'bg-[#d9fdd3] dark:bg-emerald-900 text-gray-900 dark:text-gray-100'
                                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                            }`}>
                            {msg.is_internal && (
                                <div className="flex items-center gap-1 text-xs text-yellow-600 font-bold mb-1 uppercase">
                                    <Lock size={10} /> Nota Interna
                                </div>
                            )}
                            <p className="text-sm leading-relaxed">{msg.content}</p>
                            <span className="text-[10px] text-gray-500 block text-right mt-1 opacity-70">
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 p-3 border-t border-gray-200 dark:border-gray-800 z-20">
                <div className="flex items-center gap-2 mb-2 px-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-500 hover:text-gray-800">
                        <input
                            type="checkbox"
                            checked={isInternal}
                            onChange={(e) => setIsInternal(e.target.checked)}
                            className="rounded text-yellow-500 focus:ring-yellow-500"
                        />
                        <span className={isInternal ? "text-yellow-600 font-bold" : ""}>
                            {isInternal ? "🔒 Modo Nota Interna (Cliente não vê)" : "💬 Chat Público"}
                        </span>
                    </label>
                </div>

                <form onSubmit={handleSend} className="flex gap-2 items-end">
                    <button type="button" className="p-2 text-gray-500 hover:text-gray-700">
                        <Paperclip size={20} />
                    </button>

                    <div className={`flex-1 rounded-lg border flex items-center bg-white dark:bg-gray-800 ${isInternal ? 'border-yellow-400 ring-1 ring-yellow-400' : 'border-gray-300'}`}>
                        <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={isInternal ? "Escrever nota interna..." : "Digite uma mensagem..."}
                            className="w-full p-2 bg-transparent border-none focus:ring-0 resize-none max-h-32 text-sm"
                            rows={1}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend(e);
                                }
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className={`p-3 rounded-full text-white shadow-sm transition-all ${isInternal ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-emerald-600 hover:bg-emerald-700'
                            }`}
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    )
}