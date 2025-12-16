'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { updateLeadStatus } from './actions'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MessageCircle } from 'lucide-react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import confetti from 'canvas-confetti'
import { toast } from 'sonner'
import { useTheme } from '@/context/ThemeContext'
import { NotificationsMenu } from '@/components/NotificationsMenu'
import { useSidebar } from '@/context/SidebarContext'
import { EditLeadModal } from '@/components/EditLeadModal'

import { Lead } from '@/types'

const MOTIVATIONAL_PHRASES = [
  'Você é uma máquina de vendas! 🚀',
  'O ranking que se cuide, você está subindo! 📈',
  'Boa! Mais uma comissão garantida. 💸',
  'Imparável! Quem é o próximo? 🔥',
  'A meta é o limite? Não para você! 🌟',
  'Venda fechada, cliente feliz! 🤝'
]

export default function KanbanBoard() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)


  // New Lead State
  const [isNewLeadDialogOpen, setIsNewLeadDialogOpen] = useState(false)
  const [creatingLead, setCreatingLead] = useState(false)
  const [newLeadData, setNewLeadData] = useState({
    name: '',
    whatsapp: '',
    city: '',
    type: '',
    origin: '',
    ages: ''
  })



  // UI States
  const { theme, toggleTheme, kanbanBackground, pipelineColor, pipelineTexture, cardTexture } = useTheme()
  const { toggleSidebar } = useSidebar()
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  const handleQuickChat = async (leadId: string) => {
    try {
      // 1. Check if conversation exists
      const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .eq('lead_id', leadId)
        .single()

      if (existing) {
        router.push(`/chat?id=${existing.id}`)
        return
      }

      // 2. Create if not exists
      const { data: newChat, error } = await supabase
        .from('conversations')
        .insert({ lead_id: leadId, status: 'open', platform: 'whatsapp' })
        .select()
        .single()

      if (newChat) {
        router.push(`/chat?id=${newChat.id}`)
      }
    } catch (err) {
      console.error('Error opening chat:', err)
    }
  }

  const columns = [
    {
      id: 'novo',
      title: 'Novos Leads',
      countColor: 'bg-blue-500',
      dotColor: 'bg-green-500',
      filter: (status: string | null) => status === 'novo' || status === null
    },
    {
      id: 'em_atendimento',
      title: 'Em Negociação',
      countColor: 'bg-yellow-500',
      dotColor: 'bg-yellow-500',
      filter: (status: string | null) => status === 'em_atendimento'
    },
    {
      id: 'fechado',
      title: 'Fechados',
      countColor: 'bg-green-500',
      dotColor: 'bg-green-500',
      filter: (status: string | null) => status === 'fechado'
    },
  ]

  // SLA / Urgency Logic
  const getUrgencyStatus = (createdAt?: string) => {
    if (!createdAt) return null

    const created = new Date(createdAt).getTime()
    const now = Date.now()
    const diffMinutes = (now - created) / (1000 * 60)

    if (diffMinutes < 15) {
      return { color: 'text-emerald-500', label: 'Recente', icon: 'schedule' }
    } else if (diffMinutes < 60) {
      return { color: 'text-yellow-500', label: 'Atenção', icon: 'schedule' }
    } else {
      return { color: 'text-red-500 animate-pulse', label: 'Atrasado', icon: 'alarm' }
    }
  }

  const playNotificationSound = () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3')
    audio.play().catch(() => {
      // Silent error - user hasn't interacted yet
    })
  }

  useEffect(() => {
    fetchLeads()
    checkUser()

    // Realtime Subscription
    const channel = supabase
      .channel('realtime-leads')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'jalves_leads'
        },
        (payload) => {
          const newLead = payload.new as Lead

          // Add to state immediately
          setLeads((currentLeads) => {
            // Avoid duplicates just in case
            if (currentLeads.some(l => l.id === newLead.id)) return currentLeads
            return [{ ...newLead, status: 'novo' }, ...currentLeads]
          })

          // Play Sound
          playNotificationSound()



          // Show Toast
          toast('🔔 Novo Lead na Mesa!', {
            description: `${newLead.name} chegou.`,
            duration: 5000,
            className: 'bg-white dark:bg-slate-800 border-emerald-500 border-l-4'
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const [userProfile, setUserProfile] = useState<{ id: string, full_name: string | null } | null>(null)

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

      if (data) {
        setUserProfile({ id: user.id, full_name: data.full_name })
      }
    }
  }

  async function fetchLeads() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('view_sales_os')
        .select('*, tracking_info', { count: 'exact' })

      if (error) {
        console.error('Error fetching leads:', error)
        return
      }

      if (data) {
        setLeads(data as Lead[])
      }
    } catch (error) {
      console.error('Unexpected error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditClick = (lead: Lead) => {
    setSelectedLead(lead)
  }

  const triggerCelebration = () => {
    // Confetti explosion
    const duration = 3000
    const end = Date.now() + duration

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#10b981', '#3b82f6', '#f59e0b']
      })
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#10b981', '#3b82f6', '#f59e0b']
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }
    frame()

    // Big center burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#fcd34d']
    })

    // Motivational Toast
    const phrase = MOTIVATIONAL_PHRASES[Math.floor(Math.random() * MOTIVATIONAL_PHRASES.length)]
    toast.success('VENDA REALIZADA! 🏆', {
      description: phrase,
      duration: 5000,
      className: 'bg-white dark:bg-slate-800 border-emerald-500 border-l-4'
    })
  }



  const handleCreateLead = async () => {
    if (!newLeadData.name || !newLeadData.whatsapp) {
      toast.error('Nome e WhatsApp são obrigatórios')
      return
    }

    try {
      setCreatingLead(true)
      // Dynamically import the action to avoid build issues if it's not fully ready
      const { createLead } = await import('./actions')
      const result = await createLead({
        ...newLeadData,
        vendor: userProfile?.full_name || 'Sem Dono',
        closer_id: userProfile?.id
      })

      if (result.success) {
        setIsNewLeadDialogOpen(false)
        setNewLeadData({ name: '', whatsapp: '', city: '', type: '', origin: '', ages: '' })
        fetchLeads() // Refresh list
        toast.success('Lead criado com sucesso!')
      } else {
        toast.error('Erro ao criar lead: ' + result.error)
      }
    } catch (error) {
      console.error('Error creating lead:', error)
      toast.error('Erro ao criar lead')
    } finally {
      setCreatingLead(false)
    }
  }

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination) return

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    const newStatus = destination.droppableId
    const leadId = draggableId

    // Optimistic Update
    const updatedLeads = leads.map(lead => {
      if (lead.id.toString() === leadId) {
        return { ...lead, status: newStatus }
      }
      return lead
    })

    setLeads(updatedLeads)

    if (newStatus === 'fechado') {
      triggerCelebration()
    }

    // Backend Update
    try {
      const lead = leads.find(l => l.id.toString() === leadId)

      // Rule: If moving to 'fechado', the current user becomes the closer.
      // Otherwise, claim ownership if unassigned.
      const closerData = lead && (newStatus === 'fechado' || !lead.vendedor || lead.vendedor === 'Sem Dono') && userProfile
        ? { closer_id: userProfile.id, closer_designado: userProfile.full_name || 'Vendedor' }
        : undefined

      await updateLeadStatus(leadId, newStatus, closerData)
    } catch (error) {
      console.error('Error updating lead status via drag and drop:', error)
      toast.error('Erro ao salvar alteração')
      // Revert on error (optional, but good practice)
      fetchLeads()
    }
  }

  // Filter leads by search query
  const filteredLeads = leads.filter(lead => {
    const query = searchQuery.toLowerCase().trim()
    if (!query) return true

    return (
      lead.name.toLowerCase().includes(query) ||
      (lead.cidade && lead.cidade.toLowerCase().includes(query))
    )
  })

  const getOriginColorClass = (origin: string) => {
    const lower = origin?.toLowerCase() || ''
    if (lower.includes('google')) return 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300'
    if (lower.includes('indicação') || lower.includes('indicacao')) return 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-300'
    if (lower.includes('anúncio') || lower.includes('anuncio') || lower.includes('facebook') || lower.includes('instagram')) return 'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-300'
    return 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
  }

  const getBackgroundStyle = () => {
    switch (kanbanBackground) {
      case 'executive':
        return { className: 'bg-slate-900' }
      case 'jalves_brand':
        return { className: 'bg-emerald-900' }
      case 'sunset':
        return { className: 'bg-gradient-to-br from-orange-500 to-pink-500' }
      case 'ocean':
        return { className: 'bg-gradient-to-br from-blue-500 to-cyan-500' }
      case 'forest':
        return { className: 'bg-gradient-to-br from-emerald-500 to-teal-700' }
      case 'purple':
        return { className: 'bg-gradient-to-br from-purple-600 to-indigo-900' }
      case 'mountain':
        return {
          className: 'bg-cover bg-center bg-no-repeat bg-fixed',
          style: { backgroundImage: 'url("https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=80")' }
        }
      case 'beach':
        return {
          className: 'bg-cover bg-center bg-no-repeat bg-fixed',
          style: { backgroundImage: 'url("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80")' }
        }
      case 'city':
        return {
          className: 'bg-cover bg-center bg-no-repeat bg-fixed',
          style: { backgroundImage: 'url("https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1920&q=80")' }
        }
      case 'dots':
        return {
          className: 'bg-slate-50',
          style: { backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }
        }
      case 'grid':
        return {
          className: 'bg-slate-50',
          style: { backgroundImage: 'linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(to right, #e2e8f0 1px, transparent 1px)', backgroundSize: '20px 20px' }
        }
      case 'clean':
      default:
        return { className: 'bg-slate-50 dark:bg-slate-900' }
    }
  }

  const background = getBackgroundStyle()

  // Helper to determine text color based on background luminance
  const getContrastColor = (hexColor: string) => {
    const r = parseInt(hexColor.substr(1, 2), 16)
    const g = parseInt(hexColor.substr(3, 2), 16)
    const b = parseInt(hexColor.substr(5, 2), 16)
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000
    return yiq >= 128 ? '#1e293b' : '#f8fafc' // slate-800 : slate-50
  }

  const getTextureStyle = (textureId: string, color: string) => {
    const isDark = getContrastColor(color) === '#f8fafc'
    const opacity = isDark ? 0.1 : 0.05
    const stroke = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'

    switch (textureId) {
      case 'dots': return { backgroundImage: `radial-gradient(${stroke} 1px, transparent 1px)`, backgroundSize: '20px 20px' }
      case 'grid': return { backgroundImage: `linear-gradient(${stroke} 1px, transparent 1px), linear-gradient(to right, ${stroke} 1px, transparent 1px)`, backgroundSize: '20px 20px' }
      case 'lines': return { backgroundImage: `repeating-linear-gradient(45deg, ${stroke} 0, ${stroke} 1px, transparent 0, transparent 50%)`, backgroundSize: '10px 10px' }
      case 'noise': return { backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22 opacity=%220.4%22/%3E%3C/svg%3E")' }
      default: return {}
    }
  }

  const columnTextColor = getContrastColor(pipelineColor)

  return (
    <>
      <header className="flex h-auto shrink-0 flex-wrap items-center justify-between gap-y-4 whitespace-nowrap border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 px-6 py-3 sm:h-16 sm:flex-nowrap sm:py-0">
        <div className="flex w-full items-center gap-4 sm:w-auto">

          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Dashboard</h2>
        </div>
        <div className="flex w-full flex-col items-stretch gap-4 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
          <div className="relative w-full sm:max-w-xs">
            <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400">search</span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input w-full rounded-lg border-slate-200 bg-slate-100 pl-10 text-sm placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:placeholder:text-slate-400"
              placeholder="Buscar cliente..."
              type="search"
            />
          </div>
          <button
            onClick={() => setIsNewLeadDialogOpen(true)}
            className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 cursor-pointer transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Novo Lead
          </button>
          <div className="hidden items-center gap-4 sm:flex">
            <button
              onClick={toggleTheme}
              className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-500 transition-colors"
              title={theme === 'dark' ? 'Mudar para Claro' : 'Mudar para Escuro'}
            >
              <span className="material-symbols-outlined text-xl">
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
            <NotificationsMenu />
          </div>
        </div>
      </header>

      <main
        className={`flex-1 overflow-y-auto py-6 px-4 transition-all duration-500 ${background.className}`}
        style={background.style}
      >
        {/* KPI Card */}
        <div className="mb-6">
          <div className="inline-block rounded-lg bg-white dark:bg-slate-800 px-4 py-2 shadow">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Leads Ativos</h3>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{leads.length}</p>
          </div>
        </div>

        {/* Kanban Board */}
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {columns.map((column) => {
              const columnLeads = filteredLeads.filter(lead => column.filter(lead.status))

              return (
                <div
                  key={column.id}
                  className="flex h-full flex-col overflow-hidden rounded-xl transition-colors duration-300 shadow-sm border border-black/5"
                  style={{
                    backgroundColor: pipelineColor,
                    ...getTextureStyle(pipelineTexture, pipelineColor)
                  }}
                >
                  <div className="flex shrink-0 items-center justify-between px-6 py-4 border-b border-black/5 bg-black/5 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold" style={{ color: columnTextColor }}>{column.title}</h3>
                      <span className={`flex items-center justify-center rounded-full ${column.countColor} px-2 py-0.5 text-xs font-semibold text-white`}>
                        {columnLeads.length}
                      </span>
                    </div>
                    <button
                      onClick={() => setIsNewLeadDialogOpen(true)}
                      className="hover:scale-110 transition-transform"
                      style={{ color: columnTextColor, opacity: 0.7 }}
                    >
                      <span className="material-symbols-outlined">add</span>
                    </button>
                  </div>

                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex flex-1 flex-col gap-4 overflow-y-auto p-4 transition-colors ${snapshot.isDraggingOver ? 'bg-slate-200/50 dark:bg-slate-700/50' : ''}`}
                      >
                        {columnLeads.map((lead, index) => (
                          <Draggable key={lead.id} draggableId={lead.id.toString()} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => handleEditClick(lead)}
                                style={{
                                  ...provided.draggableProps.style,
                                  opacity: snapshot.isDragging ? 0.8 : 1,
                                  ...(cardTexture === 'dots' ? { backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '12px 12px' } :
                                    cardTexture === 'paper' ? { backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")' } : {})
                                }}
                                className={`group relative rounded-xl bg-card p-5 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer border border-border/50 ${snapshot.isDragging ? 'rotate-2 shadow-2xl ring-2 ring-primary ring-opacity-50 scale-105' : ''} hover:-translate-y-1`}
                              >
                                {/* Status Indicator Strip */}
                                <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl ${column.dotColor.replace('bg-', 'bg-')}`} />

                                {/* Source Badge */}
                                <div className="absolute top-4 right-4 flex gap-1 z-10">
                                  {lead.tracking_info?.source?.toLowerCase().includes('google') && (
                                    <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-md border border-blue-100 shadow-sm" title="Google Ads">Google</span>
                                  )}
                                  {(lead.tracking_info?.source?.toLowerCase().includes('insta') || lead.tracking_info?.source?.toLowerCase().includes('face')) && (
                                    <span className="bg-purple-50 text-purple-700 text-[10px] font-bold px-2 py-1 rounded-md border border-purple-100 shadow-sm" title="Meta Ads">Meta</span>
                                  )}
                                </div>

                                <div className="flex items-start justify-between pl-2">
                                  <div className="flex flex-col gap-3 w-full">
                                    <div className="flex items-center gap-2 flex-1">
                                      <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                                        {lead.name.charAt(0).toUpperCase()}
                                      </div>
                                      <p className="font-bold text-foreground text-base line-clamp-1">{lead.name}</p>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleQuickChat(lead.id.toString())
                                        }}
                                        className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 hover:bg-emerald-200 hover:scale-110 transition-all shadow-sm ml-auto z-50"
                                        title="Chat"
                                      >
                                        <MessageCircle size={14} />
                                      </button>
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-[14px]">location_on</span>
                                        {lead.cidade || 'Não informada'} {lead.tipo ? `• ${lead.tipo}` : ''}
                                      </p>

                                      {/* Display Ages in Card */}
                                      {lead.idades && (
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 p-1.5 rounded-md w-fit">
                                          <span className="material-symbols-outlined text-[14px]">group</span>
                                          <span>{lead.idades}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="mt-4 flex items-center justify-between pl-2 border-t border-border/50 pt-3">
                                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${getOriginColorClass(lead.origem)}`}>
                                    {lead.origem || 'Desconhecido'}
                                  </span>

                                  <div className="flex items-center gap-2">
                                    {/* SLA Clock - Only for 'novo' status */}
                                    {lead.status === 'novo' && lead.created_at && (
                                      (() => {
                                        const urgency = getUrgencyStatus(lead.created_at)
                                        if (!urgency) return null
                                        return (
                                          <div className={`flex items-center gap-1 text-xs font-bold ${urgency.color} bg-white dark:bg-slate-950 px-2 py-1 rounded-full shadow-sm border border-slate-100 dark:border-slate-800`} title={`Criado em: ${new Date(lead.created_at).toLocaleString()}`}>
                                            <span className="material-symbols-outlined text-[14px]">{urgency.icon}</span>
                                            <span>{urgency.label}</span>
                                          </div>
                                        )
                                      })()
                                    )}

                                    {lead.whatsapp_id && (
                                      <a
                                        href={`https://wa.me/${lead.whatsapp_id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 hover:bg-emerald-200 hover:scale-110 transition-all shadow-sm"
                                        title="Chamar no WhatsApp"
                                      >
                                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                          <path d="M19.95 21c-3.23 0-6.3-1.28-8.57-3.54S7.84 13.23 7.84 10V4.5A2.5 2.5 0 0 1 10.34 2h3.32a2.5 2.5 0 0 1 2.5 2.5v14a2.5 2.5 0 0 1-2.5 2.5h-3.66m.05-2h3.61a.5.5 0 0 0 .5-.5V4.5a.5.5 0 0 0-.5-.5h-3.32a.5.5 0 0 0-.5.5V10c0 2.71 1.05 5.2 2.93 7.07.05.05.1.1.15.15A5.8 5.8 0 0 1 14 18.5a.5.5 0 0 0-.5.5v1.5a.5.5 0 0 0 .5.5M4 21c-1.39 0-2.5-1.4-2.5-3.13V6.13C1.5 4.4 2.61 3 4 3s2.5 1.4 2.5 3.13v11.74C6.5 19.6 5.39 21 4 21m0-2c.41 0 .5-.55.5-.88V6.13c0-.33-.09-.88-.5-.88s-.5.55-.5.88v11.74c0 .33.09.88.5.88z"></path>
                                        </svg>
                                      </a>
                                    )}

                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        <div className="mt-auto pt-4">
                          <button
                            onClick={() => setIsNewLeadDialogOpen(true)}
                            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer transition-all active:scale-95"
                          >
                            <span className="material-symbols-outlined text-base">add</span>
                            Adicionar Lead
                          </button>
                        </div>
                      </div>
                    )}
                  </Droppable>
                </div>
              )
            })}
          </div>
        </DragDropContext>
      </main>

      {/* Edit Dialog */}
      <EditLeadModal
        lead={selectedLead}
        isOpen={!!selectedLead}
        onClose={() => setSelectedLead(null)}
        onSuccess={() => {
          fetchLeads()
          // If status was changed to 'fechado', we could trigger celebration here if we passed the new status back.
          // For now, we just refresh.
        }}
      />

      {/* New Lead Dialog */}
      < Dialog open={isNewLeadDialogOpen} onOpenChange={setIsNewLeadDialogOpen} >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-800 dark:text-white">Novo Lead</DialogTitle>
            <p className="text-sm text-slate-500">Preencha os dados para cadastrar um novo cliente.</p>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <input
                id="name"
                value={newLeadData.name}
                onChange={(e) => setNewLeadData({ ...newLeadData, name: e.target.value })}
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
                placeholder="Ex: João da Silva"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="whatsapp">WhatsApp *</Label>
              <input
                id="whatsapp"
                value={newLeadData.whatsapp}
                onChange={(e) => setNewLeadData({ ...newLeadData, whatsapp: e.target.value })}
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
                placeholder="Ex: 11999999999"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="city">Cidade</Label>
              <input
                id="city"
                value={newLeadData.city}
                onChange={(e) => setNewLeadData({ ...newLeadData, city: e.target.value })}
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
                placeholder="Ex: São Paulo"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ages">Idades</Label>
              <input
                id="ages"
                value={newLeadData.ages}
                onChange={(e) => setNewLeadData({ ...newLeadData, ages: e.target.value })}
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
                placeholder="Ex: 30, 45 e 10"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Tipo</Label>
                <Select
                  value={newLeadData.type}
                  onValueChange={(value) => setNewLeadData({ ...newLeadData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PF">PF</SelectItem>
                    <SelectItem value="PJ">PJ</SelectItem>
                    <SelectItem value="MEI">MEI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Origem</Label>
                <Select
                  value={newLeadData.origin}
                  onValueChange={(value) => setNewLeadData({ ...newLeadData, origin: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Indicação">Indicação</SelectItem>
                    <SelectItem value="Anúncios MetaAds">Anúncios MetaAds</SelectItem>
                    <SelectItem value="Anúncios GoogleAds">Anúncios GoogleAds</SelectItem>
                    <SelectItem value="Balcão">Balcão</SelectItem>
                    <SelectItem value="Telefone">Telefone</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewLeadDialogOpen(false)} disabled={creatingLead}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreateLead}
              disabled={creatingLead}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            >
              {creatingLead ? 'Salvando...' : 'Salvar Lead'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog >
    </>
  )
}
