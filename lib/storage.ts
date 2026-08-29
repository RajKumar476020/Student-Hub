import fs from 'fs/promises'
import fsSync from 'fs'
import path from 'path'
import os from 'os'
import { randomUUID } from 'crypto'

export function getStorageDir(): string {
  // On Vercel / serverless / production environments, the filesystem is STRICTLY read-only except /tmp
  // Even if LOCAL_STORAGE_PATH="./uploads" is set in Vercel environment variables, override it to /tmp
  if (
    process.env.VERCEL === '1' ||
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.NODE_ENV === 'production'
  ) {
    return path.join(os.tmpdir(), 'studyhub_uploads')
  }

  // If explicitly configured for local development
  if (process.env.LOCAL_STORAGE_PATH) {
    return path.isAbsolute(process.env.LOCAL_STORAGE_PATH)
      ? process.env.LOCAL_STORAGE_PATH
      : path.join(process.cwd(), process.env.LOCAL_STORAGE_PATH)
  }

  // Local development fallback
  return path.join(process.cwd(), 'uploads')
}

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
  const storageDir = getStorageDir()
  const fullPath = path.join(storageDir, key)

  await ensureDir(storageDir)
  await fs.writeFile(fullPath, buffer)

  return key
}

export async function deleteFile(storageKey: string): Promise<void> {
  try {
    const storageDir = getStorageDir()
    const fullPath = path.join(storageDir, storageKey)
    await fs.unlink(fullPath)
  } catch {
    // Ignore if file doesn't exist
  }
}

export async function getFileBuffer(storageKey: string): Promise<Buffer> {
  const storageDir = getStorageDir()
  const fullPath = path.join(storageDir, storageKey)
  return fs.readFile(fullPath)
}

export function fileExists(storageKey: string): boolean {
  const storageDir = getStorageDir()
  const fullPath = path.join(storageDir, storageKey)
  return fsSync.existsSync(fullPath)
}

export function getFilePath(storageKey: string): string {
  const storageDir = getStorageDir()
  return path.join(storageDir, storageKey)
}

export function getFileUrl(storageKey: string): string {
  return `/api/files/serve/${storageKey}`
}
