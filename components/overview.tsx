'use client'

import { Activity, Building2, Heart, Stethoscope } from 'lucide-react'
import useSWR from 'swr'
import { fetchJson } from '@/lib/fetch-json'
import type { PetRecord } from '@/lib/services/pets'
import type { Doctor } from '@/lib/services/doctors'
import type { Hospital } from '@/lib/services/hospitals'

export function Overview() {
  const { data: pets } = useSWR<PetRecord[]>('/api/pets', fetchJson)
  const { data: doctors } = useSWR<Doctor[]>('/api/doctors', fetchJson)
  const { data: hospitals } = useSWR<Hospital[]>('/api/hospitals', fetchJson)

  const stats = [
    { label: 'Mascotas registradas', value: pets?.length ?? 0, icon: Heart, color: 'emerald' },
    { label: 'Veterinarios', value: doctors?.length ?? 0, icon: Stethoscope, color: 'blue' },
    { label: 'Hospitales', value: hospitals?.length ?? 0, icon: Building2, color: 'purple' },
    { label: 'Mascotas sanas', value: pets?.filter((p) => p.health_status === 'Healthy').length ?? 0, icon: Activity, color: 'teal' },
  ]

  const dogCount = pets?.filter((p) => p.kind === 'Dog').length ?? 0
  const catCount = pets?.filter((p) => p.kind === 'Cat').length ?? 0
  const sickCount = pets?.filter((p) => p.health_status === 'Sick').length ?? 0
  const surgeryCount = pets?.filter((p) => p.health_status === 'In Surgery').length ?? 0

  return (
    <div className="flex flex-col gap-7">
      <section>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-muted">Resumen</p>
        <h2 className="font-display text-4xl text-forest sm:text-5xl">Clínica veterinaria</h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted">Visualiza el estado actual de tu clínica y gestiona toda la información de pacientes, médicos y hospitales.</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          const colorMap: Record<string, string> = {
            emerald: 'bg-emerald-50 text-emerald-700',
            blue: 'bg-blue-50 text-blue-700',
            purple: 'bg-purple-50 text-purple-700',
            teal: 'bg-teal-50 text-teal-700',
          }
          return (
            <article key={stat.label} className="flex flex-col gap-3 rounded-2xl border border-forest/10 bg-white p-5 shadow-card">
              <div className={`flex size-10 items-center justify-center rounded-xl ${colorMap[stat.color]}`}>
                <Icon size={18} aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">{stat.label}</p>
                <p className="mt-2 font-display text-3xl text-forest">{stat.value}</p>
              </div>
            </article>
          )
        })}
      </section>

      {pets && pets.length > 0 && (
        <section className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-2xl border border-forest/10 bg-white p-6 shadow-card">
            <h3 className="font-semibold text-forest">Población de mascotas</h3>
            <div className="mt-4 flex gap-6">
              <div>
                <p className="text-xs text-muted">Perros</p>
                <p className="mt-1 font-display text-2xl text-forest">{dogCount}</p>
                <p className="mt-1 text-xs text-muted">{((dogCount / pets.length) * 100).toFixed(0)}% del total</p>
              </div>
              <div>
                <p className="text-xs text-muted">Gatos</p>
                <p className="mt-1 font-display text-2xl text-forest">{catCount}</p>
                <p className="mt-1 text-xs text-muted">{((catCount / pets.length) * 100).toFixed(0)}% del total</p>
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-forest/10 bg-white p-6 shadow-card">
            <h3 className="font-semibold text-forest">Estado de salud</h3>
            <div className="mt-4 flex gap-6">
              <div>
                <p className="text-xs text-emerald-700">Saludables</p>
                <p className="mt-1 font-display text-2xl text-emerald-700">{pets.length - sickCount - surgeryCount}</p>
              </div>
              <div>
                <p className="text-xs text-rose-700">Enfermas</p>
                <p className="mt-1 font-display text-2xl text-rose-700">{sickCount}</p>
              </div>
              <div>
                <p className="text-xs text-amber-700">En cirugía</p>
                <p className="mt-1 font-display text-2xl text-amber-700">{surgeryCount}</p>
              </div>
            </div>
          </article>
        </section>
      )}
    </div>
  )
}
