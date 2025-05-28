const { toUserIdHex } = require('../../src/utils/userIdUtil');

describe('toUserIdHex', () => {
    it('should return valid hex string unchanged', () => {
        const hex = '507f1f77bcf86cd799439011';
        expect(toUserIdHex(hex)).toBe(hex);
    });

    it('should convert integer to hex string', () => {
        expect(toUserIdHex('12345')).toBe('000000000000000000003039');
    });

    it('should throw error for invalid input', () => {
        expect(() => toUserIdHex('invalid')).toThrow('Invalid userId format');
    });
});