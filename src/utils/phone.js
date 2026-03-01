/**
 * Phone number normalization utilities.
 *
 * The backend validates phone against the Nigerian regex:
 *   /^(\+234|0)[789][01]\d{8}$/
 *
 * The frontend filterNumeric helper strips non-digits (including '+'),
 * so we normalize before sending to the API.
 */

/**
 * Normalizes a raw phone string to the +234XXXXXXXXXX format.
 *
 * Handles:
 *  - "+2348012345678" → "+2348012345678" (already correct)
 *  - "2348012345678"  → "+2348012345678" (missing leading +)
 *  - "08012345678"    → "+2348012345678" (local 0XX format)
 *  - "8012345678"     → "+2348012345678" (no prefix at all)
 *
 * @param {string} raw  Raw phone string, may contain non-digits
 * @returns {string}    Normalized phone in +234 format, or the raw value
 *                      if it cannot be parsed (let backend validation handle it)
 */
export function normalizePhone(raw) {
    if (!raw) return raw

    // Strip everything except digits
    const digits = raw.replace(/\D/g, '')

    if (digits.startsWith('234') && digits.length === 13) {
        return `+${digits}`
    }

    if (digits.startsWith('0') && digits.length === 11) {
        return `+234${digits.slice(1)}`
    }

    if (digits.length === 10) {
        // Assume missing leading 0 (e.g. "8012345678")
        return `+234${digits}`
    }

    // Fallback — return as-is with + if it starts with 234
    return digits.startsWith('234') ? `+${digits}` : raw
}
