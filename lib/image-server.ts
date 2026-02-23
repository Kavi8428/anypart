import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { randomUUID } from 'crypto';

/**
 * Saves an uploaded file to the public directory
 * @param file The File object from FormData
 * @param folder The target folder inside public (default: 'products')
 * @returns The filename of the saved file
 */
export async function saveImage(file: File | null, folder: string = 'products'): Promise<string | null> {
    if (!file || !(file instanceof File) || file.size === 0) return null;

    try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create unique filename using UUID
        const uniqueId = randomUUID().substring(0, 8);
        const filename = `${Date.now()}_${uniqueId}_${file.name.replace(/\s+/g, '_')}`;

        const uploadDir = join(process.cwd(), 'public', folder);

        // Ensure directory exists
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        const path = join(uploadDir, filename);
        await writeFile(path, buffer);

        return filename;
    } catch (error) {
        console.error('Error saving image:', error);
        return null;
    }
}
