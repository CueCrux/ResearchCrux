/**
 * Markdown generation helpers for ResearchCrux evidence pages.
 */

export function mdTable(headers: string[], rows: string[][]): string {
  const header = `| ${headers.join(" | ")} |`;
  const separator = `|${headers.map(() => "---").join("|")}|`;
  const body = rows.map((row) => `| ${row.join(" | ")} |`).join("\n");
  return `${header}\n${separator}\n${body}`;
}

export function mdSection(level: number, title: string, content: string): string {
  const hashes = "#".repeat(level);
  return `${hashes} ${title}\n\n${content}`;
}

export function mdFrontmatter(fields: Record<string, string>): string {
  const lines = Object.entries(fields).map(([k, v]) => `${k}: ${v}`);
  return `---\n${lines.join("\n")}\n---`;
}

export function mdCodeBlock(content: string, lang = ""): string {
  return `\`\`\`${lang}\n${content}\n\`\`\``;
}

export function formatDate(iso: string): string {
  return new Date(iso).toISOString().split("T")[0];
}

export function formatDuration(ms: number): string {
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes}m ${remaining}s`;
}

export function formatNumber(n: number, decimals = 3): string {
  if (Number.isInteger(n)) return n.toString();
  return n.toFixed(decimals);
}
