import { App } from "obsidian";

const STOP_WORDS = ["the", "a", "an", "of", "on", "in", "for", "to", "and", "or"];

/**
 * Generate a citation key from BibTeX entry fields.
 * Format: authorYearTitle (e.g., "smith2023quantum")
 */
export function generateCitationKey(
	author: string | undefined,
	year: string | undefined,
	title: string | undefined
): string {
	const authorPart = extractFirstAuthorLastName(author);
	const yearPart = year || "";
	const titlePart = extractFirstTitleWord(title);

	const key = `${authorPart}${yearPart}${titlePart}`.toLowerCase();

	// Ensure we have something
	return key || "unknown";
}

/**
 * Extract the last name of the first author.
 */
function extractFirstAuthorLastName(authorString: string | undefined): string {
	if (!authorString) return "unknown";

	// BibTeX uses " and " to separate authors
	const authors = authorString.split(/\s+and\s+/i);
	const firstAuthor = authors[0]?.trim();
	if (!firstAuthor) return "unknown";

	// Handle "Last, First" format
	if (firstAuthor.includes(",")) {
		const lastName = firstAuthor.split(",")[0]?.trim() || "unknown";
		return lastName.replace(/[^a-zA-Z]/g, "") || "unknown";
	}

	// Handle "First Last" format - take last word
	const parts = firstAuthor.trim().split(/\s+/);
	const lastName = parts[parts.length - 1] || "unknown";
	return lastName.replace(/[^a-zA-Z]/g, "");
}

/**
 * Extract the first significant word from the title (skipping stop words).
 */
function extractFirstTitleWord(title: string | undefined): string {
	if (!title) return "";

	const words = title.toLowerCase().split(/\s+/);
	for (const word of words) {
		const clean = word.replace(/[^a-z]/g, "");
		if (clean && !STOP_WORDS.includes(clean)) {
			return clean;
		}
	}
	return "";
}

/**
 * Find a unique citation key by checking existing keys in the literature folder.
 * Appends -1, -2, etc. if collision detected.
 */
export async function findUniqueCitationKey(
	app: App,
	baseKey: string,
	literatureFolder: string
): Promise<{ key: string; hadCollision: boolean }> {
	const existingKeys = await getAllCitationKeys(app, literatureFolder);

	if (!existingKeys.has(baseKey)) {
		return { key: baseKey, hadCollision: false };
	}

	// Find next available suffix
	let suffix = 1;
	while (existingKeys.has(`${baseKey}-${suffix}`)) {
		suffix++;
	}

	return { key: `${baseKey}-${suffix}`, hadCollision: true };
}

/**
 * Get all citation keys from notes in the literature folder.
 */
async function getAllCitationKeys(app: App, folder: string): Promise<Set<string>> {
	const keys = new Set<string>();
	const files = app.vault.getMarkdownFiles();

	for (const file of files) {
		// Check if file is in the literature folder
		if (folder && !file.path.startsWith(folder + "/") && file.path !== folder) {
			continue;
		}

		const cache = app.metadataCache.getFileCache(file);
		const citationKey = cache?.frontmatter?.citationKey;
		if (citationKey && typeof citationKey === "string") {
			keys.add(citationKey);
		}
	}

	return keys;
}
