import { writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { existsSync } from 'node:fs'
import { randomUUID } from 'crypto'

// ─── Media type IDs (must match media_types table) ───────────────────────────
export const MEDIA_TYPE = {
    IMAGE: 1,
    VIDEO: 2,
    DOCUMENT: 3,
    AUDIO: 4,
} as const

// ─── Accepted MIME types grouped by category ─────────────────────────────────
export const ACCEPTED_CHAT_TYPES = [
    // Images
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    // Videos
    'video/mp4',
    'video/webm',
    'video/quicktime',
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    // Audio
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
] as const

/** Accept string suitable for <input type="file" accept="..."> */
export const ACCEPT_ATTR =
    'image/*,video/mp4,video/webm,video/quicktime,audio/*,.pdf,.doc,.docx,.xls,.xlsx'

/** Max allowed file size in bytes (100 MB) */
export const MAX_FILE_SIZE = 100 * 1024 * 1024

/**
 * Determine the media_type ID for a given MIME type.
 * Falls back to DOCUMENT (3) for unknown types.
 */
export function getMimeTypeId(mimeType: string): number {
    if (mimeType.startsWith('image/')) return MEDIA_TYPE.IMAGE
    if (mimeType.startsWith('video/')) return MEDIA_TYPE.VIDEO
    if (mimeType.startsWith('audio/')) return MEDIA_TYPE.AUDIO
    return MEDIA_TYPE.DOCUMENT
}

/**
 * Save any uploaded file to the public/<folder> directory.
 * Returns the generated filename, or null on failure.
 */
export async function saveFile(
    file: File | null,
    folder: string = 'chat',
): Promise<string | null> {
    if (!file || !(file instanceof File) || file.size === 0) return null

    try {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const uniqueId = randomUUID().substring(0, 8)
        const sanitisedName = file.name.replace(/\s+/g, '_')
        const filename = `${Date.now()}_${uniqueId}_${sanitisedName}`

        const uploadDir = join(process.cwd(), 'public', folder)

        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true })
        }

        const filePath = join(uploadDir, filename)
        await writeFile(filePath, buffer)

        return filename
    } catch (error) {
        console.error('Error saving file:', error)
        return null
    }
}
