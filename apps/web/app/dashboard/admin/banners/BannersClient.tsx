'use client'

import { useState, useTransition } from 'react'

interface Banner {
  id: string
  title: string
  content: string | null
  imageUrl: string | null
  mobileImageUrl: string | null
  linkUrl: string | null
  position: string
  active: boolean
  order: number
  startDate: string | null
  endDate: string | null
}

export default function AdminBannersClient({ initialBanners }: { initialBanners: Banner[] }) {
  const [banners, setBanners] = useState<Banner[]>(initialBanners)
  const [isPending, startTransition] = useTransition()
  const [showForm, setShowForm] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [uploading, setUploading] = useState<'desktop' | 'mobile' | null>(null)

  const [form, setForm] = useState({
    title: '',
    content: '',
    imageUrl: '',
    mobileImageUrl: '',
    linkUrl: '',
    position: 'offers',
    active: true,
    order: 0,
  })

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>, target: 'desktop' | 'mobile') {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(target)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/admin/upload/banner', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (data.error) {
        alert('Błąd uploadu: ' + data.error)
        return
      }
      if (data.url) {
        if (target === 'desktop') {
          setForm(prev => ({ ...prev, imageUrl: data.url }))
        } else {
          setForm(prev => ({ ...prev, mobileImageUrl: data.url }))
        }
      }
    } catch (err) {
      console.error('Upload failed:', err)
      alert('Błąd sieci podczas uploadu')
    } finally {
      setUploading(null)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    const url = editingBanner ? `/api/admin/banners/${editingBanner.id}` : '/api/admin/banners'
    const method = editingBanner ? 'PATCH' : 'POST'
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const err = await res.json()
        alert('Błąd: ' + (err.error || res.statusText))
        return
      }

      const banner = await res.json()

      if (editingBanner) {
        setBanners(banners.map(b => b.id === banner.id ? banner : b))
      } else {
        setBanners([...banners, banner])
      }
      resetForm()
    } catch (err) {
      console.error('Submit error:', err)
      alert('Błąd sieciowy')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Usunąć baner?')) return
    startTransition(async () => {
      await fetch(`/api/admin/banners/${id}`, { method: 'DELETE' })
      setBanners(banners.filter(b => b.id !== id))
    })
  }

  async function toggleActive(banner: Banner) {
    startTransition(async () => {
      const res = await fetch(`/api/admin/banners/${banner.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !banner.active }),
      })
      if (res.ok) {
        const updated = await res.json()
        setBanners(banners.map(b => b.id === updated.id ? updated : b))
      }
    })
  }

  function resetForm() {
    setForm({ title: '', content: '', imageUrl: '', mobileImageUrl: '', linkUrl: '', position: 'offers', active: true, order: 0 })
    setShowForm(false)
    setEditingBanner(null)
  }

  function openEdit(banner: Banner) {
    setEditingBanner(banner)
    setForm({
      title: banner.title,
      content: banner.content || '',
      imageUrl: banner.imageUrl || '',
      mobileImageUrl: banner.mobileImageUrl || '',
      linkUrl: banner.linkUrl || '',
      position: banner.position,
      active: banner.active,
      order: banner.order,
    })
    setShowForm(true)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-widest mb-1 text-white/40">Panel admina</p>
          <h1 className="text-2xl font-black text-white" style={{ letterSpacing: '-0.02em' }}>
            Banery <span className="text-white/30">({banners.length})</span>
          </h1>
        </div>
        <button onClick={() => setShowForm(true)}
          className="px-4 py-2 rounded-xl font-bold text-sm transition-all"
          style={{ background: '#f97015', color: '#fff' }}>
          + Dodaj baner
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="glass-card-dark p-6 max-w-lg w-full">
            <h2 className="font-black text-white text-lg mb-4">{editingBanner ? 'Edytuj baner' : 'Dodaj baner'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-white/70 mb-1">Tytuł</label>
                <input value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl text-white placeholder-white/40 text-sm"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
                  required />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/70 mb-1">Treść</label>
                <textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl text-white placeholder-white/40 text-sm"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
                  rows={2} />
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-white/70 mb-1">Obrazek Desktop</label>
                  <div className="flex items-center gap-3">
                    <input value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})}
                      className="flex-1 px-4 py-2 rounded-xl text-white placeholder-white/40 text-sm"
                      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
                      placeholder="https://... lub wybierz plik" />
                    <label className="px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all"
                      style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>
                      {uploading === 'desktop' ? 'Przesyłanie...' : 'Wybierz plik'}
                      <input type="file" accept="image/webp,image/*" onChange={e => handleUpload(e, 'desktop')}
                        className="hidden" disabled={uploading !== null} />
                    </label>
                  </div>
                  <p className="text-xs text-white/40 mt-1">
                    Zalecane wymiary: <span className="text-white/60">1200×200px</span>
                  </p>
                  {form.imageUrl && (
                    <div className="mt-2 rounded-lg overflow-hidden border border-white/10">
                      <img src={form.imageUrl} alt="Preview Desktop" className="w-full max-h-20 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/70 mb-1">Obrazek Mobile</label>
                  <div className="flex items-center gap-3">
                    <input value={form.mobileImageUrl} onChange={e => setForm({...form, mobileImageUrl: e.target.value})}
                      className="flex-1 px-4 py-2 rounded-xl text-white placeholder-white/40 text-sm"
                      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
                      placeholder="https://... lub wybierz plik" />
                    <label className="px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all"
                      style={{ background: 'rgba(168,85,247,0.15)', color: '#a855f7' }}>
                      {uploading === 'mobile' ? 'Przesyłanie...' : 'Wybierz plik'}
                      <input type="file" accept="image/webp,image/*" onChange={e => handleUpload(e, 'mobile')}
                        className="hidden" disabled={uploading !== null} />
                    </label>
                  </div>
                  <p className="text-xs text-white/40 mt-1">
                    Zalecane wymiary: <span className="text-white/60">600×300px</span>
                  </p>
                  {form.mobileImageUrl && (
                    <div className="mt-2 rounded-lg overflow-hidden border border-white/10">
                      <img src={form.mobileImageUrl} alt="Preview Mobile" className="w-full max-h-20 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-white/70 mb-1">Link po kliknięciu</label>
                <input value={form.linkUrl} onChange={e => setForm({...form, linkUrl: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl text-white placeholder-white/40 text-sm"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
                  placeholder="https://..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-white/70 mb-1">Pozycja</label>
                  <select value={form.position} onChange={e => setForm({...form, position: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl text-white text-sm"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <option value="offers" className="text-black">Oferty</option>
                    <option value="home" className="text-black">Strona główna</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/70 mb-1">Kolejność</label>
                  <input type="number" value={form.order} onChange={e => setForm({...form, order: Number(e.target.value)})}
                    className="w-full px-4 py-2 rounded-xl text-white text-sm"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={form.active} onChange={e => setForm({...form, active: e.target.checked})}
                  id="active" className="w-4 h-4" />
                <label htmlFor="active" className="text-sm text-white/70">Aktywny</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={resetForm}
                  className="flex-1 py-2 rounded-xl font-bold text-sm transition-all"
                  style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>
                  Anuluj
                </button>
                <button type="submit" disabled={isPending}
                  className="flex-1 py-2 rounded-xl font-bold text-sm transition-all"
                  style={{ background: '#f97015', color: '#fff' }}>
                  {isPending ? 'Zapisuję...' : 'Zapisz'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List */}
      <div className="glass-card-dark overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {['Tytuł', 'Pozycja', 'Kolejność', 'Status', 'Akcje'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-black uppercase tracking-widest text-white/40">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {banners.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-white/40">
                  Brak banerów
                </td>
              </tr>
            ) : (
              banners.map(banner => (
                <tr key={banner.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {banner.imageUrl && (
                        <img src={banner.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      )}
                      <div>
                        <p className="font-bold text-white">{banner.title}</p>
                        {banner.content && <p className="text-xs text-white/40 truncate max-w-[200px]">{banner.content}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white/70">
                    {banner.position === 'offers' ? 'Oferty' : 'Strona główna'}
                  </td>
                  <td className="px-4 py-3 text-white/50">{banner.order}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(banner)}
                      className="text-xs font-bold px-2.5 py-1 rounded-full transition"
                      style={{ 
                        background: banner.active ? 'rgba(52,211,153,0.15)' : 'rgba(156,163,175,0.15)',
                        color: banner.active ? '#34d399' : '#9ca3af'
                      }}>
                      {banner.active ? 'Aktywny' : 'Nieaktywny'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(banner)}
                        className="text-xs font-bold px-3 py-1.5 rounded-xl transition"
                        style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>
                        Edytuj
                      </button>
                      <button onClick={() => handleDelete(banner.id)}
                        className="text-xs font-bold px-3 py-1.5 rounded-xl transition"
                        style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
                        Usuń
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}