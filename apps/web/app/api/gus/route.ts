import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { nip } = await request.json()

    if (!nip || !/^\d{10}$/.test(nip)) {
      return NextResponse.json({ error: 'NIP musi mieć 10 cyfr' }, { status: 400 })
    }

    const today = new Date()
    const day = String(today.getDate()).padStart(2, '0')
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const year = today.getFullYear()
    const date = `${year}-${month}-${day}`
    
    const url = `https://wl-api.mf.gov.pl/api/search/nip/${nip}?date=${date}`

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!response.ok) {
      console.error(`MF API HTTP error: ${response.status}`)
      return NextResponse.json({ error: 'Błąd komunikacji z MF API' }, { status: 500 })
    }

    const data = await response.json()

    if (data.code) {
      return NextResponse.json({ error: data.message || 'Błąd API' }, { status: 404 })
    }

    const subject = data.result?.subject || data.subject

    if (!subject) {
      console.warn('No subject in response:', JSON.stringify(data).substring(0, 200))
      return NextResponse.json({ error: 'Nie znaleziono firmy o tym NIP' }, { status: 404 })
    }

    return NextResponse.json(subject)
  } catch (error) {
    console.error('[GUS] Error:', error)
    return NextResponse.json({ 
      error: 'Błąd połączenia z MF API',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
