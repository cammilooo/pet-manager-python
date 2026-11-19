'use client'

import { createClient } from '@/lib/supabase/client'
import { PawPrint } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

function loginErrorMessage(error: unknown): string {
  const { code, status } = (error ?? {}) as { code?: string; status?: number }
  if (code === 'over_request_rate_limit' || status === 429) return 'Demasiados intentos. Espera un momento y vuelve a probar.'
  if (code === 'invalid_credentials') return 'El correo o la contraseña no son correctos.'
  return 'No se pudo iniciar sesión. Revisa tus datos e inténtalo de nuevo.'
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) throw signInError
      router.replace('/')
      router.refresh()
    } catch (loginError) {
      setError(loginErrorMessage(loginError))
    } finally {
      setIsLoading(false)
    }
  }

  const inputClass = 'mt-1.5 w-full rounded-xl border border-forest/15 bg-white px-3.5 py-3 text-sm text-ink outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/10'

  return (
    <main className="flex min-h-svh items-center justify-center bg-cream px-4 py-10 sm:px-6">
      <section className="w-full max-w-md rounded-3xl border border-forest/10 bg-white p-6 shadow-card sm:p-9">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-lime text-forest"><PawPrint size={23} aria-hidden="true" /></span>
          <div>
            <p className="font-semibold tracking-tight text-forest">petmanager</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">CLÍNICA VETERINARIA</p>
          </div>
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">Acceso del equipo</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-forest">Inicia sesión</h1>
        <p className="mt-3 text-sm leading-6 text-muted">Ingresa con tu cuenta autorizada para consultar y actualizar los registros compartidos de la clínica.</p>
        <form onSubmit={handleLogin} className="mt-7 space-y-4">
          <label className="block text-sm font-medium text-ink" htmlFor="email">
            Correo electrónico
            <input id="email" className={inputClass} type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label className="block text-sm font-medium text-ink" htmlFor="password">
            Contraseña
            <input id="password" className={inputClass} type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{error}</p>}
          <button type="submit" disabled={isLoading} className="w-full rounded-xl bg-forest px-4 py-3 text-sm font-semibold text-white transition hover:bg-forest/90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2">
            {isLoading ? 'Ingresando…' : 'Entrar a la clínica'}
          </button>
        </form>
        <p className="mt-6 border-t border-forest/10 pt-5 text-center text-sm text-muted">
          ¿Primera configuración?{' '}
          <Link href="/auth/bootstrap" className="font-semibold text-forest underline-offset-4 hover:underline">Crear la cuenta de administración</Link>
        </p>
      </section>
    </main>
  )
}
