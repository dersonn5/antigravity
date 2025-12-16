'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/context/ThemeContext'
import { NotificationsMenu } from '@/components/NotificationsMenu'
import { toast } from 'sonner'
import { useSidebar } from '@/context/SidebarContext'

interface Message {
    id: number
    content: string
    sender_name: string
    user_id: string
    created_at: string
    avatar_url?: string
}

interface ChatWindowProps {
    conversationId: string;
}

export default function ChatWindow({ conversationId }: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const [currentUser, setCurrentUser] = useState<any>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const { theme } = useTheme()
    const { toggleSidebar } = useSidebar()

    const [userProfile, setUserProfile] = useState<{ full_name: string | null, avatar_url: string | null } | null>(null)

    useEffect(() => {
        setMessages([]) // Clear messages on change
        setLoading(true)
        checkUser()
        fetchMessages()
        subscribeToMessages()
    }, [conversationId])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        setCurrentUser(user)

        if (user) {
            const { data, error } = await supabase
                .from('profiles')
                .select('full_name, avatar_url')
                .eq('id', user.id)
                .single()

            console.log('Profile data:', data)
            console.log('Profile error:', error)

            if (data) {
                setUserProfile(data)
            } else {
                console.warn('No profile found for user:', user.id)
            }
        }
    }

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const fetchMessages = async () => {
        try {
            // Note: In a real app we would filter by conversationId here
            // For now keeping original logic
            const { data, error } = await supabase
                .from('team_chat_messages')
                .select('*')
                .order('created_at', { ascending: true })
                .limit(50)

            if (error) throw error

            if (data) {
                setMessages(data)
            }
        } catch (error) {
            console.error('Error fetching messages:', error)
            toast.error('Erro ao carregar mensagens')
        } finally {
            setLoading(false)
        }
    }

    const subscribeToMessages = () => {
        const subscription = supabase
            .channel('team_chat_channel')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'team_chat_messages',
                },
                (payload) => {
                    const newMessage = payload.new as Message
                    setMessages((prev) => [...prev, newMessage])
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(subscription)
        }
    }

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim()) return

        if (!currentUser) {
            toast.error('Você precisa estar logado para enviar mensagens.')
            return
        }

        console.log('Current userProfile:', userProfile)
        console.log('Sending message with:', {
            sender_name: userProfile?.full_name || currentUser.email?.split('@')[0] || 'Eu',
            avatar_url: userProfile?.avatar_url
        })

        const tempId = Date.now()
        const tempMessage: Message = {
            id: tempId,
            content: newMessage,
            sender_name: userProfile?.full_name || currentUser.email?.split('@')[0] || 'Eu',
            user_id: currentUser.id,
            created_at: new Date().toISOString(),
            avatar_url: userProfile?.avatar_url || undefined
        }

        try {
            // Optimistic Update
            setMessages(prev => [...prev, tempMessage])
            setNewMessage('')

            const { error } = await supabase
                .from('team_chat_messages')
                .insert({
                    content: tempMessage.content,
                    sender_name: tempMessage.sender_name,
                    user_id: tempMessage.user_id,
                    avatar_url: tempMessage.avatar_url
                })

            if (error) throw error

            // Fallback: Fetch to ensure sync (in case Realtime fails)
            // We wait a bit to let the DB process
            setTimeout(() => {
                fetchMessages()
            }, 500)

        } catch (error: any) {
            console.error('Error sending message:', error)
            toast.error('Erro ao enviar mensagem: ' + (error.message || 'Erro desconhecido'))
            // Rollback optimistic update on error
            setMessages(prev => prev.filter(msg => msg.id !== tempId))
        }
    }

    return (
        <div className="flex flex-col h-full bg-[#e5ddd5] dark:bg-[#0b141a]">
            <header className="flex h-auto shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 px-6 py-3 sm:h-16">
                <div className="flex items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Chat {conversationId}</h2>
                        {currentUser && (
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Logado como: {userProfile?.full_name || currentUser.email}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={fetchMessages}
                        className="p-2 text-slate-500 hover:text-emerald-600 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Atualizar mensagens"
                    >
                        <span className="material-symbols-outlined">refresh</span>
                    </button>
                    <NotificationsMenu />
                </div>
            </header>

            <main className="flex-1 flex flex-col overflow-hidden relative">
                {/* Chat Background Pattern (Optional) */}
                <div className="absolute inset-0 opacity-10 dark:opacity-5 pointer-events-none bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')]"></div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 z-10">
                    {loading ? (
                        <div className="flex justify-center mt-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="text-center mt-10 opacity-50">
                            <p className="bg-white/80 dark:bg-slate-800/80 inline-block px-4 py-2 rounded-lg text-sm shadow-sm">
                                Nenhuma mensagem ainda. Comece a conversa! 👋
                            </p>
                        </div>
                    ) : (
                        messages.map((msg) => {
                            const isMe = currentUser && msg.user_id === currentUser.id
                            return (
                                <div
                                    key={msg.id}
                                    className={`flex gap-2 items-end ${isMe ? 'justify-end' : 'justify-start'}`}
                                >
                                    {/* Avatar for other users (left side) */}
                                    {!isMe && (
                                        <div
                                            className="size-8 rounded-full bg-slate-300 dark:bg-slate-600 flex-shrink-0 overflow-hidden bg-cover bg-center"
                                            style={{ backgroundImage: msg.avatar_url ? `url("${msg.avatar_url}")` : 'none' }}
                                        >
                                            {!msg.avatar_url && (
                                                <div className="flex h-full w-full items-center justify-center text-xs font-bold text-white">
                                                    {msg.sender_name?.charAt(0).toUpperCase() || '?'}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div
                                        className={`max-w-[80%] md:max-w-[60%] rounded-lg px-4 py-2 shadow-sm relative
                                            ${isMe
                                                ? 'bg-[#d9fdd3] dark:bg-[#005c4b] text-slate-900 dark:text-slate-100 rounded-tr-none'
                                                : 'bg-white dark:bg-[#202c33] text-slate-900 dark:text-slate-100 rounded-tl-none'
                                            }`}
                                    >
                                        {/* Show sender name for all messages */}
                                        <p className={`text-xs font-bold mb-1 ${isMe ? 'text-emerald-700 dark:text-emerald-300' : 'text-orange-600 dark:text-orange-400'}`}>
                                            {msg.sender_name || 'Usuário'}
                                        </p>
                                        <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                                        <p className={`text-[10px] text-right mt-1 ${isMe ? 'text-slate-500 dark:text-emerald-100/70' : 'text-slate-400'}`}>
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>

                                    {/* Avatar for current user (right side) */}
                                    {isMe && (
                                        <div
                                            className="size-8 rounded-full bg-emerald-200 dark:bg-emerald-700 flex-shrink-0 overflow-hidden bg-cover bg-center"
                                            style={{ backgroundImage: msg.avatar_url ? `url("${msg.avatar_url}")` : 'none' }}
                                        >
                                            {!msg.avatar_url && (
                                                <div className="flex h-full w-full items-center justify-center text-xs font-bold text-white">
                                                    {msg.sender_name?.charAt(0).toUpperCase() || 'E'}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-[#f0f2f5] dark:bg-[#202c33] z-20">
                    <form onSubmit={handleSendMessage} className="flex gap-2 max-w-4xl mx-auto">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Digite uma mensagem..."
                            className="flex-1 rounded-lg border-none bg-white dark:bg-[#2a3942] px-4 py-3 text-sm focus:ring-1 focus:ring-emerald-500 dark:text-white placeholder:text-slate-400 shadow-sm"
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full p-3 shadow-sm transition-colors flex items-center justify-center"
                        >
                            <span className="material-symbols-outlined">send</span>
                        </button>
                    </form>
                </div>
            </main>
        </div>
    )
}