import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
<<<<<<< HEAD
=======

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
>>>>>>> fc40151c782e7b98764690e05d42936c52f67356
