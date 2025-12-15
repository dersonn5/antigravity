'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { toast } from 'sonner'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                toast.error('Erro ao fazer login', {
                    description: error.message,
                })
            } else {
                toast.success('Login realizado com sucesso!')
                router.push('/')
                router.refresh()
            }
        } catch (error) {
            console.error('Login error:', error)
            toast.error('Erro inesperado')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen w-full">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex w-1/2 bg-emerald-900 flex-col justify-center items-center p-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
                <div className="relative z-10 text-center space-y-6">
                    <div className="flex justify-center mb-8">
                        <img src="/logo-white.png" alt="CORE" className="h-24 object-contain" />
                    </div>
                    <p className="text-emerald-100 text-lg max-w-md mx-auto leading-relaxed">
                        "A excelência não é um ato, mas um hábito. Transforme leads em parcerias duradouras."
                    </p>
                </div>

                {/* Decorative Circles */}
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-600/20 rounded-full blur-3xl"></div>
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl"></div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-900">
                <Card className="w-full max-w-md border-none shadow-xl bg-white dark:bg-slate-800">
                    <CardHeader className="space-y-1 pb-6">
                        <CardTitle className="text-2xl font-bold text-center text-slate-800 dark:text-white">Bem-vindo de volta</CardTitle>
                        <CardDescription className="text-center text-slate-500 dark:text-slate-400">
                            Entre com suas credenciais para acessar o painel
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="bg-slate-50 dark:bg-slate-900"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Senha</Label>
                                    <a href="#" className="text-xs text-emerald-600 hover:text-emerald-500 font-medium">
                                        Esqueceu a senha?
                                    </a>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="bg-slate-50 dark:bg-slate-900"
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-11 cursor-pointer"
                                disabled={loading}
                            >
                                {loading ? 'Entrando...' : 'Entrar'}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-center pb-6">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Não tem uma conta? <a href="#" className="text-emerald-600 hover:text-emerald-500 font-medium">Contate o admin</a>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
