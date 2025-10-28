import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...i: (string | undefined | null | boolean)[]) {
  return twMerge(clsx(i));
}
