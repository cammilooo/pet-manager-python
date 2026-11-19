import { getAuthenticatedClient } from '@/lib/api-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const session = await getAuthenticatedClient()
  if (!session) return NextResponse.json({ error: 'Debes iniciar sesión como personal autorizado.' }, { status: 401 })
  if (session.role !== 'admin') return NextResponse.json({ error: 'Solo administración puede invitar al equipo.' }, { status: 403 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Revisa los datos del formulario.' }, { status: 400 })
  }

  const email = body && typeof body === 'object' && typeof (body as Record<string, unknown>).email === 'string'
    ? ((body as Record<string, string>).email).trim().toLowerCase()
    : ''
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return NextResponse.json({ error: 'Escribe un correo válido.' }, { status: 400 })
  }

  try {
    const admin = createAdminClient()
    const redirectTo = new URL('/auth/callback?next=/', request.url).toString()
    const { data, error } = await admin.auth.admin.inviteUserByEmail(email, { redirectTo })
    if (error || !data.user) {
      return NextResponse.json({ error: 'No se pudo enviar la invitación. Revisa la configuración de correo de Supabase.' }, { status: 400 })
    }

    const { error: roleError } = await admin.auth.admin.updateUserById(data.user.id, {
      app_metadata: { petmanager_role: 'staff' },
    })
    if (roleError) {
      await admin.auth.admin.deleteUser(data.user.id)
      return NextResponse.json({ error: 'No se pudo asignar el rol de personal.' }, { status: 503 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'No se pudo completar la invitación.' }, { status: 503 })
  }
}
