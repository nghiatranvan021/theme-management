import crypto from 'crypto';

// Decrypt decrypts the encrypted text using the key
// It returns the decrypted text
export function decrypt(encryptedText: string, key: string): string {
    if (!encryptedText || !key) {
        throw new Error('encryptedText and key must be provided');
    }

    // Decode the Base64 encoded string
    const cipherText = Buffer.from(encryptedText, 'base64');

    // Create AES cipher
    const aes = crypto.createCipheriv('aes-256-gcm', Buffer.from(key, 'utf-8'), cipherText.slice(0, 12)); // Assuming the first 12 bytes are the nonce

    // Extract the nonce and the actual ciphertext
    const nonce = cipherText.slice(0, 12); // First 12 bytes as nonce
    const authTag = cipherText.slice(cipherText.length - 16); // Last 16 bytes as auth tag
    const encryptedData = cipherText.slice(12, cipherText.length - 16); // The rest is the actual ciphertext

    const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(key, 'utf-8'), nonce);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedData, undefined, 'utf8'); // Use undefined for inputEncoding
    decrypted += decipher.final('utf8');

    return decrypted;
} 