type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export function stableStringify(value: string, pretty = true): string {
  try {
    const parsed = JSON.parse(value) as JsonValue;
    const normalized = normalize(parsed);
    return pretty ? JSON.stringify(normalized, null, 2) : JSON.stringify(normalized);
  } catch {
    return value;
  }
}

function normalize(value: JsonValue): JsonValue {
  if (Array.isArray(value)) {
    return value.map(normalize);
  }

  if (value && typeof value === 'object') {
    const sortedEntries = Object.entries(value)
      .map(([key, val]) => [key, normalize(val)] as const)
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB));
    return Object.fromEntries(sortedEntries);
  }

  return value;
}
