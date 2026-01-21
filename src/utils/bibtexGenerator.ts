/**
 * Frontmatter fields that are Obsidian-specific and should not be included in BibTeX output.
 */
const EXCLUDED_FIELDS = new Set([
	"aliases",
	"cssclass",
	"cssclasses",
	"tags",
	"position",
]);

/**
 * Characters that need to be escaped in BibTeX field values.
 */
const BIBTEX_SPECIAL_CHARS: Record<string, string> = {
	"&": "\\&",
	"%": "\\%",
	"$": "\\$",
	"#": "\\#",
	"_": "\\_",
	"{": "\\{",
	"}": "\\}",
	"~": "\\textasciitilde{}",
	"^": "\\textasciicircum{}",
};

export interface BibEntry {
	citationKey: string;
	entryType: string;
	fields: Record<string, string>;
}

/**
 * Escapes special BibTeX characters in a string.
 */
function escapeBibtex(value: string): string {
	let result = value;
	for (const [char, escaped] of Object.entries(BIBTEX_SPECIAL_CHARS)) {
		result = result.split(char).join(escaped);
	}
	return result;
}

/**
 * Extracts a BibTeX entry from frontmatter data.
 * Returns null if the frontmatter doesn't have a citationKey.
 */
export function extractBibEntry(frontmatter: Record<string, unknown>): BibEntry | null {
	const citationKey = frontmatter.citationKey;
	if (typeof citationKey !== "string" || !citationKey) {
		return null;
	}

	const entryType = typeof frontmatter.entryType === "string" ? frontmatter.entryType : "misc";

	const fields: Record<string, string> = {};
	for (const [key, value] of Object.entries(frontmatter)) {
		// Skip excluded fields and the citationKey/entryType which are handled separately
		if (EXCLUDED_FIELDS.has(key) || key === "citationKey" || key === "entryType") {
			continue;
		}

		// Convert value to string
		if (value === null || value === undefined) {
			continue;
		}

		let stringValue: string;
		if (Array.isArray(value)) {
			stringValue = value.join(" and ");
		} else if (typeof value === "object") {
			continue;
		} else {
			stringValue = String(value);
		}

		if (stringValue) {
			fields[key] = stringValue;
		}
	}

	return { citationKey, entryType, fields };
}

/**
 * Formats a single BibTeX entry as a string.
 */
export function formatBibEntry(entry: BibEntry): string {
	const lines: string[] = [];
	lines.push(`@${entry.entryType}{${entry.citationKey},`);

	const fieldEntries = Object.entries(entry.fields);
	const lastIndex = fieldEntries.length - 1;
	fieldEntries.forEach(([key, value], i) => {
		const escapedValue = escapeBibtex(value);
		const comma = i < lastIndex ? "," : "";
		lines.push(`  ${key} = {${escapedValue}}${comma}`);
	});

	lines.push("}");
	return lines.join("\n");
}

/**
 * Generates a complete .bib file content from multiple entries.
 */
export function generateBibFile(entries: BibEntry[]): string {
	if (entries.length === 0) {
		return "";
	}

	// Sort entries by citation key for consistent output
	const sortedEntries = [...entries].sort((a, b) =>
		a.citationKey.localeCompare(b.citationKey)
	);

	return sortedEntries.map(formatBibEntry).join("\n\n") + "\n";
}
