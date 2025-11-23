function expandWherePath(path: string, value: string | { in: string[] }) {
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

export { expandWherePath, expandOrderPath };