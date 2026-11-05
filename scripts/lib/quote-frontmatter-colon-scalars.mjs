/**
 * Quote unquoted YAML scalar values that contain ":" so strict parsers accept
 * common upstream SKILL.md front matter.
 */
export function quoteUnquotedColonScalars(header) {
  return header.replace(/^([A-Za-z0-9_-]+): (.+)$/gm, (line, key, value) => {
    const trimmed = value.trimStart();
    if (trimmed.startsWith('"') || trimmed.startsWith("'") || trimmed.startsWith('|') || trimmed.startsWith('>')) {
      return line;
    }
    if (!value.includes(':')) return line;
    return `${key}: ${JSON.stringify(value)}`;
  });
}
