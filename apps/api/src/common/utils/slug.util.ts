/**
 * Generates a URL-friendly slug from a string.
 * - Converts to lowercase
 * - Replaces spaces and special characters with hyphens
 * - Removes consecutive hyphens
 * - Trims leading/trailing hyphens
 */
export function generateSlug(str: string): string {
    return str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
        .replace(/[\s_]+/g, '-')  // Replace spaces and underscores with hyphens
        .replace(/-+/g, '-')      // Replace multiple hyphens with single hyphen
        .replace(/^-+|-+$/g, ''); // Trim hyphens from start and end
}

/**
 * Generates a unique slug by appending a random suffix.
 * Useful when duplicate slugs might exist.
 */
export function generateUniqueSlug(str: string): string {
    const baseSlug = generateSlug(str);
    const suffix = Math.random().toString(36).substring(2, 8);
    return `${baseSlug}-${suffix}`;
}
