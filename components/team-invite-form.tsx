'use client'

import { useState } from 'react'

export function TeamInviteForm() {
  const [message, setMessage] = useState<{ text: string; tone: 'success' | 'error' } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(null)
    setIsSubmitting(true)
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    const email = String(form.get('email') ?? '').trim()

    try {
      const response = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'No se pudo enviar la invitación.')
      formElement.reset()
      setMessage({ text: 'Invitación enviada. Al aceptar, la persona tendrá acceso compartido a la clínica.', tone: 'success' })
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : 'No se pudo enviar la invitación.', tone: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <label className="flex-1 text-sm font-medium text-ink">
        Correo del nuevo miembro
        <input name="email" type="email" autoComplete="email" maxLength={254} required placeholder="persona@clinica.com" className="mt-1.5 w-full rounded-xl border border-forest/15 bg-white px-3.5 py-3 text-sm outline-none focus:border-forest focus:ring-2 focus:ring-forest/10" />
      </label>
      <button type="submit" disabled={isSubmitting} className="rounded-xl bg-forest px-5 py-3 text-sm font-semibold text-white hover:bg-forest/90 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2">
        {isSubmitting ? 'Enviando…' : 'Enviar invitación'}
      </button>
      {message && <p role={message.tone === 'error' ? 'alert' : 'status'} className={`basis-full rounded-xl px-4 py-3 text-sm ${message.tone === 'error' ? 'bg-rose-50 text-rose-800' : 'bg-sage text-forest'}`}>{message.text}</p>}
    </form>
  )
}
