import { createPet, listPets, parsePetInput } from '@/lib/services/pets'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const pets = await listPets()
    return NextResponse.json(pets)
  } catch {
    return NextResponse.json({ error: 'No se pudieron cargar las mascotas.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'El formulario no es válido.' }, { status: 400 })
  }

  const input = parsePetInput(body)
  if (!input) return NextResponse.json({ error: 'Revisa los campos del formulario.' }, { status: 400 })

  try {
    await createPet(input)
    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    const code = (error as { code?: string })?.code
    if (code === '23505') {
      return NextResponse.json({ error: 'Ya existe una mascota con ese código.' }, { status: 409 })
    }
    return NextResponse.json({ error: 'No se pudo guardar la mascota.' }, { status: 500 })
  }
}
