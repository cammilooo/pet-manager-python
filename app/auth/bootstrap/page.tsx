import { AuthBootstrapForm } from '@/components/auth-bootstrap-form'
import { PawPrint } from 'lucide-react'

export const metadata = {
  title: 'Alta inicial | PetManager',
  description: 'Configura la primera cuenta de administración de PetManager.',
}

export default function BootstrapPage() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-cream px-4 py-10 sm:px-6">
      <section className="w-full max-w-lg rounded-3xl border border-forest/10 bg-white p-6 shadow-card sm:p-9">
        <div className="mb-7 flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-lime text-forest"><PawPrint size={23} aria-hidden="true" /></span>
          <div>
            <p className="font-semibold tracking-tight text-forest">petmanager</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">Configuración segura</p>
          </div>
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">Primera configuración</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-forest">Crea la cuenta de administración</h1>
        <p className="mt-3 text-sm leading-6 text-muted">El registro público está desactivado. Esta página crea una sola cuenta inicial usando el código secreto configurado en el proyecto.</p>
        <AuthBootstrapForm />
      </section>
    </main>
  )
}
