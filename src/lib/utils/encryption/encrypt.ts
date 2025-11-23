import { env } from '$env/dynamic/private';
import cryptojs from 'crypto-js';

/**
 * Encrypts a given value using AES encryption algorithm.
 * @param value - The value to be encrypted.
 * @returns The encrypted value as a string.
 */
function encrypt(value: string): string {
  const encrypted = cryptojs.AES.encrypt(value, env.ENCRYPTION_KEY).toString();
  return encrypted;
}

export { encrypt };