'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/dashboard/admin',        label: 'Statystyki',  icon: '📊' },
  { href: '/dashboard/admin/users',   label: 'Użytkownicy', icon: '👥' },
  { href: '/dashboard/admin/offers',  label: 'Oferty',      icon: '📋' },
  { href: '/dashboard/admin/companies',label: 'Firmy',     icon: '🏢' },
  { href: '/dashboard/admin/reviews',label: 'Opinie',      icon: '⭐' },
  { href: '/dashboard/admin/banners',label: 'Banery',      icon: '🎨' },
  { href: '/dashboard/admin/logs',    label: 'Logi',        icon: '📝' },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 shrink-0 flex flex-col"
      style={{ background: 'rgba(20,20,35,0.95)', borderRight: '1px solid rgba(255,255,255,0.06)', minHeight: '100vh' }}>

      {/* Logo */}
      <div className="px-5 py-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-xs font-black uppercase tracking-widest mb-0.5 text-white/40">Panel</p>
        <p className="text-lg font-black text-white">Administratora</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(item => {
          const active = pathname === item.href
          return (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={active
                ? { background: 'rgba(249,112,21,0.15)', color: '#f97015', border: '1px solid rgba(249,112,21,0.2)' }
                : { color: 'rgba(255,255,255,0.5)', border: '1px solid transparent' }
              }>
              <span>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <Link href="/" className="text-xs font-bold hover:opacity-80 transition flex items-center gap-2"
          style={{ color: 'rgba(255,255,255,0.3)' }}>
          ← Wróć do portalu
        </Link>
      </div>
    </aside>
  )
}
