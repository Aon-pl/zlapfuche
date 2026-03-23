'use client'

interface StarRatingProps {
  value: number        // 0-5, może być ułamkowe (np. 4.3)
  onChange?: (v: number) => void  // jeśli podane — tryb interaktywny
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
}

const SIZES = { sm: 'text-base', md: 'text-xl', lg: 'text-2xl' }

export default function StarRating({ value, onChange, size = 'md', showValue = false }: StarRatingProps) {
  const interactive = !!onChange

  return (
    <span className="inline-flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => {
        const filled = star <= Math.round(value)
        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => onChange?.(star)}
            className={`${SIZES[size]} leading-none transition-transform ${
              interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
            } ${filled ? 'text-yellow-400' : 'text-gray-300'}`}
          >
            ★
          </button>
        )
      })}
      {showValue && value > 0 && (
        <span className="text-sm font-semibold text-gray-600 ml-1">{value.toFixed(1)}</span>
      )}
    </span>
  )
}
