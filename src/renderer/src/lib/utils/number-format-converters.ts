/**
 * Utility functions for converting numbers to different list formats
 * (decimal, lower-alpha, upper-alpha, lower-roman, upper-roman)
 */

/**
 * Convert number to lowercase letter (1 = a, 2 = b, ..., 26 = z, 27 = aa, ...)
 */
export function numberToLowerAlpha(num: number): string {
  if (num < 1) return '';

  let result = '';
  let n = num;

  while (n > 0) {
    const remainder = (n - 1) % 26;
    result = String.fromCharCode(97 + remainder) + result;
    n = Math.floor((n - 1) / 26);
  }

  return result;
}

/**
 * Convert number to uppercase letter (1 = A, 2 = B, ..., 26 = Z, 27 = AA, ...)
 */
export function numberToUpperAlpha(num: number): string {
  return numberToLowerAlpha(num).toUpperCase();
}

/**
 * Convert lowercase letter to number (a = 1, b = 2, ..., z = 26, aa = 27, ...)
 */
export function lowerAlphaToNumber(alpha: string): number {
  if (!alpha) return 0;

  let result = 0;
  const lowerAlpha = alpha.toLowerCase();

  for (let i = 0; i < lowerAlpha.length; i++) {
    const charCode = lowerAlpha.charCodeAt(i) - 96; // a = 1, b = 2, etc.
    if (charCode < 1 || charCode > 26) return 0;
    result = result * 26 + charCode;
  }

  return result;
}

/**
 * Convert uppercase letter to number (A = 1, B = 2, ..., Z = 26, AA = 27, ...)
 */
export function upperAlphaToNumber(alpha: string): number {
  return lowerAlphaToNumber(alpha.toLowerCase());
}

/**
 * Convert number to lowercase roman numeral (1 = i, 2 = ii, 3 = iii, 4 = iv, ...)
 */
export function numberToLowerRoman(num: number): string {
  return numberToUpperRoman(num).toLowerCase();
}

/**
 * Convert number to uppercase roman numeral (1 = I, 2 = II, 3 = III, 4 = IV, ...)
 */
export function numberToUpperRoman(num: number): string {
  if (num < 1 || num > 3999) return num.toString();

  const romanNumerals: [number, string][] = [
    [1000, 'M'],
    [900, 'CM'],
    [500, 'D'],
    [400, 'CD'],
    [100, 'C'],
    [90, 'XC'],
    [50, 'L'],
    [40, 'XL'],
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I']
  ];

  let result = '';
  let remaining = num;

  for (const [value, numeral] of romanNumerals) {
    while (remaining >= value) {
      result += numeral;
      remaining -= value;
    }
  }

  return result;
}

/**
 * Convert lowercase roman numeral to number (i = 1, ii = 2, iii = 3, iv = 4, ...)
 */
export function lowerRomanToNumber(roman: string): number {
  return upperRomanToNumber(roman.toUpperCase());
}

/**
 * Convert uppercase roman numeral to number (I = 1, II = 2, III = 3, IV = 4, ...)
 */
export function upperRomanToNumber(roman: string): number {
  if (!roman) return 0;

  const romanMap: Record<string, number> = {
    'I': 1,
    'V': 5,
    'X': 10,
    'L': 50,
    'C': 100,
    'D': 500,
    'M': 1000
  };

  let result = 0;
  let prevValue = 0;

  for (let i = roman.length - 1; i >= 0; i--) {
    const currentValue = romanMap[roman[i]];

    if (!currentValue) return 0; // Invalid roman numeral

    if (currentValue < prevValue) {
      result -= currentValue;
    } else {
      result += currentValue;
    }

    prevValue = currentValue;
  }

  return result;
}

/**
 * Convert number to the specified list format
 */
export function numberToListFormat(num: number, listType: '1' | 'a' | 'A' | 'i' | 'I'): string {
  switch (listType) {
    case 'a':
      return numberToLowerAlpha(num);
    case 'A':
      return numberToUpperAlpha(num);
    case 'i':
      return numberToLowerRoman(num);
    case 'I':
      return numberToUpperRoman(num);
    case '1':
    default:
      return num.toString();
  }
}

