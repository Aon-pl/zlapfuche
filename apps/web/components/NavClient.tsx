'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { logout } from '@/app/actions/auth'
import NotificationBell from '@/components/NotificationBell'
import ChatBell from '@/components/ChatBell'

type Role = 'person' | 'company' | 'admin' | null

interface Props {
  role: Role
  email?: string
}

interface DropdownItem {
  label: string
  href: string
  icon: string
}

interface NavItem {
  label: string
  href?: string
  children?: DropdownItem[]
}

function getNavItems(role: Role): NavItem[] {
  if (role === 'person') return [
    {
      label: 'Oferty',
      children: [
        { label: 'Przeglądaj oferty',   href: '/offers',   icon: '🔍' },
        { label: 'Szukam pracy',        href: '/workers',  icon: '👷' },
        { label: 'Dodaj ogłoszenie',    href: '/offers/new', icon: '➕' },
      ],
    },
    {
      label: 'Narzędzia',
      children: [
        { label: 'Kalkulator wynagrodzeń', href: '/kalkulator', icon: '🧮' },
        { label: 'Ranking firm',           href: '/ranking',    icon: '⭐' },
      ],
    },
    { label: 'Dashboard', href: '/dashboard/person' },
  ]

  if (role === 'company') return [
    {
      label: 'Oferty',
      children: [
        { label: 'Przeglądaj oferty',  href: '/offers',    icon: '🔍' },
        { label: 'Dodaj ogłoszenie',   href: '/offers/new', icon: '➕' },
      ],
    },
    { label: 'Ranking firm', href: '/ranking' },
    { label: 'Dashboard',    href: '/dashboard/company' },
  ]

  if (role === 'admin') return [
    { label: 'Panel admina', href: '/dashboard/admin' },
  ]

  // Guest
  return [
    { label: 'Oferty pracy', href: '/offers' },
    { label: 'Szukam pracy', href: '/workers' },
    { label: 'Ranking firm', href: '/ranking' },
    { label: 'Kalkulator',   href: '/kalkulator' },
  ]
}

