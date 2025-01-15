/**
 * Get initials from a name string.
 * For example: "John Doe" -> "JD", "Jane" -> "J", "李 小龙" -> "李小"
 * @param {string} name - The name to get initials from
 * @returns {string} The initials (up to 2 characters)
 */
export function getInitials(name) {
  if (!name) return '';

  // Split on whitespace and other separators
  const parts = name.split(/[\s-_]+/);
  
  // For CJK characters, take first two characters if no spaces
  if (parts.length === 1 && /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/.test(name)) {
    return name.slice(0, 2);
  }

  // Otherwise take first letter of first two parts
  return parts
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('');
} 