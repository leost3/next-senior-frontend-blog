export function calculateReadingTime(content: string): number {
  const stripped = content
    .replace(/^(import|export)\s+.*$/gm, '')
    .replace(/<[^>]+>/g, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^---[\s\S]*?---/m, '')
    .replace(/[#*_~>|]/g, '')
    .trim()

  const wordCount = stripped
    .split(/\s+/)
    .filter((word) => word.length > 0).length

  return Math.max(1, Math.ceil(wordCount / 200))
}
