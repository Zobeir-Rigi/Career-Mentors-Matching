import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines conditional class names and resolves conflicting Tailwind CSS utilities.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function optionsSetHandler(optionSet: Set<string>, option: string) {
  const updatedOptionSet = new Set(optionSet);
  if (updatedOptionSet.has(option)) {
    updatedOptionSet.delete(option);
  } else {
    updatedOptionSet.add(option);
  }
  return updatedOptionSet;
}
