/** Joins conditional class names while skipping empty values. */
export function cn(...args: (string | undefined | null | false)[]) {
  return args.filter(Boolean).join(" ");
}
