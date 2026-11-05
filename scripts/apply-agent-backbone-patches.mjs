import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const toolRoot = process.argv[2] ? path.resolve(process.argv[2]) : path.join(repoRoot, '.backbone-tool');
const src = path.join(toolRoot, 'src');

if (!fs.existsSync(path.join(toolRoot, 'package.json'))) {
  throw new Error('agent-backbone checkout not found at ' + toolRoot);
}

fs.writeFileSync(
  path.join(src, 'frontmatter.ts'),
  `import { parse } from 'yaml';

/** Quote unquoted YAML scalar values that contain ":" so strict parsers accept upstream SKILL.md front matter. */
function quoteUnquotedColonScalars(header: string): string {
  return header.replace(/^([A-Za-z0-9_-]+): (.+)$/gm, (line, key: string, value: string) => {
    const trimmed = value.trimStart();
    if (trimmed.startsWith('"') || trimmed.startsWith("'") || trimmed.startsWith('|') || trimmed.startsWith('>')) {
      return line;
    }
    if (!value.includes(':')) return line;
    return \`\${key}: \${JSON.stringify(value)}\`;
  });
}

/** Parse SKILL.md YAML front matter with upstream-safe fallbacks. */
export function parseSkillFrontmatter(header: string): unknown {
  try {
    return parse(header);
  } catch {
    return parse(quoteUnquotedColonScalars(header));
  }
}
`,
);

const replacements = [
  {
    file: 'validate.ts',
    from: "import { parse } from 'yaml';\n",
    to: "import { parseSkillFrontmatter } from './frontmatter.js';\n",
  },
  {
    file: 'validate.ts',
    from: '.parse(parse(header))',
    to: '.parse(parseSkillFrontmatter(header))',
  },
  {
    file: 'upstream.ts',
    from: "import { parse } from 'yaml';\n",
    to: "import { parseSkillFrontmatter } from './frontmatter.js';\n",
  },
  {
    file: 'upstream.ts',
    from: 'frontmatter ? parse(frontmatter) : {}',
    to: 'frontmatter ? parseSkillFrontmatter(frontmatter) : {}',
  },
  {
    file: 'delivery.ts',
    from: "import { parse, stringify } from 'yaml';\n",
    to: "import { parse, stringify } from 'yaml';\nimport { parseSkillFrontmatter } from './frontmatter.js';\n",
  },
  {
    file: 'delivery.ts',
    from: '.passthrough().parse(parse(header[1]!))',
    to: '.passthrough().parse(parseSkillFrontmatter(header[1]!))',
  },
];

for (const { file, from, to } of replacements) {
  const target = path.join(src, file);
  const text = fs.readFileSync(target, 'utf8');
  if (!text.includes(from)) throw new Error(`Expected patch anchor missing in ${file}: ${JSON.stringify(from)}`);
  fs.writeFileSync(target, text.replace(from, to));
}

console.log('Patched agent-backbone frontmatter parsing in ' + toolRoot);
