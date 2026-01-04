import { env } from '$env/dynamic/private';
import cryptojs from 'crypto-js';

/**
 * Decrypts the given value using the ENCRYPTION_KEY environment variable.
 *
 * @param value - The value to decrypt.
 * @returns The decrypted value.
 */
function decrypt(value: string): string {
  const decrypted = cryptojs.AES.decrypt(value, env.ENCRYPTION_KEY).toString(cryptojs.enc.Utf8);
  return decrypted;
}

export { decrypt };