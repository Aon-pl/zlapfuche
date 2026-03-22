'use client'

import { useState } from 'react'
import { updatePersonProfile } from '@/app/actions/profile'
import { changePassword, changeEmail, deleteAccount } from '@/lib/actions/accountActions'

interface Props {
  user: {
    id: string
    email: string
    phone: string | null
    personProfile: {
      id: string
      firstName: string
      lastName: string
      city: string | null
      bio: string | null
      cvUrl: string | null
      skills: string | null
      experienceYears: number
      availableFrom: Date | null
    } | null
  }
}

export default function PersonProfilePage({ user }: Props) {
  const pp = user.personProfile

  const [loading,  setLoading]  = useState(false)
  const [success,  setSuccess]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  const [pwdStatus,     setPwdStatus]     = useState<{ error?: string; success?: boolean } | null>(null)
  const [pwdPending,    setPwdPending]    = useState(false)
  const [emailStatus,   setEmailStatus]   = useState<{ error?: string; success?: boolean } | null>(null)
  const [emailPending,  setEmailPending]  = useState(false)
  const [deleteOpen,    setDeleteOpen]    = useState(false)
  const [deleteStatus,  setDeleteStatus]  = useState<{ error?: string } | null>(null)
  const [deletePending, setDeletePending] = useState(false)

  const initialSkills = pp?.skills ? JSON.parse(pp.skills) : []
  const [skillInput, setSkillInput] = useState('')
  const [skillsList, setSkillsList] = useState<string[]>(initialSkills)

  function addSkill() {
    const s = skillInput.trim()
    if (s && !skillsList.includes(s)) { setSkillsList(prev => [...prev, s]); setSkillInput('') }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true); setError(null); setSuccess(false)
    const formData = new FormData(e.currentTarget)
    formData.set('skills', JSON.stringify(skillsList))
    const result = await updatePersonProfile(formData)
    setLoading(false)
    if (result?.error) setError(result.error)
    else { setSuccess(true); setTimeout(() => setSuccess(false), 3000) }
  }

  async function handlePwd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setPwdPending(true); setPwdStatus(null)
    const result = await changePassword(new FormData(e.currentTarget))
    setPwdStatus(result); setPwdPending(false)
    if (result.success) (e.target as HTMLFormElement).reset()
  }

  async function handleEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setEmailPending(true); setEmailStatus(null)
    const result = await changeEmail(new FormData(e.currentTarget))
    setEmailStatus(result); setEmailPending(false)
    if (result.success) (e.target as HTMLFormElement).reset()
  }

  async function handleDelete(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setDeletePending(true); setDeleteStatus(null)
    const result = await deleteAccount(new FormData(e.currentTarget))
    if (result?.error) { setDeleteStatus(result); setDeletePending(false) }
  }

  const input = "w-full px-4 py-3 bg-white border border-gray-200 hover:border-gray-300 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 rounded-xl text-gray-900 placeholder-gray-400 outline-none transition-all text-sm"
  const label = "block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5"
  const card  = "bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6"

  return (
    <div style={{ background: '#FCFAF8', minHeight: '100vh' }}>

      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-white text-xl shrink-0"
              style={{ background: '#f97015' }}>
              {pp?.firstName?.[0]}{pp?.lastName?.[0]}
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900" style={{ letterSpacing: '-0.02em' }}>
                {pp ? `${pp.firstName} ${pp.lastName}` : 'Twój profil'}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>
            </div>
            <div className="ml-auto">
              <span className="text-xs font-bold px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(249,112,21,0.1)', color: '#f97015' }}>
                👤 Osoba prywatna
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">

        {/* ── PROFIL ── */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {success && (
            <div className="p-4 rounded-xl border border-green-200 bg-green-50 text-green-700 text-sm font-semibold">
              ✓ Profil został zaktualizowany
            </div>
          )}
          {error && (
            <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm">{error}</div>
          )}

          <div className={card}>
            <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ background: 'rgba(249,112,21,0.1)' }}>1</span>
              Dane osobowe
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className={label}>Imię</label><input name="firstName" defaultValue={pp?.firstName ?? ''} required className={input} /></div>
              <div><label className={label}>Nazwisko</label><input name="lastName" defaultValue={pp?.lastName ?? ''} required className={input} /></div>
              <div><label className={label}>Telefon</label><input name="phone" defaultValue={user.phone ?? ''} placeholder="+48 000 000 000" className={input} /></div>
              <div><label className={label}>Miasto</label><input name="city" defaultValue={pp?.city ?? ''} placeholder="np. Warszawa" className={input} /></div>
            </div>
          </div>

          <div className={card}>
            <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ background: 'rgba(249,112,21,0.1)' }}>2</span>
              O mnie
            </h2>
            <div className="space-y-4">
              <div>
                <label className={label}>Krótki opis</label>
                <textarea name="bio" defaultValue={pp?.bio ?? ''} rows={4}
                  placeholder="Napisz kilka słów o sobie..."
                  className={`${input} resize-none`} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={label}>Lata doświadczenia</label>
                  <input name="experienceYears" type="number" min={0} max={50} defaultValue={pp?.experienceYears ?? 0} className={input} />
                </div>
                <div>
                  <label className={label}>Dostępny od</label>
                  <input name="availableFrom" type="date"
                    defaultValue={pp?.availableFrom ? new Date(pp.availableFrom).toISOString().split('T')[0] : ''}
                    className={input} />
                </div>
              </div>
            </div>
          </div>

          <div className={card}>
            <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ background: 'rgba(249,112,21,0.1)' }}>3</span>
              Umiejętności
            </h2>
            <div className="flex gap-2 mb-4">
              <input type="text" value={skillInput} onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                placeholder="np. wózek widłowy, prawo jazdy kat. B..." className={input} />
              <button type="button" onClick={addSkill}
                className="px-4 py-3 font-bold rounded-xl text-white transition-all hover:opacity-90"
                style={{ background: '#f97015' }}>+</button>
            </div>
            {skillsList.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {skillsList.map(skill => (
                  <span key={skill} className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 border border-gray-200 text-gray-700 text-sm rounded-lg">
                    {skill}
                    <button type="button" onClick={() => setSkillsList(prev => prev.filter(s => s !== skill))}
                      className="text-gray-400 hover:text-red-500 transition-colors">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3.5 font-bold rounded-xl text-white transition-all hover:opacity-90 hover:scale-[1.01] disabled:opacity-50 text-sm"
            style={{ background: '#f97015' }}>
            {loading ? 'Zapisywanie...' : 'Zapisz profil'}
          </button>
        </form>

        {/* ── USTAWIENIA KONTA ── */}
        <div className="pt-2 space-y-4">
          <h2 className="text-lg font-black text-gray-900">Ustawienia konta</h2>

          {/* Hasło */}
          <div className={card}>
            <h3 className="font-bold text-gray-900 text-sm mb-4">🔐 Zmiana hasła</h3>
            <form onSubmit={handlePwd} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div><label className={label}>Aktualne hasło</label><input type="password" name="currentPassword" required autoComplete="current-password" className={input} /></div>
                <div><label className={label}>Nowe hasło</label><input type="password" name="newPassword" required minLength={8} autoComplete="new-password" className={input} /></div>
                <div><label className={label}>Powtórz hasło</label><input type="password" name="confirmPassword" required autoComplete="new-password" className={input} /></div>
              </div>
              {pwdStatus?.error   && <p className="text-sm text-red-600">❌ {pwdStatus.error}</p>}
              {pwdStatus?.success && <p className="text-sm text-green-600">✓ Hasło zmienione</p>}
              <button type="submit" disabled={pwdPending}
                className="px-5 py-2.5 font-bold rounded-xl text-white text-sm transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: '#f97015' }}>
                {pwdPending ? 'Zapisywanie...' : 'Zmień hasło'}
              </button>
            </form>
          </div>

          {/* Email */}
          <div className={card}>
            <h3 className="font-bold text-gray-900 text-sm mb-1">✉️ Zmiana emaila</h3>
            <p className="text-xs text-gray-400 mb-4">Aktualny: <span className="font-semibold text-gray-700">{user.email}</span></p>
            <form onSubmit={handleEmail} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><label className={label}>Nowy email</label><input type="email" name="newEmail" required autoComplete="email" className={input} /></div>
                <div><label className={label}>Potwierdź hasłem</label><input type="password" name="password" required autoComplete="current-password" className={input} /></div>
              </div>
              {emailStatus?.error   && <p className="text-sm text-red-600">❌ {emailStatus.error}</p>}
              {emailStatus?.success && <p className="text-sm text-green-600">✓ Email zmieniony. Zaloguj się ponownie.</p>}
              <button type="submit" disabled={emailPending}
                className="px-5 py-2.5 font-bold rounded-xl text-white text-sm transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: '#f97015' }}>
                {emailPending ? 'Zapisywanie...' : 'Zmień email'}
              </button>
            </form>
          </div>

          {/* Usuń konto */}
          <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-5 sm:p-6">
            <h3 className="font-bold text-red-600 text-sm mb-1">⚠️ Strefa niebezpieczna</h3>
            <p className="text-xs text-gray-500 mb-4">Usunięcie konta jest nieodwracalne.</p>
            {!deleteOpen ? (
              <button onClick={() => setDeleteOpen(true)}
                className="px-5 py-2.5 font-bold rounded-xl text-sm border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-all">
                🗑️ Usuń konto
              </button>
            ) : (
              <form onSubmit={handleDelete} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><label className={label}>Twoje hasło</label><input type="password" name="password" required autoComplete="current-password" className={`${input} border-red-200 focus:border-red-400`} /></div>
                  <div><label className={label}>Wpisz: <span className="text-gray-900 font-mono">USUŃ KONTO</span></label><input type="text" name="confirm" required placeholder="USUŃ KONTO" className={`${input} border-red-200 focus:border-red-400`} /></div>
                </div>
                {deleteStatus?.error && <p className="text-sm text-red-600">❌ {deleteStatus.error}</p>}
                <div className="flex gap-3">
                  <button type="button" onClick={() => { setDeleteOpen(false); setDeleteStatus(null) }}
                    className="px-5 py-2.5 font-bold rounded-xl text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all">
                    Anuluj
                  </button>
                  <button type="submit" disabled={deletePending}
                    className="px-5 py-2.5 font-bold rounded-xl text-sm bg-red-600 hover:bg-red-500 text-white transition-all disabled:opacity-40">
                    {deletePending ? 'Usuwanie...' : 'Potwierdź usunięcie'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
