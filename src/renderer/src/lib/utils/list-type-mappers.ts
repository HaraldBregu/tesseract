/**
 * Utility functions for mapping between list types and styles
 */

/**
 * Map ordered list type attribute (1, a, A, i, I) to CSS list-style-type
 */
export const orderedListTypeToStyle: Record<string, string> = {
    '1': 'decimal',
    'a': 'lower-alpha',
    'A': 'upper-alpha',
    'i': 'lower-roman',
    'I': 'upper-roman',
};

/**
 * Map CSS list-style-type back to ordered list type attribute
 */
export const orderedListStyleToType: Record<string, '1' | 'a' | 'A' | 'i' | 'I'> = {
    'decimal': '1',
    'lower-alpha': 'a',
    'upper-alpha': 'A',
    'lower-roman': 'i',
    'upper-roman': 'I',
};

/**
 * Map bullet style names to CSS list-style-type
 */
export const bulletStyleToType: Record<string, string> = {
    'disc': 'disc',
    'circle': 'circle',
    'square': 'square',
};

/**
 * Bullet type rotation for nested lists
 * disc → circle → square → disc
 */
export const bulletTypeRotation: Record<string, string> = {
    'disc': 'circle',
    'circle': 'square',
    'square': 'disc',
};

/**
 * Get the next bullet type in rotation
 */
export function getNextBulletType(currentType: string): string {
    return bulletTypeRotation[currentType] || 'circle';
}

