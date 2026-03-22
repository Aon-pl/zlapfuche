import Link from 'next/link'

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
      <div className="text-center max-w-md">

        <div className="w-24 h-24 bg-yellow-400/10 border-2 border-yellow-400/30 rounded-3xl flex items-center justify-center mx-auto mb-8">
          <span className="text-5xl">✉️</span>
        </div>

        <h1 className="text-2xl font-black text-slate-800 mb-3">
          Sprawdź swoją skrzynkę
        </h1>
        <p className="text-slate-500 mb-2 leading-relaxed">
          Wysłaliśmy link weryfikacyjny na Twój adres email.
        </p>
        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
          Kliknij link w emailu, aby aktywować konto. Link wygasa po <strong className="text-slate-600">24 godzinach</strong>.
        </p>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 text-left mb-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Nie dostałeś emaila?</p>
          <ul className="text-sm text-slate-500 space-y-1.5">
            <li>· Sprawdź folder SPAM / Oferty</li>
            <li>· Poczekaj kilka minut</li>
            <li>· Sprawdź czy wpisałeś poprawny email</li>
          </ul>
        </div>

        <div className="flex items-center justify-center gap-3">
          <Link href="/login"
            className="px-6 py-3 bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-bold rounded-xl transition-all hover:scale-105 text-sm">
            Przejdź do logowania
          </Link>
          <Link href="/register"
            className="px-6 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-xl transition-all text-sm">
            Zmień email
          </Link>
        </div>
      </div>
    </div>
  )
}
