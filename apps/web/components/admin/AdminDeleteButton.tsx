'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  endpoint: string
  label?: string
  confirm: string
}

export default function AdminDeleteButton({ endpoint, label = 'Usuń', confirm }: Props) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  function handleDelete() {
    startTransition(async () => {
      await fetch(endpoint, { method: 'DELETE' })
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="text-xs font-bold px-3 py-1.5 rounded-xl transition hover:opacity-80"
        style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
        {label}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div className="glass-card-dark p-6 max-w-sm w-full">
            <h3 className="font-black text-white text-lg mb-2">Potwierdzenie</h3>
            <p className="text-sm mb-6 text-white/70">{confirm}</p>
            <div className="flex gap-3">
              <button onClick={() => setOpen(false)} disabled={pending}
                className="flex-1 font-bold py-2.5 rounded-xl text-sm transition hover:opacity-80"
                style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.15)' }}>
                Anuluj
              </button>
              <button onClick={handleDelete} disabled={pending}
                className="flex-1 font-bold py-2.5 rounded-xl text-sm transition hover:opacity-80 disabled:opacity-40"
                style={{ background: '#ef4444', color: '#fff' }}>
                {pending ? 'Usuwanie...' : 'Usuń'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
