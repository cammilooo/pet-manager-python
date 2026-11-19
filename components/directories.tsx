'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Building2, LoaderCircle, MapPin, Pencil, Phone, Plus, Stethoscope, Trash2 } from 'lucide-react'
import type { Doctor } from '@/lib/services/doctors'
import type { Hospital } from '@/lib/services/hospitals'
import { fetchJson } from '@/lib/fetch-json'
import { DirectoryForm, type DirectoryItem, type DirectoryPayload } from '@/components/directory-form'

type DirectoryKind = 'doctors' | 'hospitals'

const directoryCopy: Record<DirectoryKind, { title: string; description: string; singular: string }> = {
  doctors: {
    title: 'Veterinarios',
    description: 'Mantén los datos de contacto del equipo veterinario de la clínica.',
    singular: 'veterinario',
  },
  hospitals: {
    title: 'Hospitales',
    description: 'Consulta los establecimientos asociados y sus contactos principales.',
    singular: 'hospital',
  },
}

function phoneHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, '')}`
}

export function DirectoryPage({ kind }: { kind: DirectoryKind }) {
  const copy = directoryCopy[kind]
  const endpoint = kind === 'doctors' ? '/api/doctors' : '/api/hospitals'
  const { data, error, isLoading, mutate } = useSWR<Doctor[] | Hospital[]>(endpoint, fetchJson)
  const { data: doctors = [] } = useSWR<Doctor[]>(kind === 'hospitals' ? '/api/doctors' : null, fetchJson)
  const [editing, setEditing] = useState<DirectoryItem | null | undefined>(undefined)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const items = data ?? []

  async function saveRecord(payload: DirectoryPayload) {
    setIsSaving(true)
    setMessage(null)
    try {
      const id = editing && typeof editing.id === 'number' ? `/${editing.id}` : ''
      const response = await fetch(`${endpoint}${id}`, {
        method: id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'No se pudo guardar el registro.')
      setEditing(undefined)
      await mutate()
      setMessage('Registro guardado correctamente.')
    } catch (saveError) {
      setMessage(saveError instanceof Error ? saveError.message : 'No se pudo guardar el registro.')
    } finally {
      setIsSaving(false)
    }
  }

  async function removeRecord(item: DirectoryItem) {
    const confirmed = window.confirm(`¿Eliminar el registro de ${item.name}?`)
    if (!confirmed) return

    setMessage(null)
    try {
      const response = await fetch(`${endpoint}/${item.id}`, { method: 'DELETE' })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'No se pudo eliminar el registro.')
      await mutate()
      setMessage('Registro eliminado.')
    } catch (deleteError) {
      setMessage(deleteError instanceof Error ? deleteError.message : 'No se pudo eliminar el registro.')
    }
  }

  return (
    <div className="flex flex-col gap-7">
      <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-muted">Red clínica</p>
          <h2 className="font-display text-4xl text-forest sm:text-5xl">{copy.title}</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted">{copy.description}</p>
        </div>
        <button type="button" onClick={() => setEditing(null)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-forest px-4 py-3 text-sm font-semibold text-white transition hover:bg-forest/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2">
          <Plus size={17} aria-hidden="true" /> Añadir {copy.singular}
        </button>
      </section>

      {message && <p role="status" className="rounded-xl border border-forest/10 bg-white px-4 py-3 text-sm text-forest">{message}</p>}
      {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">No se pudo consultar la base de datos. Revisa la conexión y los permisos de Supabase.</p>}

      <section aria-label={copy.title} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full flex min-h-64 items-center justify-center gap-2 text-sm text-muted">
            <LoaderCircle className="animate-spin" size={18} aria-hidden="true" /> Cargando directorio…
          </div>
        ) : items.length === 0 ? (
          <div className="col-span-full flex min-h-56 flex-col items-center justify-center rounded-2xl border border-forest/10 bg-white px-6 text-center">
            <span className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-sage">
              {kind === 'doctors' ? <Stethoscope size={25} className="text-forest" aria-hidden="true" /> : <Building2 size={25} className="text-forest" aria-hidden="true" />}
            </span>
            <h3 className="font-semibold text-forest">Sin registros todavía</h3>
            <p className="mt-2 max-w-sm text-sm leading-6 text-muted">Añade el primer {copy.singular} para tener sus datos de contacto a mano.</p>
          </div>
        ) : items.map((item) => {
          const doctor = kind === 'doctors' ? item as Doctor : null
          const hospital = kind === 'hospitals' ? item as Hospital : null
          const assignedDoctor = hospital?.id_doctor ? doctors.find((entry) => entry.id === hospital.id_doctor) : null
          return (
            <article key={item.id} className="flex flex-col gap-4 rounded-2xl border border-forest/10 bg-white p-5 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <div className="flex size-11 items-center justify-center rounded-xl bg-sage">
                  {doctor ? <Stethoscope size={19} className="text-forest" aria-hidden="true" /> : <Building2 size={19} className="text-forest" aria-hidden="true" />}
                </div>
                <div className="flex gap-1">
                  <button type="button" onClick={() => setEditing(item)} aria-label={`Editar ${item.name}`} className="rounded-lg p-2 text-muted hover:bg-sage/70 hover:text-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"><Pencil size={16} aria-hidden="true" /></button>
                  <button type="button" onClick={() => void removeRecord(item)} aria-label={`Eliminar ${item.name}`} className="rounded-lg p-2 text-muted hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-700"><Trash2 size={16} aria-hidden="true" /></button>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-forest">{item.name}</h3>
                {doctor?.address && <p className="mt-2 flex items-start gap-2 text-sm leading-5 text-muted"><MapPin size={15} className="mt-0.5 shrink-0" aria-hidden="true" />{doctor.address}</p>}
                {hospital?.address && <p className="mt-2 flex items-start gap-2 text-sm leading-5 text-muted"><MapPin size={15} className="mt-0.5 shrink-0" aria-hidden="true" />{hospital.address}</p>}
                {hospital?.patien_type !== null && hospital?.patien_type !== undefined && <p className="mt-2 text-xs text-muted">Tipo de paciente: {hospital.patien_type}</p>}
                {hospital?.id_doctor && <p className="mt-2 text-xs text-muted">Responsable: {assignedDoctor?.name ?? `Veterinario #${hospital.id_doctor}`}</p>}
              </div>
              <div className="mt-auto border-t border-forest/10 pt-3">
                {item.phone ? <a href={phoneHref(item.phone)} className="inline-flex items-center gap-2 text-sm font-medium text-forest hover:underline"><Phone size={15} aria-hidden="true" />{item.phone}</a> : <span className="text-sm text-muted">Sin teléfono registrado</span>}
              </div>
            </article>
          )
        })}
      </section>

      {editing !== undefined && (
        <DirectoryForm
          key={`${kind}-${editing?.id ?? 'new'}`}
          kind={kind}
          item={editing}
          doctors={doctors}
          isSaving={isSaving}
          onSave={(payload) => void saveRecord(payload)}
          onCancel={() => setEditing(undefined)}
        />
      )}
    </div>
  )
}
