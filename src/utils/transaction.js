/**
 * Transaction display utilities.
 *
 * Maps backend transaction type + metadata to human-friendly UI labels.
 * The backend TransactionResource returns type + metadata but no display name.
 */

/**
 * Derive a human-readable counterparty/description from a transaction.
 *
 * @param {{ type: string, metadata: Record<string, any>|null }} tx
 * @returns {string}
 */
export function transactionDisplayName(tx) {
    const meta = tx.metadata ?? {}

    switch (tx.type) {
        case 'transfer_out':
        case 'nip_transfer':
            return meta.beneficiary_name ?? meta.account_name ?? 'Bank Transfer'

        case 'transfer_in':
        case 'nip_credit':
            return meta.sender_name ?? meta.originator_name ?? 'Transfer Received'

        case 'deposit':
        case 'wallet_credit':
            return meta.source ?? meta.narration ?? 'Wallet Top-up'

        case 'withdrawal':
            return meta.bank_name ?? 'Withdrawal'

        case 'bill_payment':
            return meta.beneficiary ?? meta.biller_name ?? 'Bill Payment'

        case 'airtime':
            return `${meta.network ?? ''} Airtime`.trim() || 'Airtime'

        case 'data':
            return `${meta.network ?? ''} Data`.trim() || 'Data Bundle'

        case 'cable_tv':
            return meta.smartcard_name ?? meta.package ?? 'Cable TV'

        case 'gift_card_purchase':
            return meta.brand ?? 'Gift Card'

        case 'loan_disbursement':
            return 'Loan Disbursement'

        case 'loan_repayment':
            return 'Loan Repayment'

        default:
            // Fallback: humanize the type string ("nip_transfer" → "Nip Transfer")
            return tx.type
                ?.replace(/_/g, ' ')
                ?.replace(/\b\w/g, (c) => c.toUpperCase())
                ?? 'Transaction'
    }
}

/**
 * Map a transaction type to an emoji icon for the list UI.
 *
 * @param {string} type
 * @returns {string}
 */
export function transactionIcon(type) {
    const map = {
        transfer_out: '📤',
        nip_transfer: '📤',
        transfer_in: '📥',
        nip_credit: '📥',
        deposit: '💰',
        wallet_credit: '💰',
        withdrawal: '🏧',
        bill_payment: '🧾',
        airtime: '📱',
        data: '📶',
        cable_tv: '📺',
        gift_card_purchase: '🎁',
        loan_disbursement: '🏦',
        loan_repayment: '🔄',
    }
    return map[type] ?? '💳'
}

/**
 * Format a transaction amount with sign prefix and currency symbol.
 *
 * @param {{ amount: number, type: string }} tx
 * @param {string} currencySymbol
 * @returns {string}
 */
export function formatTransactionAmount(tx, currencySymbol = '₦') {
    const debitTypes = ['transfer_out', 'nip_transfer', 'withdrawal', 'bill_payment', 'airtime', 'data', 'cable_tv', 'gift_card_purchase', 'loan_repayment']
    const isDebit = debitTypes.includes(tx.type)
    const formatted = Number(tx.amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })
    return `${isDebit ? '-' : '+'}${currencySymbol}${formatted}`
}

/**
 * Format a currency balance number.
 *
 * @param {number|string|null} amount
 * @param {string} symbol
 * @returns {string}
 */
export function formatBalance(amount, symbol = '₦') {
    if (amount === null || amount === undefined) return `${symbol}—`
    return `${symbol}${Number(amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
}
