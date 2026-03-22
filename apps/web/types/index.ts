export const CATEGORY_LABELS: Record<string, string> = {
  warehouse:      'Magazyn',
  construction:   'Budowlanka',
  hospitality:    'Gastronomia',
  transport:      'Transport',
  retail:         'Handel',
  manufacturing:  'Produkcja',
  cleaning:       'Sprzątanie',
  office:         'Biuro',
  other:          'Inne',
}

export const CATEGORY_ICONS: Record<string, string> = {
  warehouse:      '📦',
  construction:   '🏗️',
  hospitality:    '🍽️',
  transport:      '🚛',
  retail:         '🛒',
  manufacturing:  '⚙️',
  cleaning:       '🧹',
  office:         '💼',
  other:          '🔧',
}

export const SALARY_TYPE_LABELS: Record<string, string> = {
  hourly:  'h',
  daily:   'dzień',
  monthly: 'mies.',
}

export type JobStatus = 'active' | 'inactive' | 'draft' | 'expired'
export type ApplicationStatus = 'pending' | 'reviewed' | 'accepted' | 'rejected'
export type UserRole = 'worker' | 'employer'
export type SalaryType = 'hourly' | 'daily' | 'monthly'
