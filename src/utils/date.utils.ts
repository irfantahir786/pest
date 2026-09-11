/**
 * Date utilities for Indian motor insurance documents
 */

// Common Indian date formats
const DATE_PATTERNS = [
  // DD/MM/YYYY
  /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/g,
  // DD-MM-YYYY
  /(\d{1,2})-(\d{1,2})-(\d{4})/g,
  // DD.MM.YYYY
  /(\d{1,2})\.(\d{1,2})\.(\d{4})/g,
  // YYYY-MM-DD (ISO)
  /(\d{4})-(\d{1,2})-(\d{1,2})/g,
  // DD Month YYYY
  /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{4})/gi,
  // Month DD, YYYY
  /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2}),?\s+(\d{4})/gi,
];

const MONTH_MAP: Record<string, string> = {
  'jan': '01', 'january': '01',
  'feb': '02', 'february': '02',
  'mar': '03', 'march': '03',
  'apr': '04', 'april': '04',
  'may': '05',
  'jun': '06', 'june': '06',
  'jul': '07', 'july': '07',
  'aug': '08', 'august': '08',
  'sep': '09', 'september': '09',
  'oct': '10', 'october': '10',
  'nov': '11', 'november': '11',
  'dec': '12', 'december': '12'
};

export interface ParsedDate {
  original: string;
  normalized: string | null; // YYYY-MM-DD format
  confidence: number;
}

/**
 * Parse various date formats and normalize to YYYY-MM-DD
 */
export function parseDate(text: string): ParsedDate {
  if (!text || typeof text !== 'string') {
    return { original: text, normalized: null, confidence: 0 };
  }

  const trimmedText = text.trim();

  // Try each pattern
  for (const pattern of DATE_PATTERNS) {
    const match = pattern.exec(trimmedText);
    if (match) {
      const result = normalizeMatch(match, pattern);
      if (result.normalized) {
        return result;
      }
    }
  }

  return { original: trimmedText, normalized: null, confidence: 0 };
}

function normalizeMatch(match: RegExpExecArray, pattern: RegExp): ParsedDate {
  const original = match[0];
  
  // Pattern index determines format
  const patternStr = pattern.toString();
  
  try {
    if (patternStr.includes('Month')) {
      // DD Month YYYY or Month DD, YYYY
      if (/^\d/.test(original)) {
        // DD Month YYYY
        const day = match[1].padStart(2, '0');
        const month = MONTH_MAP[match[2].toLowerCase()] || '01';
        const year = match[3];
        return {
          original,
          normalized: `${year}-${month}-${day}`,
          confidence: 0.95
        };
      } else {
        // Month DD, YYYY
        const month = MONTH_MAP[match[1].toLowerCase()] || '01';
        const day = match[2].padStart(2, '0');
        const year = match[3];
        return {
          original,
          normalized: `${year}-${month}-${day}`,
          confidence: 0.95
        };
      }
    } else if (patternStr.startsWith('/(\\d{4})')) {
      // YYYY-MM-DD
      return {
        original,
        normalized: `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`,
        confidence: 0.98
      };
    } else {
      // DD/MM/YYYY or similar
      let day = match[1];
      let month = match[2];
      let year = match[3];
      
      // Validate day and month ranges
      const dayNum = parseInt(day, 10);
      const monthNum = parseInt(month, 10);
      
      if (dayNum > 31 && monthNum <= 12) {
        // Swap - likely MM/DD/YYYY format
        [day, month] = [month, day];
      }
      
      if (dayNum <= 31 && monthNum <= 12) {
        return {
          original,
          normalized: `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`,
          confidence: 0.9
        };
      }
    }
  } catch (e) {
    // Fall through to return null
  }
  
  return { original, normalized: null, confidence: 0 };
}

/**
 * Validate if a date string is a valid Indian date format
 */
export function isValidDate(dateStr: string): boolean {
  const parsed = parseDate(dateStr);
  return parsed.normalized !== null;
}

/**
 * Extract all dates from text
 */
export function extractAllDates(text: string): ParsedDate[] {
  const dates: ParsedDate[] = [];
  const seen = new Set<string>();
  
  for (const pattern of DATE_PATTERNS) {
    const matches = [...text.matchAll(pattern)];
    for (const match of matches) {
      const original = match[0];
      if (!seen.has(original)) {
        seen.add(original);
        const parsed = normalizeMatch(match as RegExpExecArray, pattern);
        dates.push(parsed);
      }
    }
  }
  
  return dates.filter(d => d.normalized !== null);
}
