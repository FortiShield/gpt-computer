import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function maskSensitiveData(text: string): string {
  const patterns = [
    { regex: /sk_[a-z0-9]+/gi, replace: 'sk_***' },
    { regex: /token=[a-z0-9]+/gi, replace: 'token=***' },
    { regex: /password=[^&\s]+/gi, replace: 'password=***' },
    { regex: /api[_-]?key=[a-z0-9]+/gi, replace: 'api_key=***' },
  ]

  let masked = text
  for (const { regex, replace } of patterns) {
    masked = masked.replace(regex, replace)
  }
  return masked
}

export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const milliseconds = ms % 1000
  return `${seconds}s ${milliseconds}ms`
}

export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`
}

export function formatTimestamp(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