/**
 * Check if a string is a valid lowercase letter sequence (excluding roman numerals)
 * Returns true only if it's letters AND converts to a valid number
 */
function isLowerCaseAlpha(value: string): boolean {
  // Must contain only lowercase letters
  if (!/^[a-z]+$/.test(value)) {
    return false;
  }

  // Must NOT be a valid roman numeral
  // Check if it could be interpreted as roman (contains only i,v,x,l,c,d,m)
  if (/^[ivxlcdm]+$/.test(value)) {
    // Try to convert as roman - if it succeeds, it's roman, not alpha
    const romanValue = upperRomanToNumber(value.toUpperCase());
    if (romanValue > 0) {
      return false;
    }
  }

  // Must convert to a valid number
  return lowerAlphaToNumber(value) > 0;
}

/**
 * Check if a string is a valid uppercase letter sequence (excluding roman numerals)
 * Returns true only if it's letters AND converts to a valid number
 */
function isUpperCaseAlpha(value: string): boolean {
  // Must contain only uppercase letters
  if (!/^[A-Z]+$/.test(value)) {
    return false;
  }

  // Must NOT be a valid roman numeral
  // Check if it could be interpreted as roman (contains only I,V,X,L,C,D,M)
  if (/^[IVXLCDM]+$/.test(value)) {
    // Try to convert as roman - if it succeeds, it's roman, not alpha
    const romanValue = upperRomanToNumber(value);
    if (romanValue > 0) {
      return false;
    }
  }

  // Must convert to a valid number
  return upperAlphaToNumber(value) > 0;
}

/**
 * Check if a string is a valid lowercase roman numeral
 */
function isLowerCaseRoman(value: string): boolean {
  // Must contain only valid roman numeral characters
  if (!/^[ivxlcdm]+$/.test(value)) {
    return false;
  }

  // Must convert to a valid number
  return lowerRomanToNumber(value) > 0;
}

/**
 * Check if a string is a valid uppercase roman numeral
 */
function isUpperCaseRoman(value: string): boolean {
  // Must contain only valid roman numeral characters
  if (!/^[IVXLCDM]+$/.test(value)) {
    return false;
  }

  // Must convert to a valid number
  return upperRomanToNumber(value) > 0;
}

/**
 * Convert list format string to number
 */
export function listFormatToNumber(value: string, listType: '1' | 'a' | 'A' | 'i' | 'I'): number {
  const trimmedValue = value.trim();

  // First, try to parse as number
  const numValue = Number.parseInt(trimmedValue);
  if (!Number.isNaN(numValue) && numValue > 0) {
    return numValue;
  }

  // If not a number, convert based on list type with case validation
  switch (listType) {
    case 'a':
      // Only accept lowercase letters
      if (!isLowerCaseAlpha(trimmedValue)) {
        return 0;
      }
      return lowerAlphaToNumber(trimmedValue);
    case 'A':
      // Only accept uppercase letters
      if (!isUpperCaseAlpha(trimmedValue)) {
        return 0;
      }
      return upperAlphaToNumber(trimmedValue);
    case 'i':
      // Only accept lowercase roman numerals
      if (!isLowerCaseRoman(trimmedValue)) {
        return 0;
      }
      return lowerRomanToNumber(trimmedValue);
    case 'I':
      // Only accept uppercase roman numerals
      if (!isUpperCaseRoman(trimmedValue)) {
        return 0;
      }
      return upperRomanToNumber(trimmedValue);
    case '1':
    default:
      return 0;
  }
}

/**
 * Get the list type name for display
 */
export function getListTypeName(listType: '1' | 'a' | 'A' | 'i' | 'I'): string {
  switch (listType) {
    case 'a':
      return 'lower-alpha';
    case 'A':
      return 'upper-alpha';
    case 'i':
      return 'lower-roman';
    case 'I':
      return 'upper-roman';
    case '1':
    default:
      return 'decimal';
  }
}

