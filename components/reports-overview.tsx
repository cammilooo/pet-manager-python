'use client'

import { BarChart3, TrendingDown, TrendingUp } from 'lucide-react'
import useSWR from 'swr'
import type { PetRecord } from '@/lib/services/pets'
import { fetchJson } from '@/lib/fetch-json'

export function ReportsOverview() {
  const { data: pets } = useSWR<PetRecord[]>('/api/pets', fetchJson)

  if (!pets || pets.length === 0) {
    return (
      <div className="flex flex-col gap-7">
        <section>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-muted">Análisis</p>
          <h2 className="font-display text-4xl text-forest sm:text-5xl">Reportes</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted">Estadísticas de mascotas, estado de salud y distribución por especie.</p>
        </section>
        <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-forest/10 bg-cream px-6 text-center">
          <span className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-white text-forest">
            <BarChart3 size={25} aria-hidden="true" />
          </span>
          <h3 className="font-semibold text-forest">Sin datos</h3>
          <p className="mt-2 max-w-sm text-sm leading-6 text-muted">Agrega mascotas al registro para ver reportes.</p>
        </div>
      </div>
    )
  }

  const dogCount = pets.filter((p) => p.kind === 'Dog').length
  const catCount = pets.filter((p) => p.kind === 'Cat').length
  const healthyCount = pets.filter((p) => p.health_status === 'Healthy').length
  const sickCount = pets.filter((p) => p.health_status === 'Sick').length
  const surgeryCount = pets.filter((p) => p.health_status === 'In Surgery').length

  const avgAge = pets.reduce((sum, p) => sum + (new Date().getFullYear() - p.born_year), 0) / pets.length

  return (
    <div className="flex flex-col gap-7">
      <section>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-muted">Análisis</p>
        <h2 className="font-display text-4xl text-forest sm:text-5xl">Reportes</h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted">Estadísticas de mascotas, estado de salud y distribución por especie.</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <article className="rounded-2xl border border-forest/10 bg-white p-5 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">Total de mascotas</p>
              <p className="mt-2 font-display text-3xl text-forest">{pets.length}</p>
            </div>
            <span className="flex size-10 items-center justify-center rounded-xl bg-sage text-forest">
              <TrendingUp size={18} aria-hidden="true" />
            </span>
          </div>
        </article>

        <article className="rounded-2xl border border-forest/10 bg-white p-5 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">Edad promedio</p>
              <p className="mt-2 font-display text-3xl text-forest">{avgAge.toFixed(1)}</p>
              <p className="mt-1 text-xs text-muted">años</p>
            </div>
            <span className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <BarChart3 size={18} aria-hidden="true" />
            </span>
          </div>
        </article>

        <article className="rounded-2xl border border-forest/10 bg-white p-5 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">Enfermas</p>
              <p className="mt-2 font-display text-3xl text-rose-700">{sickCount}</p>
              <p className="mt-1 text-xs text-muted">{((sickCount / pets.length) * 100).toFixed(0)}% requiere atención</p>
            </div>
            <span className="flex size-10 items-center justify-center rounded-xl bg-rose-50 text-rose-700">
              <TrendingDown size={18} aria-hidden="true" />
            </span>
          </div>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-forest/10 bg-white p-6 shadow-card">
          <h3 className="font-semibold text-forest">Distribución por especie</h3>
          <table className="mt-4 w-full">
            <tbody className="divide-y divide-forest/10 text-sm">
              <tr>
                <td className="py-2 text-muted">Perros</td>
                <td className="py-2 text-right font-semibold text-forest">{dogCount}</td>
                <td className="py-2 text-right text-muted">{((dogCount / pets.length) * 100).toFixed(0)}%</td>
              </tr>
              <tr>
                <td className="py-2 text-muted">Gatos</td>
                <td className="py-2 text-right font-semibold text-forest">{catCount}</td>
                <td className="py-2 text-right text-muted">{((catCount / pets.length) * 100).toFixed(0)}%</td>
              </tr>
            </tbody>
          </table>
        </article>

        <article className="rounded-2xl border border-forest/10 bg-white p-6 shadow-card">
          <h3 className="font-semibold text-forest">Estado de salud</h3>
          <table className="mt-4 w-full">
            <tbody className="divide-y divide-forest/10 text-sm">
              <tr>
                <td className="py-2 text-muted">Saludables</td>
                <td className="py-2 text-right font-semibold text-emerald-700">{healthyCount}</td>
                <td className="py-2 text-right text-muted">{((healthyCount / pets.length) * 100).toFixed(0)}%</td>
              </tr>
              <tr>
                <td className="py-2 text-muted">Enfermas</td>
                <td className="py-2 text-right font-semibold text-rose-700">{sickCount}</td>
                <td className="py-2 text-right text-muted">{((sickCount / pets.length) * 100).toFixed(0)}%</td>
              </tr>
              <tr>
                <td className="py-2 text-muted">En cirugía</td>
                <td className="py-2 text-right font-semibold text-amber-700">{surgeryCount}</td>
                <td className="py-2 text-right text-muted">{((surgeryCount / pets.length) * 100).toFixed(0)}%</td>
              </tr>
            </tbody>
          </table>
        </article>
      </section>
    </div>
  )
}
