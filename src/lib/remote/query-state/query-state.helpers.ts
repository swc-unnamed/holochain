import type { WhereValue } from './query-state.types';

function expandWherePath(path: string, value: WhereValue) {
  return path
    .split('.')
    .reverse()
    .reduce((acc, key) => ({ [key]: acc }), value as unknown);
}

function expandOrderPath(path: string, direction: 'asc' | 'desc') {
  const parts = path.split('.');
  const result: Record<string, unknown> = {};
  let pointer = result;

  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    pointer[p] = {};
    pointer = pointer[p] as Record<string, unknown>;
  }

  pointer[parts[parts.length - 1]] = direction;
  return result;
}

function isListField<T>(model: T, field: string): boolean {
  const value = (model as Record<string, unknown>)[field];
  return Array.isArray(value);
}
export { expandWherePath, expandOrderPath, isListField };