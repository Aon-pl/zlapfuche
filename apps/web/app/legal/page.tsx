'use client'

import { useState } from 'react'
import Link from 'next/link'

const LAST_UPDATED = '1 marca 2026'
const COMPANY      = 'PracaTymczasowa'
const EMAIL        = 'kontakt@pracatymczasowa.pl'
const ADDRESS      = 'ul. Przykładowa 1, 00-001 Warszawa'

type Tab = 'terms' | 'privacy'

export default function LegalPage() {
  const [tab, setTab] = useState<Tab>('terms')

  const tabBtn = (t: Tab, label: string) => (
    <button onClick={() => setTab(t)}
      className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
        tab === t ? 'text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'
      }`}
      style={tab === t ? { background: '#f97015' } : {}}>
      {label}
    </button>
  )

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="space-y-3">
      <h2 className="text-lg font-black text-gray-900" style={{ letterSpacing: '-0.01em' }}>{title}</h2>
      <div className="text-sm text-gray-600 leading-relaxed space-y-2">{children}</div>
    </section>
  )

  return (
    <div style={{ background: '#FCFAF8', minHeight: '100vh' }}>

      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-orange-500 transition-colors mb-5">
            ← Strona główna
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2" style={{ letterSpacing: '-0.02em' }}>
            Dokumenty prawne
          </h1>
          <p className="text-sm text-gray-500">Ostatnia aktualizacja: {LAST_UPDATED}</p>

          {/* Zakładki */}
          <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mt-6 w-fit">
            {tabBtn('terms',   '📋 Regulamin')}
            {tabBtn('privacy', '🔒 Polityka prywatności')}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-10 space-y-8">

          {/* ── REGULAMIN ── */}
          {tab === 'terms' && (
            <>
              <div className="pb-4 border-b border-gray-100">
                <h2 className="text-xl font-black text-gray-900">Regulamin serwisu {COMPANY}</h2>
                <p className="text-sm text-gray-500 mt-1">Obowiązuje od {LAST_UPDATED}</p>
              </div>

              <Section title="§1. Postanowienia ogólne">
                <p>Niniejszy Regulamin określa zasady korzystania z serwisu internetowego {COMPANY}, dostępnego pod adresem pracatymczasowa.pl.</p>
                <p>Operatorem serwisu jest firma {COMPANY} z siedzibą pod adresem: {ADDRESS}.</p>
                <p>Korzystanie z serwisu oznacza akceptację niniejszego Regulaminu w całości. Jeśli nie zgadzasz się z jego postanowieniami, prosimy o opuszczenie serwisu.</p>
              </Section>

              <Section title="§2. Definicje">
                <p><strong>Serwis</strong> — platforma internetowa {COMPANY} dostępna pod adresem pracatymczasowa.pl.</p>
                <p><strong>Użytkownik</strong> — każda osoba fizyczna lub prawna korzystająca z serwisu.</p>
                <p><strong>Pracownik</strong> — użytkownik zarejestrowany jako osoba prywatna poszukująca pracy.</p>
                <p><strong>Pracodawca</strong> — użytkownik zarejestrowany jako firma publikująca oferty pracy.</p>
                <p><strong>Oferta pracy</strong> — ogłoszenie opublikowane przez Pracodawcę lub Pracownika dotyczące zatrudnienia.</p>
              </Section>

              <Section title="§3. Rejestracja i konto użytkownika">
                <p>Korzystanie z pełnej funkcjonalności serwisu wymaga rejestracji i utworzenia konta.</p>
                <p>Rejestracja jest bezpłatna dla wszystkich użytkowników. Użytkownik zobowiązany jest podać prawdziwe dane osobowe.</p>
                <p>Użytkownik ponosi pełną odpowiedzialność za działania wykonywane za pośrednictwem swojego konta.</p>
                <p>Zabrania się udostępniania danych logowania osobom trzecim. W przypadku podejrzenia nieautoryzowanego dostępu do konta, Użytkownik zobowiązany jest niezwłocznie poinformować Operatora.</p>
                <p>Operator zastrzega sobie prawo do zawieszenia lub usunięcia konta w przypadku naruszenia Regulaminu.</p>
              </Section>

              <Section title="§4. Zasady publikowania ofert">
                <p>Oferty pracy muszą być zgodne z obowiązującym prawem polskim i przepisami Unii Europejskiej.</p>
                <p>Zabrania się publikowania ofert zawierających treści dyskryminujące, obraźliwe lub naruszające dobra osobiste.</p>
                <p>Operator zastrzega sobie prawo do usunięcia ofert naruszających Regulamin bez wcześniejszego powiadomienia.</p>
                <p>Użytkownik publikujący ofertę oświadcza, że posiada wszelkie niezbędne uprawnienia do jej zamieszczenia.</p>
                <p>Oferty pracy wygasają automatycznie po 30 dniach od daty publikacji, chyba że Użytkownik wcześniej je usunie lub przedłuży.</p>
              </Section>

              <Section title="§5. Odpowiedzialność">
                <p>Operator nie ponosi odpowiedzialności za treść ofert publikowanych przez Użytkowników.</p>
                <p>Operator nie pośredniczy w nawiązywaniu stosunku pracy i nie jest stroną umów zawieranych między Pracownikami a Pracodawcami.</p>
                <p>Operator dołoży wszelkich starań, aby serwis był dostępny przez 24 godziny na dobę, 7 dni w tygodniu, jednak nie gwarantuje ciągłości działania serwisu.</p>
                <p>Operator nie ponosi odpowiedzialności za szkody wynikłe z braku dostępu do serwisu lub utraty danych.</p>
              </Section>

              <Section title="§6. Prawa autorskie">
                <p>Wszelkie elementy graficzne, teksty, logotypy i inne materiały zamieszczone w serwisie przez Operatora są chronione prawem autorskim.</p>
                <p>Użytkownik publikując treści w serwisie udziela Operatorowi niewyłącznej, nieodpłatnej licencji na ich wykorzystanie w celu świadczenia usług.</p>
                <p>Zabrania się kopiowania, modyfikowania lub rozpowszechniania materiałów serwisu bez pisemnej zgody Operatora.</p>
              </Section>

              <Section title="§7. Zmiana regulaminu">
                <p>Operator zastrzega sobie prawo do zmiany niniejszego Regulaminu w dowolnym czasie.</p>
                <p>O zmianach Regulaminu Użytkownicy zostaną poinformowani drogą mailową lub poprzez komunikat w serwisie z co najmniej 14-dniowym wyprzedzeniem.</p>
                <p>Dalsze korzystanie z serwisu po wejściu w życie zmian oznacza ich akceptację.</p>
              </Section>

              <Section title="§8. Postanowienia końcowe">
                <p>Niniejszy Regulamin podlega prawu polskiemu.</p>
                <p>Wszelkie spory wynikłe z korzystania z serwisu będą rozstrzygane przez właściwy sąd polski.</p>
                <p>W sprawach nieuregulowanych niniejszym Regulaminem zastosowanie mają przepisy Kodeksu Cywilnego oraz innych właściwych ustaw.</p>
                <p>Kontakt z Operatorem: <a href={`mailto:${EMAIL}`} className="font-semibold hover:underline" style={{ color: '#f97015' }}>{EMAIL}</a></p>
              </Section>
            </>
          )}

          {/* ── POLITYKA PRYWATNOŚCI ── */}
          {tab === 'privacy' && (
            <>
              <div className="pb-4 border-b border-gray-100">
                <h2 className="text-xl font-black text-gray-900">Polityka prywatności {COMPANY}</h2>
                <p className="text-sm text-gray-500 mt-1">Obowiązuje od {LAST_UPDATED} · zgodna z RODO</p>
              </div>

              <Section title="1. Administrator danych osobowych">
                <p>Administratorem Twoich danych osobowych jest {COMPANY} z siedzibą pod adresem: {ADDRESS}.</p>
                <p>W sprawach dotyczących ochrony danych osobowych możesz skontaktować się z nami pod adresem e-mail: <a href={`mailto:${EMAIL}`} className="font-semibold hover:underline" style={{ color: '#f97015' }}>{EMAIL}</a></p>
              </Section>

              <Section title="2. Jakie dane zbieramy">
                <p>W zależności od typu konta zbieramy następujące dane:</p>
                <p><strong>Konto osoby prywatnej:</strong> imię, nazwisko, adres e-mail, numer telefonu, miasto zamieszkania, informacje o doświadczeniu zawodowym, umiejętnościach i dostępności.</p>
                <p><strong>Konto firmy:</strong> nazwa firmy, NIP, adres siedziby, adres e-mail, numer telefonu, opis działalności.</p>
                <p><strong>Dane techniczne:</strong> adres IP, typ przeglądarki, system operacyjny, strony odwiedzone w serwisie, czas wizyty.</p>
              </Section>

              <Section title="3. Cel i podstawa przetwarzania danych">
                <p><strong>Wykonanie umowy (art. 6 ust. 1 lit. b RODO)</strong> — świadczenie usług serwisu, obsługa konta, umożliwienie kontaktu między Pracownikami a Pracodawcami.</p>
                <p><strong>Prawnie uzasadniony interes (art. 6 ust. 1 lit. f RODO)</strong> — zapewnienie bezpieczeństwa serwisu, wykrywanie nadużyć, marketing bezpośredni własnych usług.</p>
                <p><strong>Zgoda (art. 6 ust. 1 lit. a RODO)</strong> — wysyłka newslettera i powiadomień marketingowych (jeśli wyraziłeś zgodę).</p>
                <p><strong>Obowiązek prawny (art. 6 ust. 1 lit. c RODO)</strong> — wystawianie faktur, przechowywanie dokumentacji finansowej.</p>
              </Section>

              <Section title="4. Czas przechowywania danych">
                <p>Dane konta przechowujemy przez czas trwania umowy (aktywnego konta) oraz przez 3 lata po jej zakończeniu w celach ewentualnych roszczeń.</p>
                <p>Dane dotyczące rozliczeń przechowujemy przez 5 lat zgodnie z przepisami podatkowymi.</p>
                <p>Dane techniczne (logi) przechowujemy przez 12 miesięcy.</p>
              </Section>

              <Section title="5. Odbiorcy danych">
                <p>Twoje dane mogą być przekazywane:</p>
                <p><strong>Innym użytkownikom serwisu</strong> — dane widoczne w profilu publicznym (imię, miasto, umiejętności) są dostępne dla zalogowanych użytkowników.</p>
                <p><strong>Dostawcom usług</strong> — firmom świadczącym usługi hostingowe, poczty e-mail i analizy danych, z którymi zawarliśmy umowy powierzenia przetwarzania.</p>
                <p><strong>Organom publicznym</strong> — wyłącznie na podstawie obowiązujących przepisów prawa.</p>
                <p>Nie sprzedajemy Twoich danych osobowych podmiotom trzecim.</p>
              </Section>

              <Section title="6. Twoje prawa">
                <p>Zgodnie z RODO przysługują Ci następujące prawa:</p>
                <p><strong>Prawo dostępu</strong> — możesz żądać informacji o przetwarzanych danych.</p>
                <p><strong>Prawo do sprostowania</strong> — możesz żądać poprawienia nieprawidłowych danych.</p>
                <p><strong>Prawo do usunięcia</strong> — możesz żądać usunięcia danych („prawo do bycia zapomnianym").</p>
                <p><strong>Prawo do ograniczenia przetwarzania</strong> — możesz żądać ograniczenia przetwarzania danych.</p>
                <p><strong>Prawo do przenoszenia</strong> — możesz otrzymać swoje dane w ustrukturyzowanym formacie.</p>
                <p><strong>Prawo sprzeciwu</strong> — możesz sprzeciwić się przetwarzaniu danych na podstawie prawnie uzasadnionego interesu.</p>
                <p>Aby skorzystać z powyższych praw, skontaktuj się z nami pod adresem: <a href={`mailto:${EMAIL}`} className="font-semibold hover:underline" style={{ color: '#f97015' }}>{EMAIL}</a></p>
                <p>Masz również prawo wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych (UODO).</p>
              </Section>

              <Section title="7. Pliki cookies">
                <p>Serwis wykorzystuje pliki cookies (ciasteczka) w celu zapewnienia prawidłowego działania serwisu, zapamiętania sesji logowania oraz analizy ruchu.</p>
                <p><strong>Cookies niezbędne</strong> — wymagane do działania serwisu, nie wymagają zgody.</p>
                <p><strong>Cookies analityczne</strong> — pomagają nam zrozumieć, jak użytkownicy korzystają z serwisu. Możesz je wyłączyć w ustawieniach przeglądarki.</p>
                <p>Możesz zablokować pliki cookies w ustawieniach swojej przeglądarki, jednak może to wpłynąć na funkcjonalność serwisu.</p>
              </Section>

              <Section title="8. Bezpieczeństwo danych">
                <p>Stosujemy odpowiednie środki techniczne i organizacyjne zapewniające bezpieczeństwo Twoich danych osobowych, w tym szyfrowanie połączeń (SSL/TLS), kontrolę dostępu do danych oraz regularne tworzenie kopii zapasowych.</p>
                <p>Hasła użytkowników są przechowywane w postaci zaszyfrowanej (hash) i nie są znane nawet administratorom serwisu.</p>
              </Section>

              <Section title="9. Zmiany polityki prywatności">
                <p>Zastrzegamy sobie prawo do zmiany niniejszej Polityki prywatności. O istotnych zmianach poinformujemy Cię drogą mailową lub poprzez komunikat w serwisie.</p>
                <p>Aktualna wersja Polityki prywatności jest zawsze dostępna pod adresem pracatymczasowa.pl/legal.</p>
              </Section>
            </>
          )}

          {/* Footer dokumentu */}
          <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="text-xs text-gray-400">
              Ostatnia aktualizacja: {LAST_UPDATED} · {COMPANY}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setTab('terms')}
                className={`text-xs font-semibold hover:underline ${tab === 'terms' ? '' : 'text-gray-400'}`}
                style={tab === 'terms' ? { color: '#f97015' } : {}}>
                Regulamin
              </button>
              <span className="text-gray-300">·</span>
              <button onClick={() => setTab('privacy')}
                className={`text-xs font-semibold hover:underline ${tab === 'privacy' ? '' : 'text-gray-400'}`}
                style={tab === 'privacy' ? { color: '#f97015' } : {}}>
                Polityka prywatności
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
