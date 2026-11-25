/** Minimal class-name joiner (dependency-free stand-in for clsx). */
export function cn(...inputs: Array<string | false | null | undefined>): string {
  return inputs.filter(Boolean).join(" ");
}
