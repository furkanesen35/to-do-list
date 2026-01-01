/**
 * Calculate relative luminance of a hex color
 * Based on WCAG guidelines
 */
export function getRelativeLuminance(hex: string): number {
  // Remove # if present
  const color = hex.replace('#', '');
  
  // Parse RGB values
  const r = parseInt(color.substr(0, 2), 16) / 255;
  const g = parseInt(color.substr(2, 2), 16) / 255;
  const b = parseInt(color.substr(4, 2), 16) / 255;
  
  // Apply gamma correction
  const rs = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const gs = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const bs = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
  
  // Calculate luminance
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Determine if text should be light or dark based on background color
 * Returns true if light text should be used (dark background)
 * Returns false if dark text should be used (light background)
 */
export function shouldUseLightText(backgroundColor: string): boolean {
  const luminance = getRelativeLuminance(backgroundColor);
  return luminance <= 0.5;
}

/**
 * Get appropriate text color (white or black) for a background color
 */
export function getContrastTextColor(backgroundColor: string): string {
  return shouldUseLightText(backgroundColor) ? '#FFFFFF' : '#000000';
}

/**
 * For gradients with multiple colors, use the first color to determine contrast
 */
export function getTextColorForGradient(colors: string[]): string {
  if (colors.length === 0) return '#FFFFFF';
  return getContrastTextColor(colors[0]);
}
