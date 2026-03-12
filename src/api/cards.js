import api from './axios.js'

/**
 * Virtual Card API module.
 * All endpoints are prefixed with /api/v1 by the axios instance.
 */

// ── Cardholder ────────────────────────────────────────────────────────────────

/**
 * Register as a Bridgecard cardholder (KYC verification — may take up to 45s).
 * @param {Object} data - KYC data including address, id_type, bvn/nin, selfie_image
 */
export const registerCardholder = (data) =>
    api.post('/cards/cardholder/register', data)

/**
 * Get the authenticated agent's cardholder status.
 */
export const getCardholder = () =>
    api.get('/cards/cardholder/details')

// ── Cards ─────────────────────────────────────────────────────────────────────

/**
 * List all virtual cards for the authenticated agent.
 */
/** List all virtual cards for the authenticated agent. */
export const getCards = () =>
    api.get('/cards')

/**
 * Get masked details + synced balance for a specific card.
 * @param {string} cardId
 */
export const getCardDetails = (cardId) =>
    api.get(`/cards/${cardId}`)

/**
 * Create a new virtual USD Mastercard.
 * @param {Object} data - { card_limit, pin, pin_confirmation, funding_amount_ngn }
 */
export const createCard = (data) =>
    api.post('/cards', data)

/**
 * Get masked card details for a specific card.
 * @param {string} cardId
 */
export const getCard = (cardId) =>
    api.get(`/cards/${cardId}`)

/**
 * Generate a one-time token for revealing PAN/CVV via Evervault relay.
 * Token is valid for 5 minutes.
 * @param {string} cardId
 */
export const generateCardToken = (cardId) =>
    api.post(`/cards/${cardId}/token`)

/**
 * Fund a card from the agent's NGN wallet.
 * @param {string} cardId
 * @param {number} amountNgn - Amount in NGN
 */
export const fundCard = (cardId, amountNgn) =>
    api.patch(`/cards/${cardId}/fund`, { amount_ngn: amountNgn })

/**
 * Unload (withdraw) USD cents from card back to NGN wallet.
 * @param {string} cardId
 * @param {number} amountCents - Amount in USD cents
 */
export const unloadCard = (cardId, amountCents) =>
    api.patch(`/cards/${cardId}/unload`, { amount_cents: amountCents })

/**
 * Freeze a card (blocks all transactions).
 * @param {string} cardId
 */
export const freezeCard = (cardId) =>
    api.patch(`/cards/${cardId}/freeze`)

/**
 * Unfreeze a frozen card.
 * @param {string} cardId
 */
export const unfreezeCard = (cardId) =>
    api.patch(`/cards/${cardId}/unfreeze`)

/**
 * Permanently delete a card (must have zero balance).
 * @param {string} cardId
 */
export const deleteCard = (cardId) =>
    api.delete(`/cards/${cardId}`)

/**
 * Get paginated transaction history for a card.
 * @param {string} cardId
 * @param {number} page
 */
export const getCardTransactions = (cardId, page = 1) =>
    api.get(`/cards/${cardId}/transactions`, { params: { page } })

/**
 * Get the current NGN/USD FX rate.
 */
export const getFxRate = () =>
    api.get('/cards/fx-rate')

/**
 * Reveal card details (PAN, CVV, expiry) directly from Evervault relay.
 * This is called client-side after getting a token from generateCardToken().
 * @param {string} relayUrl - The Evervault relay base URL
 * @param {string} token - One-time token from generateCardToken()
 * @param {string} apiKey - Bridgecard API key (passed as 'token: Bearer {key}' header)
 */
export const revealCardDetails = async (relayUrl, token, apiKey) => {
    const response = await fetch(
        `${relayUrl}/cards/get_card_details_from_token?token=${token}`,
        {
            headers: {
                'token': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
        }
    )
    if (!response.ok) {
        throw new Error('Failed to reveal card details')
    }
    const json = await response.json()
    return json.data || json
}
