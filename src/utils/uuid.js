/**
 * Simple UUID v4 generator fallback for browsers that don't support crypto.randomUUID().
 * 
 * Works in non-secure contexts and older mobile browsers.
 */
export function generateUUID() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID()
    }

    // Fallback implementation (RFC4122)
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
    })
}

