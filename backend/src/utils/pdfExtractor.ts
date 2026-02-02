/**
 * PDF Text Extraction Utility
 * 
 * This utility extracts text from uploaded PDF files
 * The extracted text is stored in the database for AI context
 */

import pdfParse from 'pdf-parse';
import { Readable } from 'stream';

/**
 * Extract text from PDF buffer
 * This function reads the PDF and extracts all text content
 */
export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(pdfBuffer);
    
    // Clean up the extracted text
    let text = data.text;
    
    // Remove excessive whitespace
    text = text.replace(/\s+/g, ' ');
    
    // Remove page numbers and headers/footers (basic cleanup)
    text = text.replace(/Page \d+/gi, '');
    
    return text.trim();
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF. The file may be corrupted or encrypted.');
  }
}

/**
 * Validate PDF file
 * Basic validation to ensure the file is a PDF
 */
export function validatePDF(buffer: Buffer): boolean {
  // Check PDF magic number (first 4 bytes should be %PDF)
  const pdfHeader = buffer.toString('ascii', 0, 4);
  return pdfHeader === '%PDF';
}
