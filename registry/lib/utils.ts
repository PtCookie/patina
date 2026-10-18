// Stand-in for the consuming project's own `cn`, so the registry sources can be type-checked and rendered here.
// It is not published: projects get theirs from the shadcn `utils` item.

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
