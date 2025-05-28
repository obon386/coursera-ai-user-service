/**
 * Converts a userId to a 24-character hexadecimal string
 * @param {string|number} userId - The user ID to convert
 * @returns {string} The 24-character hexadecimal user ID
 * @throws {Error} If userId is invalid or missing
 */
const toUserIdHex = (userId) => {
    // Convert to string and trim
    userId = String(userId).trim();
    
    if (/^[a-fA-F0-9]{24}$/.test(userId)) {
        return userId; // Add explicit return
    } else if (/^\d+$/.test(userId)) {
        // integer, pad to 24-char hex string
        const hex = BigInt(userId).toString(16);
        userId = hex.padStart(24, '0');
    }
    else {
        throw new Error('Invalid userId format');
    }
    return userId;
}

module.exports = { toUserIdHex };
