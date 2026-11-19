import { deleteDoctor, parseDoctorInput, updateDoctor } from '@/lib/services/doctors'
import { NextRequest, NextResponse } from 'next/server'

type RouteContext = { params: Promise<{ id: string }> }

function parseId(raw: string) {
  const id = Number(raw)
  return Number.isInteger(id) && id > 0 ? id : null
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const id = parseId((await params).id)
  if (!id) return NextResponse.json({ error: 'Veterinario no encontrado.' }, { status: 404 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Revisa los datos del formulario.' }, { status: 400 })
  }
  const input = parseDoctorInput(body)
  if (!input) return NextResponse.json({ error: 'Revisa los campos del formulario.' }, { status: 400 })

  try {
    const updated = await updateDoctor(id, input)
    if (!updated) return NextResponse.json({ error: 'Veterinario no encontrado.' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'No se pudo actualizar el veterinario.' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const id = parseId((await params).id)
  if (!id) return NextResponse.json({ error: 'Veterinario no encontrado.' }, { status: 404 })

  try {
    const deleted = await deleteDoctor(id)
    if (!deleted) return NextResponse.json({ error: 'Veterinario no encontrado.' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (error) {
    if ((error as { code?: string })?.code === '23503') {
      return NextResponse.json({ error: 'Este veterinario está asignado a un hospital. Cambia esa asignación antes de eliminarlo.' }, { status: 409 })
    }
    return NextResponse.json({ error: 'No se pudo eliminar el veterinario.' }, { status: 500 })
  }
}
