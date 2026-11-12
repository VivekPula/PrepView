import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

export const parseResumeFile = async (fileBuffer, mimeType) => {
  try {
    if (mimeType === 'application/pdf' || fileBuffer.slice(0, 4).toString() === '%PDF') {
      const parsed = await pdf(fileBuffer);
      return parsed.text || '';
    }
    // Plain text or markdown
    return fileBuffer.toString('utf-8');
  } catch (error) {
    console.error('Error parsing file with pdf-parse:', error);
    // Fallback: try raw UTF-8 string extraction
    return fileBuffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\t]/g, ' ');
  }
};
