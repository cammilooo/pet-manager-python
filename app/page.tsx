import { DashboardShell } from '@/components/dashboard-shell'
import { Overview } from '@/components/overview'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Resumen | Pet Manager',
  description: 'Resumen de actividad de la clínica veterinaria.',
}

export default async function HomePage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) redirect('/auth/login')

  const role = data.user.app_metadata?.petmanager_role
  if (role !== 'admin' && role !== 'staff') redirect('/auth/login')

  return (
    <DashboardShell email={data.user.email ?? 'Equipo clínico'} role={role}>
      <Overview />
    </DashboardShell>
  )
}
