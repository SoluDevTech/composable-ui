import yaml from "js-yaml";

export interface SkillFrontmatter {
  name?: string;
  description?: string;
  [key: string]: unknown;
}

const FRONTMATTER_DELIMITER = "---";

/**
 * Parse a YAML frontmatter block delimited by leading `---` lines from a
 * markdown document. Returns the parsed frontmatter data (possibly empty)
 * and the remaining body content.
 *
 * Frontmatter without a body returns an empty body string. Documents without
 * frontmatter return the original content as the body and an empty data
 * object.
 */
export function parseFrontmatter(content: string): { data: SkillFrontmatter; body: string } {
  if (!content.startsWith(FRONTMATTER_DELIMITER)) {
    return { data: {}, body: content };
  }

  // Strip the leading delimiter line, then find the closing delimiter line.
  const afterOpening = content.slice(FRONTMATTER_DELIMITER.length);
  const newlineAfterOpen = afterOpening.search(/\r?\n/);
  if (newlineAfterOpen === -1) {
    return { data: {}, body: content };
  }

  const rest = afterOpening.slice(newlineAfterOpen + 1);
  // Find the closing delimiter: a line that is exactly `---` (with optional
  // trailing whitespace). The closing delimiter must be on its own line —
  // search for `\n---` (or `---` at the start of rest) to avoid matching a
  // `---` horizontal rule inside the body.
  let closeMatchIndex = -1;
  let closeMatchLength = 0;
  // Check if rest starts with the closing delimiter immediately
  if (/^---\s*(\r?\n|$)/.test(rest)) {
    closeMatchIndex = 0;
    closeMatchLength = rest.match(/^---\s*(\r?\n|$)/)![0].length;
  } else {
    // Search for `\n---` on its own line
    const closeRegex = /\n---\s*(\r?\n|$)/g;
    const match = closeRegex.exec(rest);
    if (match) {
      closeMatchIndex = match.index + 1; // +1 to skip the \n
      closeMatchLength = match[0].length - 1; // exclude the leading \n
    }
  }
  if (closeMatchIndex === -1) {
    return { data: {}, body: content };
  }

  const yamlBlock = rest.slice(0, closeMatchIndex);
  const bodyStart = closeMatchIndex + closeMatchLength;
  const body = rest.slice(bodyStart);

  let data: SkillFrontmatter = {};
  try {
    const parsed = yaml.load(yamlBlock);
    if (parsed && typeof parsed === "object") {
      data = parsed as SkillFrontmatter;
    }
  } catch {
    // The frontmatter block is not valid YAML (e.g. an unquoted scalar value
    // containing a colon). Fall back to a lenient line-by-line extraction of
    // the known scalar keys so the document is still usable.
    data = extractLenient(yamlBlock);
  }

  return { data, body };
}

/**
 * Lenient fallback parser used when js-yaml cannot parse a frontmatter block.
 * Extracts simple `key: value` scalar lines (one per line) without quoting
 * rules. Handles the common case of a description containing characters that
 * would make the block invalid YAML (e.g. an unquoted colon).
 */
function extractLenient(yamlBlock: string): SkillFrontmatter {
  const data: SkillFrontmatter = {};
  for (const line of yamlBlock.split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z_][\w-]*)\s*:\s*(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    let value = rawValue.trim();
    // Strip a single layer of matching quotes if present.
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    data[key] = value;
  }
  return data;
}

/**
 * Build a markdown document with a YAML frontmatter block containing the
 * provided `name` and `description`, followed by the body content. Values
 * that would otherwise be invalid YAML (e.g. containing a colon followed by a
 * space, or starting with a quote) are double-quoted.
 */
export function buildFrontmatter(
  data: { name: string; description: string },
  body: string,
): string {
  const yamlBlock = `name: ${formatScalar(data.name)}\ndescription: ${formatScalar(data.description)}`;
  const bodyPart = body ? body : "";
  return `${FRONTMATTER_DELIMITER}\n${yamlBlock}\n${FRONTMATTER_DELIMITER}\n${bodyPart}`;
}

function formatScalar(value: string): string {
  // Quote values that contain a YAML-meaningful construct so the output
  // remains valid YAML and round-trips through parseFrontmatter.
  if (/[:#\-?][\s]|^["']|[:]{1}$/.test(value) || value.includes("\n")) {
    return JSON.stringify(value);
  }
  return value;
}
