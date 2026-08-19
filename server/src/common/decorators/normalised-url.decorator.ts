import { Transform } from 'class-transformer';

export function NormaliseUrl() {
  return Transform(({ value }: { value: unknown }) => {
    if (typeof value !== 'string') {
      return '';
    }

    const trimmed = value.trim();

    if (trimmed === '') {
      return undefined;
    }

    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }

    return `https://${trimmed}`;
  });
}
