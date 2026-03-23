'use client'

import { useState, useTransition } from 'react'
import { deleteOffer } from '@/lib/actions/offerActions'

interface Props {
  offerId: string
}

export default function DeleteOfferButton({ offerId }: Props) {
  const [open, setOpen]       = useState(false)
  const [pending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      await deleteOffer(offerId)
    })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 font-bold px-4 py-2.5 rounded-xl text-sm transition hover:opacity-80 w-full justify-center"
        style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}
      >
        🗑️ Usuń ofertę
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="rounded-2xl p-6 max-w-sm w-full"
            style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h3 className="font-black text-white text-lg mb-2">Usunąć ofertę?</h3>
            <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Ta operacja jest nieodwracalna. Wszystkie aplikacje powiązane z tą ofertą zostaną usunięte.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setOpen(false)}
                disabled={pending}
                className="flex-1 font-bold py-2.5 rounded-xl text-sm transition hover:opacity-80"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                Anuluj
              </button>
              <button
                onClick={handleDelete}
                disabled={pending}
                className="flex-1 font-bold py-2.5 rounded-xl text-sm transition hover:opacity-80 disabled:opacity-40"
                style={{ background: '#ef4444', color: '#fff' }}
              >
                {pending ? 'Usuwanie...' : 'Tak, usuń'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
