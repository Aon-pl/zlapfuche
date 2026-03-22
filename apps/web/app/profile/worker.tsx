'use client'

import { useState } from 'react'
import { updateWorkerProfile } from '@/app/actions/profile'

interface Props {
  user: {
    id: string
    email: string
    phone: string | null
    avatarUrl: string | null
    workerProfile: {
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

export default function WorkerProfilePage({ user }: Props) {
  const wp = user.workerProfile
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const skills = wp?.skills ? JSON.parse(wp.skills) : []
  const [skillInput, setSkillInput] = useState('')
  const [skillsList, setSkillsList] = useState<string[]>(skills)

  function addSkill() {
    const s = skillInput.trim()
    if (s && !skillsList.includes(s)) {
      setSkillsList(prev => [...prev, s])
      setSkillInput('')
    }
  }

  function removeSkill(skill: string) {
    setSkillsList(prev => prev.filter(s => s !== skill))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    const formData = new FormData(e.currentTarget)
    formData.set('skills', JSON.stringify(skillsList))

    const result = await updateWorkerProfile(formData)
    setLoading(false)

    if (result?.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950">

      {/* Nagłówek */}
      <div className="bg-zinc-900/80 border-b border-zinc-800">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-2xl">
              {wp?.firstName?.[0]}{wp?.lastName?.[0]}
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">
                {wp ? `${wp.firstName} ${wp.lastName}` : 'Twój profil'}
              </h1>
              <p className="text-zinc-400 text-sm mt-0.5">{user.email}</p>
            </div>
            <div className="ml-auto">
              <span className="px-3 py-1.5 bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-xs font-semibold rounded-full">
                👷 Pracownik
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">

          {success && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm">
              ✓ Profil został zaktualizowany
            </div>
          )}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Dane osobowe */}
          <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h2 className="font-bold text-white mb-5 flex items-center gap-2">
              <span className="w-6 h-6 bg-yellow-400/10 border border-yellow-400/30 rounded-lg flex items-center justify-center text-yellow-400 text-xs">1</span>
              Dane osobowe
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Imię</label>
                <input
                  name="firstName"
                  defaultValue={wp?.firstName ?? ''}
                  required
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 hover:border-zinc-600 focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/20 rounded-xl text-white outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Nazwisko</label>
                <input
                  name="lastName"
                  defaultValue={wp?.lastName ?? ''}
                  required
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 hover:border-zinc-600 focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/20 rounded-xl text-white outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Telefon</label>
                <input
                  name="phone"
                  defaultValue={user.phone ?? ''}
                  placeholder="+48 000 000 000"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 hover:border-zinc-600 focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/20 rounded-xl text-white placeholder-zinc-600 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Miasto</label>
                <input
                  name="city"
                  defaultValue={wp?.city ?? ''}
                  placeholder="np. Warszawa"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 hover:border-zinc-600 focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/20 rounded-xl text-white placeholder-zinc-600 outline-none transition-all"
                />
              </div>
            </div>
          </section>

          {/* O mnie */}
          <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h2 className="font-bold text-white mb-5 flex items-center gap-2">
              <span className="w-6 h-6 bg-yellow-400/10 border border-yellow-400/30 rounded-lg flex items-center justify-center text-yellow-400 text-xs">2</span>
              O mnie
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Krótki opis</label>
                <textarea
                  name="bio"
                  defaultValue={wp?.bio ?? ''}
                  rows={4}
                  placeholder="Napisz kilka słów o sobie, swoim doświadczeniu i tym czego szukasz..."
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 hover:border-zinc-600 focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/20 rounded-xl text-white placeholder-zinc-600 outline-none transition-all resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Lata doświadczenia</label>
                  <input
                    name="experienceYears"
                    type="number"
                    min={0}
                    max={50}
                    defaultValue={wp?.experienceYears ?? 0}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 hover:border-zinc-600 focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/20 rounded-xl text-white outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Dostępny od</label>
                  <input
                    name="availableFrom"
                    type="date"
                    defaultValue={wp?.availableFrom ? new Date(wp.availableFrom).toISOString().split('T')[0] : ''}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 hover:border-zinc-600 focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/20 rounded-xl text-white outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Umiejętności */}
          <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h2 className="font-bold text-white mb-5 flex items-center gap-2">
              <span className="w-6 h-6 bg-yellow-400/10 border border-yellow-400/30 rounded-lg flex items-center justify-center text-yellow-400 text-xs">3</span>
              Umiejętności
            </h2>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                placeholder="np. wózek widłowy, prawo jazdy kat. B..."
                className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 hover:border-zinc-600 focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/20 rounded-xl text-white placeholder-zinc-600 outline-none transition-all"
              />
              <button
                type="button"
                onClick={addSkill}
                className="px-4 py-3 bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-bold rounded-xl transition-all"
              >
                +
              </button>
            </div>

            {skillsList.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {skillsList.map(skill => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="text-zinc-500 hover:text-red-400 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* Zapisz */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3.5 bg-yellow-400 hover:bg-yellow-300 disabled:bg-yellow-400/50 text-zinc-950 font-bold rounded-xl transition-all duration-200 hover:scale-[1.02] disabled:scale-100"
            >
              {loading ? 'Zapisywanie...' : 'Zapisz profil'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
