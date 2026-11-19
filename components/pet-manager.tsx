'use client'

import { useMemo, useState } from 'react'
import useSWR from 'swr'
import { Cat, Dog, LoaderCircle, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import type { PetInput, PetRecord } from '@/lib/services/pets'
import { PetForm } from '@/components/form-pet'
import { fetchJson } from '@/lib/fetch-json'

const statusLabels: Record<string, string> = {
  Healthy: 'Saludable',
  Sick: 'Enferma',
  'In Surgery': 'En cirugía',
}

export function PetManager() {
  const { data: pets, error, isLoading, mutate } = useSWR<PetRecord[]>('/api/pets', fetchJson)
  const [query, setQuery] = useState('')
  const [kind, setKind] = useState<'All' | 'Dog' | 'Cat'>('All')
  const [modalPet, setModalPet] = useState<PetRecord | null | undefined>(undefined)
  const [feedback, setFeedback] = useState('')
  const [saving, setSaving] = useState(false)

  const filteredPets = useMemo(() => {
    return (pets ?? []).filter((pet) => {
      const matchesKind = kind === 'All' || pet.kind === kind
      const search = `${pet.name} ${pet.code} ${pet.breed}`.toLowerCase()
      return matchesKind && search.includes(query.trim().toLowerCase())
    })
  }, [pets, kind, query])

  async function savePet(values: PetInput) {
    setSaving(true)
    setFeedback('')
    try {
      const editing = typeof modalPet === 'object' && modalPet !== null
      const response = await fetch(editing ? `/api/pets/${modalPet.id}` : '/api/pets', {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error ?? 'No se pudo guardar la ficha.')
      await mutate()
      setModalPet(undefined)
      setFeedback(editing ? 'La ficha de mascota se actualizó.' : 'La mascota se agregó al registro.')
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'No se pudo guardar la ficha.')
    } finally {
      setSaving(false)
    }
  }

  async function removePet(pet: PetRecord) {
    if (!window.confirm(`¿Eliminar la ficha de ${pet.name}? Esta acción no se puede deshacer.`)) return
    setFeedback('')
    try {
      const response = await fetch(`/api/pets/${pet.id}`, { method: 'DELETE' })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error ?? 'No se pudo eliminar la ficha.')
      await mutate()
      setFeedback(`La ficha de ${pet.name} se eliminó.`)
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'No se pudo eliminar la ficha.')
    }
  }

  return (
    <div className="flex flex-col gap-7">
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-muted">Registro clínico</p>
          <h2 className="font-display text-4xl text-forest sm:text-5xl">Mascotas</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted">Mantén las fichas de tus pacientes completas y encuentra rápidamente su información.</p>
        </div>
        <button type="button" onClick={() => setModalPet(null)} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-forest px-5 text-sm font-semibold text-white transition hover:bg-forest/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2">
          <Plus size={18} aria-hidden="true" /> Nueva mascota
        </button>
      </section>

      <section className="grid gap-4 rounded-2xl border border-forest/10 bg-white p-4 shadow-card md:grid-cols-[1fr_auto] md:items-center">
        <label className="relative block">
          <span className="sr-only">Buscar por nombre, código o raza</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={17} aria-hidden="true" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar mascota, código o raza" className="h-11 w-full rounded-xl border border-forest/10 bg-cream pl-10 pr-4 text-sm outline-none transition placeholder:text-muted/70 focus:border-forest/40 focus:ring-2 focus:ring-forest/10" />
        </label>
        <div className="flex flex-wrap gap-2" aria-label="Filtrar por especie">
          {[
            { value: 'All', label: 'Todas' },
            { value: 'Dog', label: 'Perros' },
            { value: 'Cat', label: 'Gatos' },
          ].map((option) => (
            <button key={option.value} type="button" onClick={() => setKind(option.value as typeof kind)} aria-pressed={kind === option.value} className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${kind === option.value ? 'bg-forest text-white' : 'bg-cream text-muted hover:bg-sage'}`}>
              {option.label}
            </button>
          ))}
        </div>
      </section>

      {feedback && <p role="status" className="rounded-xl border border-forest/10 bg-sage/60 px-4 py-3 text-sm text-forest">{feedback}</p>}
      {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">No se pudo consultar la base de datos. Revisa la conexión y los permisos de Supabase.</p>}

      <section className="overflow-hidden rounded-2xl border border-forest/10 bg-white shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-forest/10 px-5 py-4 sm:px-6">
          <div>
            <h3 className="font-semibold text-forest">Fichas registradas</h3>
            <p className="mt-1 text-xs text-muted">{isLoading ? 'Cargando registros…' : `${filteredPets.length} ${filteredPets.length === 1 ? 'paciente' : 'pacientes'}`}</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted">
            <span className="size-2 rounded-full bg-lime-500" aria-hidden="true" /> Datos sincronizados con Supabase
          </div>
        </div>

        {isLoading ? (
          <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-muted"><LoaderCircle className="animate-spin" size={18} aria-hidden="true" /> Cargando pacientes</div>
        ) : filteredPets.length === 0 ? (
          <div className="flex min-h-56 flex-col items-center justify-center px-6 text-center">
            <span className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-sage text-forest"><Cat size={25} aria-hidden="true" /></span>
            <h3 className="font-semibold text-forest">{query || kind !== 'All' ? 'No encontramos coincidencias' : 'Aún no hay mascotas'}</h3>
            <p className="mt-2 max-w-sm text-sm leading-6 text-muted">{query || kind !== 'All' ? 'Prueba con otro nombre, código o filtro.' : 'Agrega el primer paciente para comenzar el registro de la clínica.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead className="bg-cream/80 text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
                <tr>
                  <th scope="col" className="px-5 py-3 sm:px-6">Paciente</th>
                  <th scope="col" className="px-4 py-3">Especie / raza</th>
                  <th scope="col" className="px-4 py-3">Edad</th>
                  <th scope="col" className="px-4 py-3">Estado de salud</th>
                  <th scope="col" className="px-4 py-3">Color</th>
                  <th scope="col" className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest/10">
                {filteredPets.map((pet) => {
                  const SpeciesIcon = pet.kind === 'Dog' ? Dog : Cat
                  const age = new Date().getFullYear() - pet.born_year
                  return (
                    <tr key={pet.id} className="group hover:bg-cream/60">
                      <td className="px-5 py-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sage text-forest"><SpeciesIcon size={19} aria-hidden="true" /></span>
                          <span className="min-w-0"><span className="block truncate font-semibold text-ink">{pet.name}</span><span className="mt-0.5 block text-xs text-muted">Código {pet.code}</span></span>
                        </div>
                      </td>
                      <td className="px-4 py-4"><span className="block text-sm font-medium text-ink">{pet.kind === 'Dog' ? 'Perro' : 'Gato'}</span><span className="mt-0.5 block text-xs text-muted">{pet.breed}{pet.kind === 'Dog' && pet.pedigree ? ' · Pedigree' : ''}</span></td>
                      <td className="px-4 py-4 text-sm text-ink">{age} {age === 1 ? 'año' : 'años'}</td>
                      <td className="px-4 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${pet.health_status === 'Healthy' ? 'bg-emerald-50 text-emerald-800' : pet.health_status === 'Sick' ? 'bg-rose-50 text-rose-800' : 'bg-amber-50 text-amber-800'}`}>{statusLabels[pet.health_status] ?? pet.health_status}</span></td>
                      <td className="px-4 py-4 text-sm text-muted">{pet.color}</td>
                      <td className="px-4 py-4"><div className="flex justify-end gap-1"><button type="button" onClick={() => setModalPet(pet)} className="flex size-9 items-center justify-center rounded-lg text-muted hover:bg-sage hover:text-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest" aria-label={`Editar ficha de ${pet.name}`}><Pencil size={16} aria-hidden="true" /></button><button type="button" onClick={() => void removePet(pet)} className="flex size-9 items-center justify-center rounded-lg text-muted hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-700" aria-label={`Eliminar ficha de ${pet.name}`}><Trash2 size={16} aria-hidden="true" /></button></div></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {modalPet !== undefined && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-forest/55 p-4" role="presentation">
          <section role="dialog" aria-modal="true" aria-labelledby="pet-form-title" className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-cream p-5 shadow-2xl sm:p-7">
            <PetForm pet={modalPet ?? undefined} isSaving={saving} onCancel={() => setModalPet(undefined)} onSave={savePet} />
          </section>
        </div>
      )}
    </div>
  )
}
