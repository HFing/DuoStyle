export type InlineToken = { text: string; bold: boolean };
export type ChatMarkdownBlock =
  | { type: 'paragraph'; content: InlineToken[] }
  | { type: 'ul' | 'ol'; items: InlineToken[][] };

function parseInlineMarkdown(value: string): InlineToken[] {
  return value.split(/(\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .map(part => part.startsWith('**') && part.endsWith('**')
      ? { text: part.slice(2, -2), bold: true }
      : { text: part, bold: false });
}

export function parseChatMarkdown(content: string): ChatMarkdownBlock[] {
  const blocks: ChatMarkdownBlock[] = [];
  const lines = String(content || '').replaceAll('\r\n', '\n').split('\n');
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();
    if (!line) {
      index += 1;
      continue;
    }
    const unordered = /^[-*]\s+(.+)$/.exec(line);
    const ordered = /^\d+\.\s+(.+)$/.exec(line);
    if (unordered || ordered) {
      const type = unordered ? 'ul' : 'ol';
      const items: InlineToken[][] = [];
      while (index < lines.length) {
        const candidate = lines[index].trim();
        const match = type === 'ul' ? /^[-*]\s+(.+)$/.exec(candidate) : /^\d+\.\s+(.+)$/.exec(candidate);
        if (!match) break;
        items.push(parseInlineMarkdown(match[1]));
        index += 1;
      }
      blocks.push({ type, items });
      continue;
    }
    blocks.push({ type: 'paragraph', content: parseInlineMarkdown(line) });
    index += 1;
  }
  return blocks;
}
