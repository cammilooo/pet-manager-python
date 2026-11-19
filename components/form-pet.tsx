'use client'

import { useState } from 'react'
import { LoaderCircle, X } from 'lucide-react'
import type { PetInput, PetKind, PetRecord } from '@/lib/services/pets'

const dogBreeds = ['Criollo', 'Schnauzer', 'German shepherd', 'Pincher']
const catBreeds = ['Birman', 'British', 'Bombay', 'Abyssinian']
const healthStatuses = [
  { value: 'Sick', label: 'Enferma' },
  { value: 'Healthy', label: 'Saludable' },
  { value: 'In Surgery', label: 'En cirugía' },
] as const

export function PetForm({
  pet,
  isSaving,
  onCancel,
  onSave,
}: {
  pet?: PetRecord
  isSaving: boolean
  onCancel: () => void
  onSave: (input: PetInput) => Promise<void>
}) {
  const [kind, setKind] = useState<PetKind>(pet?.kind ?? 'Dog')
  const [code, setCode] = useState(pet?.code ?? '')
  const [name, setName] = useState(pet?.name ?? '')
  const [bornYear, setBornYear] = useState(String(pet?.born_year ?? new Date().getFullYear()))
  const [color, setColor] = useState(pet?.color ?? '')
  const [healthStatus, setHealthStatus] = useState<PetInput['health_status']>(pet?.health_status ?? 'Healthy')
  const [breed, setBreed] = useState(pet?.breed ?? dogBreeds[0])
  const [pedigree, setPedigree] = useState(pet?.pedigree ?? false)
  const [validation, setValidation] = useState('')

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const year = Number(bornYear)
    if (!Number.isInteger(year) || year < 1900 || year > new Date().getFullYear()) {
      setValidation(`El año debe estar entre 1900 y ${new Date().getFullYear()}.`)
      return
    }
    setValidation('')
    await onSave({ code: code.trim(), name: name.trim(), born_year: year, color: color.trim(), health_status: healthStatus, breed, kind, pedigree })
  }

  const fieldClass = 'mt-2 h-11 w-full rounded-xl border border-forest/15 bg-white px-3.5 text-sm text-ink outline-none transition focus:border-forest/50 focus:ring-2 focus:ring-forest/10 disabled:bg-cream'
  const labelClass = 'text-xs font-bold uppercase tracking-[0.1em] text-muted'

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-[0.17em] text-muted">Ficha clínica</p><h2 id="pet-form-title" className="mt-1 font-display text-3xl text-forest">{pet ? 'Editar mascota' : 'Nueva mascota'}</h2></div>
        <button type="button" onClick={onCancel} className="flex size-9 items-center justify-center rounded-full text-muted hover:bg-white hover:text-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest" aria-label="Cerrar formulario"><X size={19} aria-hidden="true" /></button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClass}>Código (máx. 3 caracteres)<input required maxLength={3} value={code} onChange={(event) => setCode(event.target.value)} className={fieldClass} autoFocus /></label>
        <label className={labelClass}>Nombre<input required maxLength={50} value={name} onChange={(event) => setName(event.target.value)} className={fieldClass} /></label>
        <label className={labelClass}>Especie<select value={kind} onChange={(event) => { const nextKind = event.target.value as PetKind; setKind(nextKind); setBreed(nextKind === 'Dog' ? dogBreeds[0] : catBreeds[0]) }} disabled={Boolean(pet)} className={fieldClass}><option value="Dog">Perro</option><option value="Cat">Gato</option></select></label>
        <label className={labelClass}>Raza<select value={breed} onChange={(event) => setBreed(event.target.value)} className={fieldClass}>{(kind === 'Dog' ? dogBreeds : catBreeds).map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
        <label className={labelClass}>Año de nacimiento<input required type="number" min={1900} max={new Date().getFullYear()} value={bornYear} onChange={(event) => setBornYear(event.target.value)} className={fieldClass} /></label>
        <label className={labelClass}>Color<input required maxLength={20} value={color} onChange={(event) => setColor(event.target.value)} className={fieldClass} /></label>
        <label className={labelClass}>Estado de salud<select value={healthStatus} onChange={(event) => setHealthStatus(event.target.value as PetInput['health_status'])} className={fieldClass}>{healthStatuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select></label>
        {kind === 'Dog' && <label className="mt-7 flex items-center gap-3 text-sm font-medium text-forest"><input type="checkbox" checked={pedigree} onChange={(event) => setPedigree(event.target.checked)} className="size-4 accent-forest" /> Cuenta con pedigree</label>}
      </div>

      {validation && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800">{validation}</p>}
      <div className="flex flex-col-reverse gap-3 border-t border-forest/10 pt-5 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className="h-11 rounded-xl border border-forest/15 px-5 text-sm font-semibold text-muted transition hover:bg-white">Cancelar</button>
        <button type="submit" disabled={isSaving} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-forest px-5 text-sm font-semibold text-white transition hover:bg-forest/90 disabled:cursor-not-allowed disabled:opacity-60">{isSaving && <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />}{isSaving ? 'Guardando…' : 'Guardar ficha'}</button>
      </div>
    </form>
  )
}
