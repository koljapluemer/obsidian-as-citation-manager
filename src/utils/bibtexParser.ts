import { parse, Entry as BibtexParserEntry } from "@retorquere/bibtex-parser";
import { BibtexEntry } from "../types";

/**
 * Parse a BibTeX string and return the first entry found.
 * Returns null if parsing fails or no entries are found.
 */
export function parseBibtex(bibtexString: string): BibtexEntry | null {
	try {
		const result = parse(bibtexString, {
			sentenceCase: false,  // Don't modify title casing
			errorHandler: () => { /* suppress errors */ },
		});

		const entry = result.entries[0];
		if (!entry) {
			return null;
		}

		return convertEntry(entry);
	} catch {
		return null;
	}
}

/**
 * Convert the library's Entry format to our BibtexEntry format.
 * Flattens the fields object (which has string arrays) to string values.
 */
function convertEntry(entry: BibtexParserEntry): BibtexEntry {
	const entryTags: Record<string, string> = {};

	// Flatten fields - the library returns string[] for each field
	for (const [key, values] of Object.entries(entry.fields)) {
		if (values && values.length > 0) {
			entryTags[key] = values.join(" and ");
		}
	}

	return {
		entryType: entry.type,
		citationKey: entry.key,
		entryTags,
	};
}
