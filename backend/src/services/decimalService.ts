import { Decimal } from '@prisma/client/runtime/library'

export function convertDecimals(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(convertDecimals)
  } else if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        key,
        value instanceof Decimal ? value.toNumber() : convertDecimals(value),
      ])
    )
  }
  return obj
}
