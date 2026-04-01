export interface MFCompanyData {
  name: string
  nip: string
  statusVat: string
  regon: string
  krs: string | null
  residenceAddress: string | null
  workingAddress: string | null
  registrationLegalDate: string | null
  accountNumbers: string[]
  hasVirtualAccounts: boolean
}

interface MFResponse {
  subject?: MFCompanyData
  result?: { subject?: MFCompanyData }
  code?: string
  message?: string
}

export async function searchCompanyByNIP(nip: string): Promise<MFCompanyData | null> {
  const today = new Date()
  const day = String(today.getDate()).padStart(2, '0')
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const year = today.getFullYear()
  const date = `${year}-${month}-${day}`
  
  const url = `https://wl-api.mf.gov.pl/api/search/nip/${nip}?date=${date}`

  try {
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
      return null
    }

    const data: MFResponse = await response.json()

    if (data.code) {
      console.warn(`MF API code: ${data.code} - ${data.message}`)
      return null
    }

    const subject = data.result?.subject || data.subject

    if (!subject) {
      console.warn('No subject in MF response')
      return null
    }

    return subject
  } catch (error) {
    console.error('MF API error:', error)
    return null
  }
}

export async function verifyNIP(nip: string): Promise<boolean> {
  const result = await searchCompanyByNIP(nip)
  return result !== null
}
