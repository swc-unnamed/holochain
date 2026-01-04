import { customAlphabet } from 'nanoid';

const CUSTOM_ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789';

/**
 * Generates a unique identifier using a custom alphabet.
 */
export const nanoid = customAlphabet(CUSTOM_ALPHABET, 8);