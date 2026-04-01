import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  host: process.env.JOB_SCRAPER_DB_HOST || '127.0.0.1',
  port: parseInt(process.env.JOB_SCRAPER_DB_PORT || '3306'),
  user: process.env.JOB_SCRAPER_DB_USER || 'root',
  password: process.env.JOB_SCRAPER_DB_PASSWORD || '',
  database: 'job_scraper',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

export interface OlxOffer {
  id: number
  title: string
  description: string | null
  location: string | null
  salary: string | null
  url: string
  source: string
  posted_at: Date | null
  job_date: Date | null
  work_time: string | null
  phone: string | null
  created_at: Date
}

export interface ExternalOfferFormatted {
  id: string
  isExternal: true
  source: string
  externalUrl: string
  title: string
  description: string | null
  city: string | null
  salary: string | null
  createdAt: Date
  location: string | null
  work_time: string | null
}

export async function getExternalOffers(params: {
  page?: number
  limit?: number
  search?: string
  location?: string
}) {
  const { page = 1, limit = 20, search, location } = params
  const offset = (page - 1) * limit

  let whereClause = ''
  const queryParams: (string | number)[] = []

  if (search) {
    whereClause = 'WHERE (title LIKE ? OR description LIKE ?)'
    const searchPattern = `%${search}%`
    queryParams.push(searchPattern, searchPattern)
  }

  if (location) {
    whereClause += whereClause ? ' AND location LIKE ?' : 'WHERE location LIKE ?'
    queryParams.push(`%${location}%`)
  }

  const countQuery = `SELECT COUNT(*) as total FROM job_offers ${whereClause}`
  const dataQuery = `SELECT * FROM job_offers ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`

  const [countResult] = await pool.query<mysql.RowDataPacket[]>(countQuery, queryParams)
  const total = countResult[0]?.total || 0

  const [rows] = await pool.query<mysql.RowDataPacket[]>(dataQuery, [...queryParams, limit, offset])

  return {
    offers: rows as OlxOffer[],
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export async function getAllExternalOffers(params?: {
  search?: string
  location?: string
  limit?: number
}): Promise<ExternalOfferFormatted[]> {
  const { search, location, limit = 1000 } = params || {}

  let whereClause = ''
  const queryParams: (string | number)[] = []

  if (search) {
    whereClause = 'WHERE (title LIKE ? OR description LIKE ?)'
    queryParams.push(`%${search}%`, `%${search}%`)
  }

  if (location) {
    whereClause += whereClause ? ' AND location LIKE ?' : 'WHERE location LIKE ?'
    queryParams.push(`%${location}%`)
  }

  const dataQuery = `SELECT * FROM job_offers ${whereClause} ORDER BY created_at DESC LIMIT ?`
  const [rows] = await pool.query<mysql.RowDataPacket[]>(dataQuery, [...queryParams, limit])

  return (rows as OlxOffer[]).map(offer => ({
    id: `ext_${offer.id}`,
    isExternal: true as const,
    source: offer.source,
    externalUrl: offer.url,
    title: offer.title,
    description: offer.description,
    city: offer.location,
    salary: offer.salary,
    createdAt: offer.created_at,
    location: offer.location,
    work_time: offer.work_time,
  }))
}

export async function getExternalOfferById(id: number): Promise<OlxOffer | null> {
  const [rows] = await pool.query<mysql.RowDataPacket[]>(
    'SELECT * FROM job_offers WHERE id = ? LIMIT 1',
    [id]
  )
  return rows.length > 0 ? (rows[0] as OlxOffer) : null
}

export default pool
