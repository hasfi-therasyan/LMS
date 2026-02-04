/**
 * Helper functions for quiz routes
 */

import { extractTextFromPDF } from './pdfExtractor';

/**
 * Helper function to download PDF from URL and extract text
 */
export async function downloadAndExtractText(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download PDF: ${response.statusText}`);
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    return await extractTextFromPDF(buffer);
  } catch (error) {
    console.error('Error downloading/extracting PDF:', error);
    return null;
  }
}
