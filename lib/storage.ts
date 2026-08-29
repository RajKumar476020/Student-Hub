import fs from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'

const STORAGE_PATH = process.env.LOCAL_STORAGE_PATH || './uploads'

async function ensureDir(dirPath: string) {
  await fs.mkdir(dirPath, { recursive: true })
}

export async function uploadFile(
  buffer: Buffer,
  originalName: string,
  mimeType: string
): Promise<string> {
  const ext = originalName.split('.').pop() || 'bin'
  const key = `${randomUUID()}.${ext}`
  const fullPath = path.join(process.cwd(), STORAGE_PATH, key)

  await ensureDir(path.join(process.cwd(), STORAGE_PATH))
  await fs.writeFile(fullPath, buffer)

  return key
}

export async function deleteFile(storageKey: string): Promise<void> {
  try {
    const fullPath = path.join(process.cwd(), STORAGE_PATH, storageKey)
    await fs.unlink(fullPath)
  } catch {
    // Ignore if file doesn't exist
  }
}

export async function getFileBuffer(storageKey: string): Promise<Buffer> {
  const fullPath = path.join(process.cwd(), STORAGE_PATH, storageKey)
  return fs.readFile(fullPath)
}

export function getFileUrl(storageKey: string): string {
  return `/api/files/serve/${storageKey}`
}
