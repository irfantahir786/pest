/**
 * Text processing utilities for Indian motor insurance documents
 */

/**
 * Normalize text by removing extra whitespace and standardizing formatting
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .replace(/[^\S\r\n]+/g, ' ')
    .trim();
}

/**
 * Clean extracted text from PDF (remove artifacts, headers, footers)
 */
export function cleanPDFText(text: string): string {
  if (!text) return '';
  
  let cleaned = text;
  
  cleaned = cleaned.replace(/(?<=^|\n)\s*-?\d+\s*(?=\n|$)/g, '');
  cleaned = cleaned.replace(/\ufffd/g, '');
  cleaned = cleaned.replace(/(\w+)-\n(\w+)/g, '$1$2');
  cleaned = cleaned.replace(/Rs\.?\s*/gi, 'Rs. ');
  cleaned = cleaned.replace(/INR\s*/gi, 'Rs. ');
  cleaned = cleaned.replace(/₹\s*/g, 'Rs. ');
  
  return normalizeText(cleaned);
}

/**
 * Extract value following a label in text
 */
export function extractValueAfterLabel(
  text: string,
  labels: string[],
  options: {
    caseSensitive?: boolean;
    multiline?: boolean;
    stopAtNewline?: boolean;
    maxLength?: number;
  } = {}
): { value: string | null; confidence: number; source: string | null } {
  const {
    caseSensitive = false,
    multiline = false,
    stopAtNewline = true,
    maxLength = 200
  } = options;

  const flags = caseSensitive ? 'g' : 'gi';
  
  for (const label of labels) {
    const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    const pattern = new RegExp(
      `${escapedLabel}[\\s:]*([^\\n\\r]{1,${maxLength}})`,
      flags
    );
    
    const match = pattern.exec(text);
    if (match && match[1]) {
      let value = match[1].trim();
      value = value.replace(/[:;,]$/, '').trim();
      
      if (stopAtNewline) {
        value = value.split('\n')[0].trim();
      }
      
      if (value.length > 0 && value.length <= maxLength) {
        return {
          value,
          confidence: 0.85,
          source: label
        };
      }
    }
  }
  
  return { value: null, confidence: 0, source: null };
}

/**
 * Check if text contains any of the given keywords
 */
export function containsKeyword(text: string, keywords: string[]): boolean {
  for (const keyword of keywords) {
    const pattern = new RegExp(`\\b${keyword}\\b`, 'i');
    if (pattern.test(text)) {
      return true;
    }
  }
  return false;
}

/**
 * Validate Indian PAN format
 */
export function isValidPAN(pan: string): boolean {
  const panPattern = /^[A-Z]{5}\d{4}[A-Z]$/i;
  return panPattern.test(pan.trim());
}

/**
 * Validate Indian GSTIN format
 */
export function isValidGSTIN(gstin: string): boolean {
  const gstinPattern = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i;
  return gstinPattern.test(gstin.trim().toUpperCase());
}

/**
 * Validate Indian PIN code
 */
export function isValidPINCode(pincode: string): boolean {
  const pinPattern = /^\d{6}$/;
  return pinPattern.test(pincode.trim());
}
