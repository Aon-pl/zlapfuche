'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import AdminDeleteButton from '@/components/admin/AdminDeleteButton'
import AdminBlockButton from '@/components/admin/AdminBlockButton'

interface User {
  id: string
  email: string
  role: 'person' | 'company' | 'admin'
  blocked: boolean
  createdAt: Date
  personProfile?: { firstName: string; lastName: string; city: string | null } | null
  companyProfile?: { companyName: string; city: string | null } | null
}

interface Props {
  users: User[]
  total: number
}

export default function AdminUsersTable({ users, total }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const q = searchParams.get('q') || ''
  const roleFilter = searchParams.get('role') || 'all'
  const statusFilter = searchParams.get('status') || 'all'

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/dashboard/admin/users?${params.toString()}`)
  }

  const ROLE_COLOR: Record<string, string> = { person: '#E8C547', company: '#60a5fa' }
  const ROLE_LABEL: Record<string, string> = { person: '👤 Osoba', company: '🏢 Firma' }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-black uppercase tracking-widest mb-1 text-white/40">Panel admina</p>
        <h1 className="text-2xl font-black text-white" style={{ letterSpacing: '-0.02em' }}>
          Użytkownicy <span className="text-white/30">({users.length})</span>
        </h1>
      </div>

      {/* Search and filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Szukaj (email, imię, miasto)..."
          defaultValue={q}
          onChange={e => updateFilter('q', e.target.value)}
          className="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/40"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
        />
        
        <select
          value={roleFilter}
          onChange={e => updateFilter('role', e.target.value)}
          className="px-4 py-2.5 rounded-xl text-sm text-white"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <option value="all" className="text-black">Wszystkie role</option>
          <option value="person" className="text-black">Osoby</option>
          <option value="company" className="text-black">Firmy</option>
        </select>

        <select
          value={statusFilter}
          onChange={e => updateFilter('status', e.target.value)}
          className="px-4 py-2.5 rounded-xl text-sm text-white"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <option value="all" className="text-black">Wszystkie statusy</option>
          <option value="active" className="text-black">Aktywni</option>
          <option value="blocked" className="text-black">Zablokowani</option>
        </select>
      </div>

      <div className="glass-card-dark overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {['Email', 'Nazwa', 'Rola', 'Miasto', 'Status', 'Data rejestracji', 'Akcje'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-black uppercase tracking-widest text-white/40">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-white/40">
                  Brak użytkowników spełniających kryteria
                </td>
              </tr>
            ) : (
              users.map(u => {
                const name = u.personProfile
                  ? `${u.personProfile.firstName} ${u.personProfile.lastName}`
                  : u.companyProfile?.companyName ?? '—'
                const city = u.personProfile?.city ?? u.companyProfile?.city ?? '—'

                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-white font-medium">{u.email}</td>
                    <td className="px-4 py-3 text-white/70">{name}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{ background: `${ROLE_COLOR[u.role]}20`, color: ROLE_COLOR[u.role] }}>
                        {ROLE_LABEL[u.role]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/50">{city}</td>
                    <td className="px-4 py-3">
                      {u.blocked ? (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                          style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
                          Zablokowany
                        </span>
                      ) : (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                          style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399' }}>
                          Aktywny
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-white/40">
                      {new Date(u.createdAt).toLocaleDateString('pl-PL')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <AdminBlockButton userId={u.id} isBlocked={u.blocked} />
                        <AdminDeleteButton
                          endpoint={`/api/admin/users/${u.id}`}
                          label="Usuń"
                          confirm={`Usunąć użytkownika ${u.email}? Operacja jest nieodwracalna.`}
                        />
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
