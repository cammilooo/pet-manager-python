'use client'

import type { Doctor, DoctorInput } from '@/lib/services/doctors'
import type { Hospital, HospitalInput } from '@/lib/services/hospitals'

export type DirectoryItem = Doctor | Hospital
export type DirectoryPayload = DoctorInput | HospitalInput

export function DirectoryForm({
  kind,
  item,
  doctors,
  isSaving,
  onSave,
  onCancel,
}: {
  kind: 'doctors' | 'hospitals'
  item: DirectoryItem | null
  doctors: Doctor[]
  isSaving: boolean
  onSave: (value: DirectoryPayload) => void
  onCancel: () => void
}) {
  const doctorItem = kind === 'doctors' && item ? item as Doctor : null
  const hospitalItem = kind === 'hospitals' && item ? item as Hospital : null

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const name = String(formData.get('name') ?? '').trim()
    const phone = String(formData.get('phone') ?? '').trim() || null
    const address = String(formData.get('address') ?? '').trim() || null

    if (kind === 'doctors') {
      onSave({ name, phone, address })
      return
    }

    const patientType = String(formData.get('patien_type') ?? '')
    const doctorId = String(formData.get('id_doctor') ?? '')
    onSave({
      name,
      phone,
      address,
      patien_type: patientType ? Number(patientType) : null,
      id_doctor: doctorId ? Number(doctorId) : null,
    })
  }

  const fieldClass = 'mt-1.5 w-full rounded-xl border border-forest/15 bg-white px-3.5 py-3 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-forest focus:ring-2 focus:ring-forest/10'

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 p-0 backdrop-blur-sm sm:items-center sm:p-5">
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="directory-form-title"
        onSubmit={handleSubmit}
        className="max-h-[92svh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-cream p-5 shadow-2xl sm:rounded-3xl sm:p-7"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">
              {kind === 'doctors' ? 'Directorio veterinario' : 'Red clínica'}
            </p>
            <h2 id="directory-form-title" className="mt-2 text-2xl font-semibold text-forest">
              {item ? 'Editar registro' : kind === 'doctors' ? 'Nuevo veterinario' : 'Nuevo hospital'}
            </h2>
          </div>
          <button type="button" onClick={onCancel} className="rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest">
            Cerrar
          </button>
        </div>

        <div className="grid gap-4">
          <label className="text-sm font-medium text-ink">
            Nombre <span aria-hidden="true" className="text-rose-700">*</span>
            <input
              autoFocus
              className={fieldClass}
              name="name"
              required
              maxLength={120}
              defaultValue={item?.name ?? ''}
              placeholder={kind === 'doctors' ? 'Dra. Ana García' : 'Hospital veterinario'}
            />
          </label>

          <label className="text-sm font-medium text-ink">
            Teléfono
            <input className={fieldClass} name="phone" type="tel" maxLength={255} defaultValue={item?.phone ?? ''} placeholder="+57 300 000 0000" />
          </label>

          <label className="text-sm font-medium text-ink">
            Dirección
            <input className={fieldClass} name="address" maxLength={255} defaultValue={item?.address ?? ''} placeholder="Dirección del establecimiento" />
          </label>

          {kind === 'hospitals' && (
            <>
              <label className="text-sm font-medium text-ink">
                Tipo de paciente (código)
                <input className={fieldClass} name="patien_type" type="number" min={0} max={999} step={1} defaultValue={hospitalItem?.patien_type ?? ''} placeholder="Sin especificar" />
              </label>
              <label className="text-sm font-medium text-ink">
                Veterinario responsable
                <select className={fieldClass} name="id_doctor" defaultValue={hospitalItem?.id_doctor ?? ''}>
                  <option value="">Sin asignar</option>
                  {doctors.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.name}</option>)}
                </select>
              </label>
            </>
          )}
        </div>

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} className="rounded-xl border border-forest/15 px-4 py-3 text-sm font-semibold text-forest hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest">
            Cancelar
          </button>
          <button type="submit" disabled={isSaving} className="rounded-xl bg-forest px-5 py-3 text-sm font-semibold text-white hover:bg-forest/90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2">
            {isSaving ? 'Guardando…' : item ? 'Guardar cambios' : 'Crear registro'}
          </button>
        </div>
        {doctorItem && <span className="sr-only">Editando a {doctorItem.name}</span>}
      </form>
    </div>
  )
}
