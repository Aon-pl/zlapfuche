'use client'

import { useState, useMemo } from 'react'

interface User {
  id: string
  email: string
  role: 'person' | 'company'
  blocked: boolean
  createdAt: Date
  personProfile?: { firstName: string; lastName: string; city: string } | null
  companyProfile?: { companyName: string; city: string } | null
}

interface Props {
  users: User[]
}

export default function AdminUsersSearch({ users }: Props) {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'person' | 'company'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all')

  const filtered = useMemo(() => {
    return users.filter(u => {
      const name = u.personProfile
        ? `${u.personProfile.firstName} ${u.personProfile.lastName}`
        : u.companyProfile?.companyName ?? ''
      const city = u.personProfile?.city ?? u.companyProfile?.city ?? ''

      const matchesSearch = !search ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        name.toLowerCase().includes(search.toLowerCase()) ||
        city.toLowerCase().includes(search.toLowerCase())

      const matchesRole = roleFilter === 'all' || u.role === roleFilter
      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'active' && !u.blocked) ||
        (statusFilter === 'blocked' && u.blocked)

      return matchesSearch && matchesRole && matchesStatus
    })
  }, [users, search, roleFilter, statusFilter])

  return { filtered, search, setSearch, roleFilter, setRoleFilter, statusFilter, setStatusFilter }
}