// ── Chevron icon ───────────────────────────────────────────────────────────────
function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function NavClient({ role, email }: Props) {
  const [mobileOpen,   setMobileOpen]   = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const wrapperRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()

  const navItems = getNavItems(role)
  const initials = email ? email[0].toUpperCase() : '?'

  // Close everything when clicking outside
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpenDropdown(null)
        setMobileOpen(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  function toggleDropdown(key: string) {
    setOpenDropdown(prev => (prev === key ? null : key))
  }

  function closeAll() {
    setOpenDropdown(null)
    setMobileOpen(false)
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/offers?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <header
      ref={wrapperRef}
      className="sticky top-0 z-50 main-nav"
    >
      {/* ── Main bar ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 min-h-14 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="shrink-0" onClick={closeAll}>
          <Image
            src="/IMG/logo/Logo_Zlap_Fuche.png"
            alt="PracaTymczasowa"
            width={130}
            height={34}
            className="h-8 w-auto object-contain"
            priority
          />
        </Link>

        {/* ── Search bar (desktop) ── */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9ca3af' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Szukaj..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm outline-none focus:border-orange-400 focus:bg-white transition-all"
              style={{ color: '#1a1a2e' }}
            />
          </div>
        </form>

        {/* ── Desktop navigation ── */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map(item =>
            item.children ? (
              <div key={item.label} className="relative">
                <button
                  onClick={() => toggleDropdown(item.label)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm font-medium transition-colors
                    ${openDropdown === item.label ? 'text-orange-500' : 'text-gray-600 hover:text-orange-500'}`}
                >
                  {item.label}
                  <Chevron open={openDropdown === item.label} />
                </button>

                {openDropdown === item.label && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                    {item.children.map(child => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={closeAll}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-orange-500 hover:bg-gray-50 transition-colors"
                      >
                        <span>{child.icon}</span>
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.label}
                href={item.href!}
                className="px-3 py-1.5 rounded text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors"
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        {/* ── Right-side actions ── */}
        <div className="flex items-center gap-2">

          {/* Search button (mobile) */}
          <Link href="/offers"
            className="md:hidden flex items-center justify-center w-9 h-9">
            <svg className="w-5 h-5" style={{ color: '#6b7280' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </Link>

          {/* Chat + notifications (logged in, non-admin) */}
          {role && role !== 'admin' && (
            <>
              <ChatBell />
              <NotificationBell />
            </>
          )}
          {role === 'admin' && <NotificationBell />}

          {/* ── User dropdown (logged in) ── */}
          {email ? (
            <div className="relative ml-1">
              <button
                onClick={() => toggleDropdown('user')}
                className="flex items-center gap-2"
              >
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: '#f97015' }}
                >
                  {initials}
                </span>
                <Chevron open={openDropdown === 'user'} />
              </button>

              {openDropdown === 'user' && (
                <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                  <Link
                    href="/profile"
                    onClick={closeAll}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-orange-500 hover:bg-gray-50"
                  >
                    <span>👤</span> Mój profil
                  </Link>
                  <div className="my-1 border-t border-gray-100" />
                  <form action={logout}>
                    <button
                      type="submit"
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-red-500 hover:bg-red-50"
                    >
                      <span>🚪</span> Wyloguj się
                    </button>
                  </form>
                </div>
              )}
            </div>

          ) : (
            /* ── Guest buttons (desktop) ── */
            <div className="hidden lg:flex items-center gap-2">
              <Link
                href="/login"
                className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors"
              >
                Zaloguj się
              </Link>
              <Link
                href="/register"
                className="text-sm font-medium px-4 py-1.5 rounded text-white transition-colors hover:opacity-90"
                style={{ background: '#f97015' }}
              >
                Dołącz
              </Link>
            </div>
          )}

          {/* ── Hamburger (mobile) ── */}
          <button
            className="lg:hidden flex flex-col justify-center items-center w-9 h-9"
            onClick={() => setMobileOpen(prev => !prev)}
            aria-label={mobileOpen ? 'Zamknij menu' : 'Otwórz menu'}
          >
            {mobileOpen ? (
              <svg className="w-5 h-5" style={{ color: '#6b7280' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" style={{ color: '#6b7280' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">

            {/* Mobile search */}
            <form onSubmit={handleSearch} className="mb-2">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9ca3af' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Szukaj..."
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm outline-none focus:border-orange-400 focus:bg-white"
                  style={{ color: '#1a1a2e' }}
                />
              </div>
            </form>

            {navItems.map(item =>
              item.children ? (
                <div key={item.label}>
                  <p className="px-2 pt-2 pb-1 text-xs font-semibold uppercase tracking-wide" style={{ color: '#9ca3af' }}>
                    {item.label}
                  </p>
                  {item.children.map(child => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={closeAll}
                      className="flex items-center gap-2 px-2 py-2 text-sm text-gray-600 hover:text-orange-500"
                    >
                      <span>{child.icon}</span>
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  key={item.label}
                  href={item.href!}
                  onClick={closeAll}
                  className="px-2 py-2 text-sm font-medium text-gray-600 hover:text-orange-500"
                >
                  {item.label}
                </Link>
              )
            )}

            {/* Mobile: profil + wyloguj (zalogowany) */}
            {email && (
              <div className="mt-2 pt-2 border-t border-gray-100 flex flex-col gap-1">
                <Link
                  href="/profile"
                  onClick={closeAll}
                  className="flex items-center gap-2 px-2 py-2 text-sm text-gray-600 hover:text-orange-500"
                >
                  <span>👤</span> Mój profil
                </Link>
                <form action={logout}>
                  <button
                    type="submit"
                    className="w-full flex items-center gap-2 px-2 py-2 text-sm text-gray-500 hover:text-red-500"
                  >
                    <span>🚪</span> Wyloguj się
                  </button>
                </form>
              </div>
            )}

            {/* Mobile: przyciski gościa */}
            {!email && (
              <div className="mt-2 pt-2 border-t border-gray-100 flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={closeAll}
                  className="text-center py-2 text-sm font-medium text-gray-600 hover:text-orange-500"
                >
                  Zaloguj się
                </Link>
                <Link
                  href="/register"
                  onClick={closeAll}
                  className="text-center py-2 text-sm font-medium text-white rounded"
                  style={{ background: '#f97015' }}
                >
                  Dołącz za darmo
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
