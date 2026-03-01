/**
 * Device fingerprinting utilities.
 *
 * Generates a stable device ID that persists across sessions.
 * Required by the backend AuthService for device binding, brute-force
 * protection throttle keys, and the quick-login flow.
 */

const DEVICE_ID_KEY = 'bp_device_id'

/**
 * Returns the persisted device UUID, creating one on first call.
 *
 * The ID is stored in localStorage so it survives page reloads but
 * is reset on browser data clear or reinstall (which correctly
 * triggers the "Device not recognized" fallback on the backend).
 *
 * @returns {string} A UUID string (min 36 chars, satisfies backend min:10)
 */
export function getDeviceId() {
    let id = localStorage.getItem(DEVICE_ID_KEY)
    if (!id) {
        id = crypto.randomUUID()
        localStorage.setItem(DEVICE_ID_KEY, id)
    }
    return id
}

/**
 * Returns basic device/browser metadata for the backend device_info field.
 *
 * @returns {{ model: string, os_version: string }}
 */
export function getDeviceInfo() {
    return {
        model: navigator.userAgent.slice(0, 100),
        // navigator.platform is deprecated; prefer the User-Agent Client Hints API
        // with a UA-string parse as a fallback for Firefox / Safari.
        os_version: navigator.userAgentData?.platform
            ?? (/Win/.test(navigator.userAgent) ? 'Windows'
                : /Mac/.test(navigator.userAgent) ? 'macOS'
                    : /Linux/.test(navigator.userAgent) ? 'Linux'
                        : /Android/.test(navigator.userAgent) ? 'Android'
                            : /iPhone|iPad/.test(navigator.userAgent) ? 'iOS'
                                : 'web-pwa'),
    }
}

/**
 * Clears the stored device ID.
 * Call this when the user explicitly logs out or on device mismatch.
 */
export function clearDeviceId() {
    localStorage.removeItem(DEVICE_ID_KEY)
}
