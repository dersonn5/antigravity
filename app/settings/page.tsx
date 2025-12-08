'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/context/ThemeContext'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import { useSidebar } from '@/context/SidebarContext'
import { toast } from 'sonner'

export default function SettingsPage() {
    const {
        kanbanBackground, setKanbanBackground,
        pipelineColor, setPipelineColor,
        pipelineTexture, setPipelineTexture,
        cardTexture, setCardTexture
    } = useTheme()
    const { toggleSidebar } = useSidebar()

    const [loading, setLoading] = useState(false)
    const [fullName, setFullName] = useState('')
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        getProfile()
    }, [])

    async function getProfile() {
        try {
            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                setUser(user)
                const { data, error, status } = await supabase
                    .from('profiles')
                    .select(`full_name, avatar_url`)
                    .eq('id', user.id)
                    .single()

                if (error && status !== 406) {
                    throw error
                }

                if (data) {
                    setFullName(data.full_name || '')
                    setAvatarUrl(data.avatar_url)
                }
            }
        } catch (error) {
            console.error('Error loading user data!', error)
        } finally {
            setLoading(false)
        }
    }

    async function updateProfile() {
        try {
            setLoading(true)

            if (!fullName || !fullName.trim()) {
                toast.error('Por favor, preencha seu nome antes de salvar.')
                setLoading(false)
                return
            }

            const { error } = await supabase.from('profiles').upsert({
                id: user?.id as string,
                full_name: fullName.trim(),
                avatar_url: avatarUrl,
                updated_at: new Date().toISOString(),
            })

            if (error) throw error
            toast.success('Perfil atualizado com sucesso!')
            window.dispatchEvent(new Event('profile-updated'))
        } catch (error) {
            toast.error('Erro ao atualizar perfil!')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
        try {
            setUploading(true)

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.')
            }

            const file = event.target.files[0]
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random()}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file)

            if (uploadError) {
                throw uploadError
            }

            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
            setAvatarUrl(data.publicUrl)

            if (user) {
                await supabase.from('profiles').upsert({
                    id: user.id,
                    full_name: fullName,
                    avatar_url: data.publicUrl,
                    updated_at: new Date().toISOString(),
                })
                window.dispatchEvent(new Event('profile-updated'))
                toast.success('Foto de perfil atualizada!')
            }

        } catch (error) {
            toast.error('Erro ao fazer upload da foto!')
            console.error(error)
        } finally {
            setUploading(false)
        }
    }

    interface BackgroundOption {
        id: string
        name: string
        class: string
        preview: string
        image?: string
        style?: React.CSSProperties
    }

    const backgroundGroups: { title: string; options: BackgroundOption[] }[] = [
        {
            title: 'Temas Oficiais',
            options: [
                { id: 'clean', name: 'Clean', class: 'bg-slate-50', preview: 'bg-slate-50' },
                { id: 'executive', name: 'Executive', class: 'bg-slate-900', preview: 'bg-slate-900' },
                { id: 'jalves_brand', name: 'J.Alves Brand', class: 'bg-emerald-900', preview: 'bg-emerald-900' },
            ]
        },
        {
            title: 'Gradientes',
            options: [
                { id: 'sunset', name: 'Sunset', class: 'bg-gradient-to-br from-orange-500 to-pink-500', preview: 'bg-gradient-to-br from-orange-500 to-pink-500' },
                { id: 'ocean', name: 'Ocean', class: 'bg-gradient-to-br from-blue-500 to-cyan-500', preview: 'bg-gradient-to-br from-blue-500 to-cyan-500' },
                { id: 'forest', name: 'Forest', class: 'bg-gradient-to-br from-emerald-500 to-teal-700', preview: 'bg-gradient-to-br from-emerald-500 to-teal-700' },
                { id: 'purple', name: 'Purple', class: 'bg-gradient-to-br from-purple-600 to-indigo-900', preview: 'bg-gradient-to-br from-purple-600 to-indigo-900' },
            ]
        },
        {
            title: 'Paisagens',
            options: [
                { id: 'mountain', name: 'Montanha', class: 'bg-cover bg-center', preview: 'bg-cover bg-center', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=80' },
                { id: 'beach', name: 'Praia', class: 'bg-cover bg-center', preview: 'bg-cover bg-center', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80' },
                { id: 'city', name: 'Cidade', class: 'bg-cover bg-center', preview: 'bg-cover bg-center', image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1920&q=80' },
            ]
        },
        {
            title: 'Texturas',
            options: [
                { id: 'dots', name: 'Pontilhado', class: 'bg-slate-50', preview: 'bg-slate-50', style: { backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' } },
                { id: 'grid', name: 'Grid', class: 'bg-slate-50', preview: 'bg-slate-50', style: { backgroundImage: 'linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(to right, #e2e8f0 1px, transparent 1px)', backgroundSize: '20px 20px' } },
            ]
        }
    ]

    return (
        <>
            <header className="flex h-auto shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 px-6 py-3 sm:h-16">
                <div className="flex items-center gap-4">

                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Configurações</h2>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Profile Section */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="material-symbols-outlined text-2xl text-emerald-600">person</span>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Meu Perfil</h3>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-8 items-start">
                            {/* Avatar Upload */}
                            <div className="flex flex-col items-center gap-4">
                                <div className="relative group">
                                    <div
                                        className="size-32 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden border-4 border-white dark:border-slate-600 shadow-md bg-cover bg-center"
                                        style={{ backgroundImage: avatarUrl ? `url("${avatarUrl}")` : 'none' }}
                                    >
                                        {!avatarUrl && (
                                            <div className="flex h-full w-full items-center justify-center text-slate-400">
                                                <span className="material-symbols-outlined text-4xl">person</span>
                                            </div>
                                        )}
                                    </div>
                                    <label
                                        htmlFor="avatar-upload"
                                        className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full text-white font-medium"
                                    >
                                        {uploading ? 'Enviando...' : 'Alterar'}
                                    </label>
                                    <input
                                        id="avatar-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={uploadAvatar}
                                        disabled={uploading}
                                        className="hidden"
                                    />
                                </div>
                                <p className="text-xs text-slate-500">Clique para alterar a foto</p>
                            </div>

                            {/* Profile Form */}
                            <div className="flex-1 w-full space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="fullName">Nome de Exibição</Label>
                                    <input
                                        id="fullName"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
                                        placeholder="Seu nome completo"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <input
                                        id="email"
                                        value={user?.email || ''}
                                        disabled
                                        className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 cursor-not-allowed dark:border-slate-800 dark:bg-slate-900"
                                    />
                                </div>
                                <div className="pt-2">
                                    <button
                                        onClick={updateProfile}
                                        disabled={loading}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                                    >
                                        {loading ? 'Salvando...' : 'Salvar Alterações'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Appearance Section */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="material-symbols-outlined text-2xl text-emerald-600">palette</span>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Aparência</h3>
                        </div>

                        <div className="space-y-6">
                            <Label className="text-base font-semibold">Fundo do Kanban</Label>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Personalize o visual da sua área de trabalho.</p>

                            {backgroundGroups.map((group) => (
                                <div key={group.title} className="space-y-3">
                                    <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">{group.title}</h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {group.options.map((bg) => (
                                            <div
                                                key={bg.id}
                                                onClick={() => {
                                                    setKanbanBackground(bg.id)
                                                    toast.success('Tema alterado com sucesso!')
                                                }}
                                                className={`cursor-pointer group relative rounded-lg border-2 p-1 transition-all
                                                    ${kanbanBackground === bg.id
                                                        ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                                                        : 'border-transparent hover:border-slate-300 dark:hover:border-slate-600'
                                                    }`}
                                            >
                                                <div
                                                    className={`h-20 w-full rounded-md shadow-sm flex items-center justify-center overflow-hidden relative ${bg.preview}`}
                                                    style={{
                                                        backgroundImage: bg.image ? `url("${bg.image}")` : bg.style?.backgroundImage,
                                                        backgroundSize: bg.style?.backgroundSize
                                                    }}
                                                >
                                                    {kanbanBackground === bg.id && (
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[1px]">
                                                            <div className="bg-emerald-500 text-white rounded-full p-1 shadow-md">
                                                                <span className="material-symbols-outlined text-lg">check</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="mt-2 text-center text-xs font-medium text-slate-700 dark:text-slate-300">
                                                    {bg.name}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pipeline & Card Customization */}
                        <div className="space-y-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Personalização do Pipeline</h3>

                            {/* Pipeline Color */}
                            <div className="space-y-3">
                                <Label className="text-base font-semibold">Cor das Colunas</Label>
                                <div className="flex flex-wrap gap-3">
                                    {['#f1f5f9', '#e2e8f0', '#cbd5e1', '#d1fae5', '#dbeafe', '#fae8ff', '#fee2e2', '#ffedd5', '#1e293b', '#0f172a'].map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => setPipelineColor(color)}
                                            className={`size-10 rounded-full border-2 transition-all ${pipelineColor === color ? 'border-emerald-500 scale-110 ring-2 ring-emerald-500/20' : 'border-slate-200 dark:border-slate-700 hover:scale-105'}`}
                                            style={{ backgroundColor: color }}
                                            title={color}
                                        />
                                    ))}
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={pipelineColor}
                                            onChange={(e) => setPipelineColor(e.target.value)}
                                            className="h-10 w-10 rounded cursor-pointer border-0 p-0"
                                        />
                                        <span className="text-sm text-slate-500">Personalizado</span>
                                    </div>
                                </div>
                            </div>

                            {/* Textures */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <Label className="text-base font-semibold">Textura das Colunas</Label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { id: 'none', name: 'Nenhuma', style: {} },
                                            { id: 'dots', name: 'Pontos', style: { backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.2 } },
                                            { id: 'grid', name: 'Grid', style: { backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(to right, currentColor 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.2 } },
                                            { id: 'lines', name: 'Linhas', style: { backgroundImage: 'repeating-linear-gradient(45deg, currentColor 0, currentColor 1px, transparent 0, transparent 50%)', backgroundSize: '10px 10px', opacity: 0.1 } },
                                            { id: 'noise', name: 'Ruído', style: { backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22 opacity=%220.1%22/%3E%3C/svg%3E")', opacity: 0.4 } },
                                        ].map((texture) => (
                                            <div
                                                key={texture.id}
                                                onClick={() => setPipelineTexture(texture.id)}
                                                className={`cursor-pointer rounded-lg border-2 p-2 text-center transition-all ${pipelineTexture === texture.id ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-200 dark:border-slate-700'}`}
                                            >
                                                <div className="h-12 w-full rounded bg-slate-100 dark:bg-slate-800 mb-2 overflow-hidden relative text-slate-400">
                                                    <div className="absolute inset-0" style={texture.style} />
                                                </div>
                                                <span className="text-xs font-medium">{texture.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-base font-semibold">Textura dos Cards</Label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { id: 'none', name: 'Nenhuma', style: {} },
                                            { id: 'dots', name: 'Pontos', style: { backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '12px 12px', opacity: 0.1 } },
                                            { id: 'paper', name: 'Papel', style: { backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")', opacity: 0.5 } },
                                        ].map((texture) => (
                                            <div
                                                key={texture.id}
                                                onClick={() => setCardTexture(texture.id)}
                                                className={`cursor-pointer rounded-lg border-2 p-2 text-center transition-all ${cardTexture === texture.id ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-200 dark:border-slate-700'}`}
                                            >
                                                <div className="h-12 w-full rounded bg-white dark:bg-slate-800 mb-2 overflow-hidden relative text-slate-300 border border-slate-200 dark:border-slate-700">
                                                    <div className="absolute inset-0" style={texture.style} />
                                                </div>
                                                <span className="text-xs font-medium">{texture.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
}
