import { timingSafeEqual } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

function matchesBootstrapToken(received: string, expected: string) {
  const receivedBuffer = Buffer.from(received)
  const expectedBuffer = Buffer.from(expected)
  return receivedBuffer.length === expectedBuffer.length && timingSafeEqual(receivedBuffer, expectedBuffer)
}

export async function POST(request: NextRequest) {
  const configuredToken = process.env.PETMANAGER_BOOTSTRAP_TOKEN
  if (!configuredToken || configuredToken.length < 32) {
    return NextResponse.json({ error: 'El alta inicial no está configurada.' }, { status: 503 })
  }

  const origin = request.headers.get('origin')
  if (origin && origin !== request.nextUrl.origin) {
    return NextResponse.json({ error: 'Solicitud no válida.' }, { status: 403 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Revisa los datos del formulario.' }, { status: 400 })
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Revisa los datos del formulario.' }, { status: 400 })
  }

  const values = body as Record<string, unknown>
  const token = typeof values.token === 'string' ? values.token : ''
  const email = typeof values.email === 'string' ? values.email.trim().toLowerCase() : ''
  const password = typeof values.password === 'string' ? values.password : ''

  if (!matchesBootstrapToken(token, configuredToken)) {
    return NextResponse.json({ error: 'El código de configuración no es válido.' }, { status: 403 })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return NextResponse.json({ error: 'Escribe un correo válido.' }, { status: 400 })
  }
  if (password.length < 12 || password.length > 72) {
    return NextResponse.json({ error: 'La contraseña debe tener entre 12 y 72 caracteres.' }, { status: 400 })
  }

  try {
    const admin = createAdminClient()
    const { data: users, error: usersError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1 })
    if (usersError) return NextResponse.json({ error: 'No se pudo verificar el alta inicial.' }, { status: 503 })
    if (users.users.length > 0) {
      return NextResponse.json({ error: 'El alta inicial ya se utilizó.' }, { status: 409 })
    }

    const { error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: { petmanager_role: 'admin' },
    })
    if (error) {
      return NextResponse.json({ error: 'No se pudo crear la cuenta. Verifica el correo e inténtalo de nuevo.' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'No se pudo completar el alta inicial.' }, { status: 503 })
  }
}
