export const MIN_BIO_WORDS = 50;

export function countWords(text: string | null | undefined): number {
  const trimmed = text?.trim() ?? '';
  return trimmed === '' ? 0 : trimmed.split(/\s+/).length;
}

export function hasCompleteBio(bio: string | null | undefined): boolean {
  return countWords(bio) >= MIN_BIO_WORDS;
}
