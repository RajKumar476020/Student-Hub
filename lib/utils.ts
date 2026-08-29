import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), 'MMM d, yyyy')
}

export function formatRelativeTime(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function formatBytes(bytes: number | bigint): string {
  const b = typeof bytes === 'bigint' ? Number(bytes) : bytes
  if (b === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(b) / Math.log(k))
  return `${parseFloat((b / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return n.toString()
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function generateUniqueSlug(title: string, username: string): string {
  const base = `${username}-${slugify(title)}`
  const suffix = Math.random().toString(36).substring(2, 7)
  return `${base}-${suffix}`
}

export function getFileIcon(mimeType: string): string {
  if (mimeType === 'application/pdf') return '📄'
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝'
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📊'
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return '📈'
  if (mimeType.startsWith('image/')) return '🖼️'
  if (mimeType === 'text/plain') return '📃'
  if (mimeType === 'text/markdown') return '📋'
  return '📁'
}

export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || ''
}

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/png',
  'image/jpeg',
  'image/webp',
  'text/plain',
  'text/markdown',
]

export const ALLOWED_EXTENSIONS = ['pdf', 'docx', 'pptx', 'xlsx', 'png', 'jpg', 'jpeg', 'webp', 'txt', 'md']

export const MAX_FILE_SIZE = (Number(process.env.MAX_FILE_SIZE_MB) || 25) * 1024 * 1024

export const SUBJECT_TAGS = [
  'Physics',
  'Chemistry',
  'Mathematics',
  'Biology',
  'Computer Science',
  'English',
  'History',
  'Geography',
  'Economics',
  'Political Science',
  'JEE',
  'NEET',
  'UPSC',
  'Class 12',
  'Class 11',
  'Class 10',
  'Engineering',
  'Medical',
  'Commerce',
  'Arts',
  'Other',
]

export const NOTEBOOK_COLORS = [
  '#6D28D9', // Violet
  '#2563EB', // Blue
  '#059669', // Emerald
  '#D97706', // Amber
  '#DC2626', // Red
  '#7C3AED', // Purple
  '#0891B2', // Cyan
  '#65A30D', // Lime
  '#9333EA', // Fuchsia
  '#EA580C', // Orange
  '#BE185D', // Pink
  '#0D9488', // Teal
]

export const PROFANITY_WORDS: string[] = []

export function filterProfanity(text: string): boolean {
  const lower = text.toLowerCase()
  return PROFANITY_WORDS.some((word) => lower.includes(word))
}
