import { DashboardShell } from '@/components/dashboard-shell'
import { Overview } from '@/components/overview'

export const metadata = {
  title: 'Resumen | Pet Manager',
  description: 'Resumen de actividad de la clínica veterinaria.',
}

export default function HomePage() {
  return (
    <DashboardShell>
      <Overview />
    </DashboardShell>
  )
}
