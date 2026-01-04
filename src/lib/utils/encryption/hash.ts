import { hash as cHash } from 'crypto';

export function hash(value: string): string {
  const pepper = process.env.ENCRYPTION_KEY;
  if (!pepper) {
    throw new Error('ENCRYPTION_KEY is not set');
  }

  const hashed = cHash('sha256', value + pepper, 'base64')

  return hashed;
}