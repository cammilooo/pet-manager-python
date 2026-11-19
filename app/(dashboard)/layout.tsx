import { DashboardShell } from '@/components/dashboard-shell'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) redirect('/auth/login')

  const role = data.user.app_metadata?.petmanager_role
  if (role !== 'admin' && role !== 'staff') redirect('/auth/login')

  return (
    <DashboardShell email={data.user.email ?? 'Equipo clínico'} role={role}>
      {children}
    </DashboardShell>
  )
}
