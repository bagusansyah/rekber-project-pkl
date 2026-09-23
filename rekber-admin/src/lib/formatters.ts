import { format, isValid } from "date-fns"
import { id as idLocale } from "date-fns/locale"

export const EMPTY_VALUE = "-"

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export function normalizeDateValue(value: unknown): Date | null {
  if (!value) return null

  if (value instanceof Date) {
    return isValid(value) ? value : null
  }

  if (typeof value === "string") {
    const parsed = DATE_ONLY_PATTERN.test(value)
      ? new Date(`${value}T00:00:00`)
      : new Date(value)

    return isValid(parsed) ? parsed : null
  }

  if (typeof value === "number") {
    const parsed = new Date(value)
    return isValid(parsed) ? parsed : null
  }

  return null
}

export function formatShortIndonesianDate(value: unknown): string {
  const date = normalizeDateValue(value)
  if (!date) return EMPTY_VALUE

  return format(date, "dd MMM yyyy", { locale: idLocale })
}

export function formatDateForApi(value: Date | null): string | null {
  if (!value) return null

  return format(value, "yyyy-MM-dd")
}

export function getPartnershipExpirationValue(source: Record<string, any> | null | undefined): string | null {
  if (!source) return null

  return (
    source.partnership_expires_at ??
    source.partnership_expiration_date ??
    source.partnership_expiration ??
    source.partnership_expiration_at ??
    source.partnership_expired_at ??
    null
  )
}

export function isPartnershipValue(value: unknown): boolean {
  if (value === true || value === 1) return true
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase()
    return normalized === "true" || normalized === "1" || normalized === "yes"
  }

  return false
}
