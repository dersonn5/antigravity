'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { updateLead } from '@/app/actions'

import { Lead } from '@/types'

interface EditLeadModalProps {
    lead: Lead | null
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export function EditLeadModal({ lead, isOpen, onClose, onSuccess }: EditLeadModalProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        whatsapp: '',
        city: '',
        origin: '',
        type: '',
        ages: '',
        status: ''
    })

    useEffect(() => {
        if (lead) {
            setFormData({
                name: lead.name || '',
                whatsapp: lead.telefone || lead.whatsapp_id || '',
                city: lead.cidade || '',
                origin: lead.origem || '',
                type: lead.tipo_contratacao || lead.tipo || '',
                ages: lead.idades || '',
                status: lead.status || 'novo'
            })
        }
    }, [lead])

    const handleSave = async () => {
        if (!lead) return

        try {
            setLoading(true)
            const result = await updateLead(lead.id, formData)

            if (result.success) {
                toast.success('Lead atualizado com sucesso!')
                onSuccess()
                onClose()
            } else {
                toast.error('Erro ao atualizar lead: ' + result.error)
            }
        } catch (error) {
            console.error('Error updating lead:', error)
            toast.error('Erro inesperado ao atualizar lead')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-slate-800 dark:text-white">
                        Editar Lead
                    </DialogTitle>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Nome Completo</Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Nome do cliente"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-whatsapp">WhatsApp / Telefone</Label>
                            <Input
                                id="edit-whatsapp"
                                value={formData.whatsapp}
                                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                                placeholder="11999999999"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-city">Cidade</Label>
                            <Input
                                id="edit-city"
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                placeholder="Cidade"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-ages">Idades</Label>
                            <Input
                                id="edit-ages"
                                value={formData.ages}
                                onChange={(e) => setFormData({ ...formData, ages: e.target.value })}
                                placeholder="Ex: 30, 45, 10"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Tipo de Contratação</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value) => setFormData({ ...formData, type: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PF">PF</SelectItem>
                                    <SelectItem value="PJ">PJ</SelectItem>
                                    <SelectItem value="MEI">MEI</SelectItem>
                                    <SelectItem value="ADESÃO">ADESÃO</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Origem</Label>
                            <Select
                                value={formData.origin}
                                onValueChange={(value) => setFormData({ ...formData, origin: value })}
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
                                    <SelectItem value="Google Orgânico">Google Orgânico</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* AI Feeling Section (Read Only) */}
                    {(lead?.feeling_ia || lead?.feeling) && (
                        <div className="rounded-lg bg-indigo-50 border border-indigo-100 p-4 dark:bg-indigo-900/20 dark:border-indigo-800">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400">psychology</span>
                                <h4 className="font-bold text-indigo-900 dark:text-indigo-300">Feeling da IA</h4>
                            </div>
                            <p className="text-sm text-indigo-800 dark:text-indigo-200 leading-relaxed">
                                {lead.feeling_ia || lead.feeling}
                            </p>
                        </div>
                    )}

                    {/* Traffic Intelligence Section */}
                    {lead?.tracking_info && (
                        <div className="mt-6 space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="h-px flex-1 bg-slate-200" />
                                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Inteligência de Tráfego 🚦
                                </span>
                                <div className="h-px flex-1 bg-slate-200" />
                            </div>

                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 grid grid-cols-2 gap-4 text-sm">

                                {/* Origem Principal */}
                                <div className="col-span-2">
                                    <label className="text-xs text-slate-500 font-semibold uppercase">Canal de Aquisição</label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${lead?.tracking_info?.source?.includes('google') ? 'bg-blue-100 text-blue-700' :
                                            lead?.tracking_info?.source?.includes('face') || lead?.tracking_info?.source?.includes('insta') ? 'bg-purple-100 text-purple-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                            {lead?.tracking_info?.source?.toUpperCase() || 'ORGÂNICO / DIRETO'}
                                        </span>
                                        <span className="text-slate-400 text-xs">
                                            via {lead?.tracking_info?.medium || 'site'}
                                        </span>
                                    </div>
                                </div>

                                {/* Campanha */}
                                <div>
                                    <label className="text-xs text-slate-500 font-semibold uppercase">Campanha</label>
                                    <p className="font-medium text-slate-900 truncate" title={lead?.tracking_info?.campaign}>
                                        {lead?.tracking_info?.campaign || '-'}
                                    </p>
                                </div>

                                {/* Termo Pesquisado */}
                                <div>
                                    <label className="text-xs text-slate-500 font-semibold uppercase">Termo Pesquisado</label>
                                    <p className="font-medium text-slate-900 truncate" title={lead?.tracking_info?.term}>
                                        {lead?.tracking_info?.term || '-'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Status Update */}
                    <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <Label className="font-bold text-base">Status do Lead</Label>
                        <Select
                            value={formData.status}
                            onValueChange={(value) => setFormData({ ...formData, status: value })}
                        >
                            <SelectTrigger className="w-full h-11">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="novo">Novo Lead</SelectItem>
                                <SelectItem value="em_atendimento">Em Negociação</SelectItem>
                                <SelectItem value="fechado">Fechado</SelectItem>
                                <SelectItem value="perdido">Perdido</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                    >
                        {loading ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
