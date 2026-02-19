import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Adds three numbers together (A+B+C)
 * @param a - First number
 * @param b - Second number
 * @param c - Third number
 * @returns The sum of a, b, and c
 */
export function sum(a: number, b: number, c: number): number {
  return a + b + c
}
