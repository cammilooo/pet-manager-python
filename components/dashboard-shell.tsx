'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, Building2, LayoutDashboard, PawPrint, Stethoscope } from 'lucide-react'
import type { ReactNode } from 'react'

const navItems = [
  { href: '/', label: 'Resumen', icon: LayoutDashboard },
  { href: '/pets', label: 'Mascotas', icon: PawPrint },
  { href: '/doctors', label: 'Veterinarios', icon: Stethoscope },
  { href: '/hospitals', label: 'Hospitales', icon: Building2 },
  { href: '/reports', label: 'Reportes', icon: BarChart3 },
]

const pageTitles: Record<string, string> = {
  '/': 'Resumen',
  '/pets': 'Mascotas',
  '/doctors': 'Veterinarios',
  '/hospitals': 'Hospitales',
  '/reports': 'Reportes',
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-cream text-ink">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col bg-forest px-5 py-6 text-cream lg:flex">
        <Link href="/" className="mb-10 flex items-center gap-3 px-2" aria-label="Pet Manager, resumen">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-lime text-forest">
            <PawPrint size={22} strokeWidth={2.5} aria-hidden="true" />
          </span>
          <span>
            <span className="block text-lg font-bold tracking-tight">petmanager</span>
            <span className="block text-xs text-white/60">CLÍNICA VETERINARIA</span>
          </span>
        </Link>

        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Espacio de trabajo</p>
        <nav aria-label="Navegación principal" className="flex flex-col gap-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                  active ? 'bg-white/10 text-lime' : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon size={18} aria-hidden="true" />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto rounded-2xl bg-white/5 p-4">
          <p className="text-xs font-semibold text-white/90">¿Necesitas ayuda?</p>
          <p className="mt-1 text-xs leading-5 text-white/55">Tu equipo puede mantener aquí los registros de la clínica.</p>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-forest/10 bg-cream/95 px-4 py-3 backdrop-blur sm:px-8 lg:px-10">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">Pet Manager</p>
            <h1 className="truncate text-lg font-semibold text-forest">{pageTitles[pathname] ?? 'Clínica'}</h1>
          </div>
          <nav aria-label="Navegación móvil" className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                aria-current={pathname === href ? 'page' : undefined}
                className={`flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold ${
                  pathname === href ? 'bg-forest text-lime' : 'bg-white text-muted'
                }`}
              >
                <Icon size={14} aria-hidden="true" />
                {label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="mx-auto w-full max-w-[1440px] p-4 sm:p-8 lg:p-10">{children}</main>
      </div>
    </div>
  )
}
