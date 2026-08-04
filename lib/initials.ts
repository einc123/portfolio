export function displayInitials(label: string, max = 2) {
  const parts = label.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) {
    return parts[0]!.slice(0, max).toUpperCase();
  }
  return parts
    .slice(0, max)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}
