import { deletePet, parsePetInput, updatePet } from '@/lib/services/pets'
import { NextRequest, NextResponse } from 'next/server'

type RouteContext = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const id = Number((await params).id)
  if (!Number.isInteger(id) || id < 1) return NextResponse.json({ error: 'Mascota no encontrada.' }, { status: 404 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'El formulario no es válido.' }, { status: 400 })
  }

  const input = parsePetInput(body)
  if (!input) return NextResponse.json({ error: 'Revisa los campos del formulario.' }, { status: 400 })

  try {
    const updated = await updatePet(id, input)
    if (!updated) return NextResponse.json({ error: 'No se encontró una ficha compatible.' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (error) {
    const code = (error as { code?: string })?.code
    if (code === '23505') {
      return NextResponse.json({ error: 'Ya existe una mascota con ese código.' }, { status: 409 })
    }
    return NextResponse.json({ error: 'No se pudo actualizar la mascota.' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const id = Number((await params).id)
  if (!Number.isInteger(id) || id < 1) return NextResponse.json({ error: 'Mascota no encontrada.' }, { status: 404 })

  try {
    const deleted = await deletePet(id)
    if (!deleted) return NextResponse.json({ error: 'Mascota no encontrada.' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'No se pudo eliminar la mascota.' }, { status: 500 })
  }
}
