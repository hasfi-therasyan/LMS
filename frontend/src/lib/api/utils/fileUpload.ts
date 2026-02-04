/**
 * File Upload Utilities for Next.js API Routes
 * 
 * Handles file uploads from FormData in Next.js serverless functions
 */

/**
 * Parse FormData and extract file
 */
export async function parseFormData(request: Request): Promise<{
  file: File | null;
  fields: Record<string, string>;
}> {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  
  const fields: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (key !== 'file' && typeof value === 'string') {
      fields[key] = value;
    }
  }
  
  return { file, fields };
}

/**
 * Convert File to Buffer
 */
export async function fileToBuffer(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Validate file type
 */
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

/**
 * Validate file size (in bytes)
 */
export function validateFileSize(file: File, maxSize: number): boolean {
  return file.size <= maxSize;
}
