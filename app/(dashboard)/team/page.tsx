import { TeamInviteForm } from '@/components/team-invite-form'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Equipo | PetManager',
  description: 'Invita personal autorizado a compartir los datos de la clínica.',
}

export default async function TeamPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || data.user?.app_metadata?.petmanager_role !== 'admin') redirect('/')

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-7">
      <section>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-muted">Administración</p>
        <h2 className="font-display text-4xl text-forest sm:text-5xl">Equipo clínico</h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted">Invita a personal de confianza. Cada miembro inicia sesión con su propio correo y comparte el mismo espacio de trabajo.</p>
      </section>
      <section className="rounded-2xl border border-forest/10 bg-white p-5 shadow-card sm:p-7">
        <h3 className="text-lg font-semibold text-forest">Invitar personal</h3>
        <p className="mb-5 mt-2 text-sm leading-6 text-muted">La invitación asigna acceso de personal a mascotas, veterinarios, hospitales y reportes. No se permite registro público.</p>
        <TeamInviteForm />
      </section>
    </div>
  )
}
