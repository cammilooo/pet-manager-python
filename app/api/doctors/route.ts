import { getAuthenticatedClient } from '@/lib/api-auth'
import { createDoctor, listDoctors, parseDoctorInput } from '@/lib/services/doctors'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const session = await getAuthenticatedClient()
  if (!session) return NextResponse.json({ error: 'Debes iniciar sesión como personal autorizado.' }, { status: 401 })

  try {
    return NextResponse.json(await listDoctors(session.supabase))
  } catch {
    return NextResponse.json({ error: 'No se pudieron cargar los veterinarios.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getAuthenticatedClient()
  if (!session) return NextResponse.json({ error: 'Debes iniciar sesión como personal autorizado.' }, { status: 401 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Revisa los datos del formulario.' }, { status: 400 })
  }
  const input = parseDoctorInput(body)
  if (!input) return NextResponse.json({ error: 'Revisa los campos del formulario.' }, { status: 400 })

  try {
    await createDoctor(input, session.supabase)
    return NextResponse.json({ success: true }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'No se pudo guardar el veterinario.' }, { status: 500 })
  }
}
