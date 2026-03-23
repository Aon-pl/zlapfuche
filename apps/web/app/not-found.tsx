import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6" style={{ background: '#FCFAF8' }}>
      <div className="text-center max-w-md">
        <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8"
          style={{ background: 'rgba(249,112,21,0.1)' }}>
          <span className="text-5xl">🔍</span>
        </div>
        <p className="text-8xl font-black text-gray-100 mb-2" style={{ letterSpacing: '-0.04em' }}>404</p>
        <h1 className="text-2xl font-black text-gray-900 mb-3">Strona nie istnieje</h1>
        <p className="text-gray-500 mb-8 leading-relaxed text-sm">
          Szukana strona mogła zostać usunięta, przeniesiona lub nigdy nie istniała.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/"
            className="px-6 py-3 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90 hover:scale-105"
            style={{ background: '#f97015' }}>
            Strona główna
          </Link>
          <Link href="/offers"
            className="px-6 py-3 rounded-xl font-bold text-gray-700 bg-white border border-gray-200 hover:border-orange-300 transition-all text-sm">
            Przeglądaj oferty
          </Link>
        </div>
      </div>
    </div>
  )
}
