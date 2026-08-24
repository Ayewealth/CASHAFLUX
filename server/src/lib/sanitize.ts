export function sanitizeText(value: string): string {
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/[<>]/g, '')
    .trim()
}

export function sanitizeObject<T extends Record<string, unknown>>(obj: T, fields: (keyof T)[]): T {
  const result = { ...obj }
  for (const field of fields) {
    if (typeof result[field] === 'string') {
      result[field] = sanitizeText(result[field] as string) as T[keyof T]
    }
  }
  return result
}