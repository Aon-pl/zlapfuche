'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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
        { label: 'Szukam pracy',         href: '/workers',  icon: '👷' },
        { label: 'Dodaj ogłoszenie',     href: '/offers/new', icon: '➕' },
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
        { label: 'Przeglądaj oferty', href: '/offers',    icon: '🔍' },
        { label: 'Dodaj ogłoszenie',  href: '/offers/new', icon: '➕' },
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
  const wrapperRef = useRef<HTMLDivElement>(null)

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

  return (
    <header
      ref={wrapperRef}
      className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm"
    >
      {/* ── Main bar ── */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 min-h-16 py-2 sm:py-0 flex items-center justify-between gap-2 sm:gap-4">

        {/* Logo */}
        <Link href="/" className="shrink-0 min-w-0" onClick={closeAll}>
          <Image
            src="/IMG/logo/Logo_Zlap_Fuche.png"
            alt="PracaTymczasowa"
            width={140}
            height={36}
            className="h-8 sm:h-9 w-auto max-w-[118px] sm:max-w-none object-contain object-left"
            priority
          />
        </Link>

        {/* ── Desktop navigation ── */}
        <nav className="hidden md:flex items-center gap-0.5 flex-1">
          {navItems.map(item =>
            item.children ? (
              /* Dropdown item */
              <div key={item.label} className="relative">
                <button
                  onClick={() => toggleDropdown(item.label)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors
                    ${openDropdown === item.label
                      ? 'text-orange-500 bg-orange-50'
                      : 'text-gray-600 hover:text-orange-500 hover:bg-orange-50'
                    }`}
                >
                  {item.label}
                  <Chevron open={openDropdown === item.label} />
                </button>

                {openDropdown === item.label && (
                  <div className="absolute top-full left-0 mt-1.5 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50">
                    {item.children.map(child => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={closeAll}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:text-orange-500 hover:bg-orange-50 transition-colors"
                      >
                        <span className="text-base">{child.icon}</span>
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Plain link */
              <Link
                key={item.label}
                href={item.href!}
                className="px-3 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:text-orange-500 hover:bg-orange-50 transition-colors"
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        {/* ── Right-side actions ── */}
        <div className="flex items-center gap-1.5 shrink-0">

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
                className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-white shrink-0"
                  style={{ background: '#f97015' }}
                >
                  {initials}
                </span>
                <span className="hidden lg:block text-sm font-semibold text-gray-700 max-w-[130px] truncate">
                  {email}
                </span>
                <Chevron open={openDropdown === 'user'} />
              </button>

              {openDropdown === 'user' && (
                <div className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50">
                  <Link
                    href="/profile"
                    onClick={closeAll}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:text-orange-500 hover:bg-orange-50 transition-colors"
                  >
                    <span>👤</span> Mój profil
                  </Link>
                  <div className="my-1 border-t border-gray-100" />
                  <form action={logout}>
                    <button
                      type="submit"
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <span>🚪</span> Wyloguj się
                    </button>
                  </form>
                </div>
              )}
            </div>

          ) : (
            /* ── Guest buttons (desktop) ── */
            <div className="hidden md:flex items-center gap-2 ml-1">
              <Link
                href="/login"
                className="px-3 py-2 text-sm font-semibold text-gray-600 hover:text-orange-500 rounded-lg hover:bg-orange-50 transition-colors"
              >
                Zaloguj się
              </Link>
              <Link
                href="/register"
                className="text-sm font-bold px-5 py-2 rounded-full text-white transition-all hover:opacity-90 hover:scale-105"
                style={{ background: '#f97015' }}
              >
                Dołącz za darmo
              </Link>
            </div>
          )}

          {/* ── Hamburger (mobile) ── */}
          <button
            className="md:hidden ml-1 flex flex-col justify-center items-center w-9 h-9 gap-[5px] rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setMobileOpen(prev => !prev)}
            aria-label={mobileOpen ? 'Zamknij menu' : 'Otwórz menu'}
          >
            {mobileOpen ? (
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-0.5">

            {navItems.map(item =>
              item.children ? (
                <div key={item.label}>
                  <p className="px-3 pt-3 pb-1 text-xs font-black text-gray-400 uppercase tracking-widest">
                    {item.label}
                  </p>
                  {item.children.map(child => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={closeAll}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:text-orange-500 hover:bg-orange-50 transition-colors"
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
                  className="px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-600 hover:text-orange-500 hover:bg-orange-50 transition-colors"
                >
                  {item.label}
                </Link>
              )
            )}

            {/* Mobile: profil + wyloguj (zalogowany) */}
            {email && (
              <div className="mt-2 pt-3 border-t border-gray-100 flex flex-col gap-0.5">
                <Link
                  href="/profile"
                  onClick={closeAll}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:text-orange-500 hover:bg-orange-50 transition-colors"
                >
                  <span>👤</span> Mój profil
                </Link>
                <form action={logout}>
                  <button
                    type="submit"
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <span>🚪</span> Wyloguj się
                  </button>
                </form>
              </div>
            )}

            {/* Mobile: przyciski gościa */}
            {!email && (
              <div className="mt-2 pt-3 border-t border-gray-100 flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={closeAll}
                  className="text-center py-2.5 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Zaloguj się
                </Link>
                <Link
                  href="/register"
                  onClick={closeAll}
                  className="text-center py-2.5 rounded-full text-sm font-bold text-white transition-all hover:opacity-90"
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
