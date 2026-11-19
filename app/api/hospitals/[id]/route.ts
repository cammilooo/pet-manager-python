import { getAuthenticatedClient } from '@/lib/api-auth'
import { deleteHospital, parseHospitalInput, updateHospital } from '@/lib/services/hospitals'
import { NextRequest, NextResponse } from 'next/server'

type RouteContext = { params: Promise<{ id: string }> }

function parseId(raw: string) {
  const id = Number(raw)
  return Number.isInteger(id) && id > 0 ? id : null
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const session = await getAuthenticatedClient()
  if (!session) return NextResponse.json({ error: 'Debes iniciar sesión como personal autorizado.' }, { status: 401 })

  const id = parseId((await params).id)
  if (!id) return NextResponse.json({ error: 'Hospital no encontrado.' }, { status: 404 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Revisa los datos del formulario.' }, { status: 400 })
  }
  const input = parseHospitalInput(body)
  if (!input) return NextResponse.json({ error: 'Revisa los campos del formulario.' }, { status: 400 })

  try {
    const updated = await updateHospital(id, input, session.supabase)
    if (!updated) return NextResponse.json({ error: 'Hospital no encontrado.' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'No se pudo actualizar el hospital.' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const session = await getAuthenticatedClient()
  if (!session) return NextResponse.json({ error: 'Debes iniciar sesión como personal autorizado.' }, { status: 401 })

  const id = parseId((await params).id)
  if (!id) return NextResponse.json({ error: 'Hospital no encontrado.' }, { status: 404 })

  try {
    const deleted = await deleteHospital(id, session.supabase)
    if (!deleted) return NextResponse.json({ error: 'Hospital no encontrado.' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'No se pudo eliminar el hospital.' }, { status: 500 })
  }
}
