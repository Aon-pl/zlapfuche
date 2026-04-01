import { prisma } from '@/lib/prisma'

interface PageProps {
  searchParams: Promise<{ action?: string; page?: string }>
}

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  USER_CREATED:           { label: '👤 Utworzono użytkownika', color: '#34d399' },
  USER_DELETED:           { label: '🗑️ Usunięto użytkownika', color: '#ef4444' },
  USER_BLOCKED:           { label: '🚫 Zablokowano użytkownika', color: '#f97316' },
  USER_UNBLOCKED:         { label: '✅ Odblokowano użytkownika', color: '#34d399' },
  OFFER_CREATED:          { label: '📋 Utworzono ofertę', color: '#60a5fa' },
  OFFER_UPDATED:          { label: '✏️ Zaktualizowano ofertę', color: '#60a5fa' },
  OFFER_DELETED:          { label: '🗑️ Usunięto ofertę', color: '#ef4444' },
  OFFER_BLOCKED:          { label: '🚫 Zablokowano ofertę', color: '#f97316' },
  COMPANY_CREATED:        { label: '🏢 Utworzono firmę', color: '#a78bfa' },
  COMPANY_VERIFIED:       { label: '✓ Zweryfikowano firmę', color: '#34d399' },
  APPLICATION_CREATED:    { label: '📨 Utworzono aplikację', color: '#f59e0b' },
  APPLICATION_STATUS_CHANGED: { label: '🔄 Zmieniono status aplikacji', color: '#f59e0b' },
  LOGIN_SUCCESS:          { label: '🔓 Logowanie udane', color: '#34d399' },
  LOGIN_FAILED:           { label: '❌ Logowanie nieudane', color: '#ef4444' },
  LOGOUT:                { label: '🔒 Wylogowanie', color: '#94a3b8' },
}

export default async function AdminLogsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const actionFilter = params.action || 'all'
  const currentPage = params.page ? Number(params.page) : 1
  const perPage = 30

  const where = actionFilter !== 'all' ? { action: actionFilter } : {}

  const [logs, total] = await Promise.all([
    prisma.systemLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: perPage,
      skip: (currentPage - 1) * perPage,
    }),
    prisma.systemLog.count({ where }),
  ])

  const pages = Math.ceil(total / perPage)
  const actions = Object.keys(ACTION_LABELS)

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-black uppercase tracking-widest mb-1 text-white/40">Panel admina</p>
        <h1 className="text-2xl font-black text-white" style={{ letterSpacing: '-0.02em' }}>
          Logi systemowe <span className="text-white/30">({total})</span>
        </h1>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <a
          href="/dashboard/admin/logs"
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
            actionFilter === 'all' ? 'text-white' : 'text-white/50 hover:text-white'
          }`}
          style={actionFilter === 'all' ? { background: '#f97015' } : { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          Wszystkie
        </a>
        {actions.map(action => (
          <a
            key={action}
            href={`/dashboard/admin/logs?action=${action}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              actionFilter === action ? 'text-white' : 'text-white/50 hover:text-white'
            }`}
            style={actionFilter === action ? { background: ACTION_LABELS[action].color } : { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            {ACTION_LABELS[action].label}
          </a>
        ))}
      </div>

      {/* Logs list */}
      <div className="glass-card-dark overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-8 text-center text-white/40">
            Brak logów
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            {logs.map(log => {
              const info = ACTION_LABELS[log.action] || { label: log.action, color: '#94a3b8' }
              return (
                <div key={log.id} className="p-4 hover:bg-white/5 transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold" style={{ color: info.color }}>
                          {info.label}
                        </span>
                        {log.entity && (
                          <span className="text-xs px-2 py-0.5 rounded"
                            style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}>
                            {log.entity}
                          </span>
                        )}
                      </div>
                      {log.details && (
                        <p className="text-sm mt-1 text-white/60">
                          {log.details}
                        </p>
                      )}
                      {log.userEmail && (
                        <p className="text-xs mt-1 text-white/40">
                          👤 {log.userEmail}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-white/40">
                        {new Date(log.createdAt).toLocaleString('pl-PL')}
                      </p>
                      {log.ip && (
                        <p className="text-xs mt-0.5 text-white/30">
                          IP: {log.ip}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
            <a
              key={p}
              href={`/dashboard/admin/logs?${new URLSearchParams({ 
                ...(actionFilter !== 'all' && { action: actionFilter }),
                page: String(p)
              }).toString()}`}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition ${
                p === currentPage ? 'text-white' : 'text-white/50 hover:text-white'
              }`}
              style={p === currentPage ? { background: '#f97015' } : { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
