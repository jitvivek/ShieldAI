export function hashSha256(input: string): string {
  // Using a simple hash for React Native (in production use expo-crypto)
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36).padStart(12, '0');
}

export function hashText(text: string): string {
  return hashSha256(text);
}
