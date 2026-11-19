'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function AuthBootstrapForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const form = new FormData(event.currentTarget)
    const token = String(form.get('token') ?? '')
    const email = String(form.get('email') ?? '')
    const password = String(form.get('password') ?? '')
    const passwordConfirmation = String(form.get('password_confirmation') ?? '')

    if (password !== passwordConfirmation) {
      setError('Las contraseñas no coinciden.')
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch('/api/auth/bootstrap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email, password }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'No se pudo crear la cuenta.')
      router.replace('/auth/login?created=1')
      router.refresh()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No se pudo crear la cuenta.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputClass = 'mt-1.5 w-full rounded-xl border border-forest/15 bg-white px-3.5 py-3 text-sm text-ink outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/10'

  return (
    <form onSubmit={handleSubmit} className="mt-7 space-y-4">
      <label className="block text-sm font-medium text-ink">
        Código de configuración
        <input className={inputClass} type="password" name="token" autoComplete="off" minLength={32} required />
      </label>
      <label className="block text-sm font-medium text-ink">
        Correo de administración
        <input className={inputClass} type="email" name="email" autoComplete="email" maxLength={254} required />
      </label>
      <label className="block text-sm font-medium text-ink">
        Contraseña
        <input className={inputClass} type="password" name="password" autoComplete="new-password" minLength={12} maxLength={72} required />
        <span className="mt-1 block text-xs font-normal text-muted">Usa al menos 12 caracteres.</span>
      </label>
      <label className="block text-sm font-medium text-ink">
        Confirma la contraseña
        <input className={inputClass} type="password" name="password_confirmation" autoComplete="new-password" minLength={12} maxLength={72} required />
      </label>
      {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{error}</p>}
      <button type="submit" disabled={isSubmitting} className="w-full rounded-xl bg-forest px-4 py-3 text-sm font-semibold text-white transition hover:bg-forest/90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2">
        {isSubmitting ? 'Creando cuenta…' : 'Crear cuenta de administración'}
      </button>
      <p className="text-center text-xs text-muted">Este formulario solo funciona una vez y requiere el código secreto configurado para el proyecto.</p>
      <p className="text-center text-sm text-muted"><Link href="/auth/login" className="font-semibold text-forest underline-offset-4 hover:underline">Volver al inicio de sesión</Link></p>
    </form>
  )
}
