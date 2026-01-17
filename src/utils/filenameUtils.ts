const MAX_FILENAME_LENGTH = 80;
const MIN_SPLIT_LENGTH = 30;

// Punctuation to split at, in order of preference (before falling back to space)
// Includes both original chars and their Unicode lookalikes from sanitization
const SPLIT_PUNCTUATION = [
	"|",   // pipe - often separates title parts
	"—",   // em dash
	"–",   // en dash
	":",   // colon - common subtitle separator
	"\uFE55", // ﹕ Small Colon (sanitized version)
	";",   // semicolon
	"?",   // question mark
	"\uFE56", // ﹖ Small Question Mark (sanitized version)
	"!",   // exclamation
	".",   // period
	")",   // closing paren
	"]",   // closing bracket
	"\u2990", // ⦐ Right Square Bracket with Tick (sanitized version)
	",",   // comma
	"-",   // hyphen
];

/**
 * Truncate a string smartly by looking for good split points.
 * Tries to split at punctuation first, then space, then hard truncate.
 */
function smartTruncate(text: string, maxLength: number): string {
	if (text.length <= maxLength) {
		return text;
	}

	const searchArea = text.slice(0, maxLength);

	// Step 1: Try to split at punctuation (preferred)
	for (const char of SPLIT_PUNCTUATION) {
		const splitIndex = searchArea.lastIndexOf(char);
		if (splitIndex >= MIN_SPLIT_LENGTH) {
			return text.slice(0, splitIndex + 1).trim();
		}
	}

	// Step 2: Fall back to splitting at space (word boundary)
	const spaceIndex = searchArea.lastIndexOf(" ");
	if (spaceIndex >= MIN_SPLIT_LENGTH) {
		return text.slice(0, spaceIndex).trim();
	}

	// Step 3: No good split point found, hard truncate
	return text.slice(0, maxLength).trim();
}

/**
 * Sanitize a string to be used as a safe filename.
 * Uses Unicode lookalike characters for common problematic chars,
 * then removes remaining dangerous characters.
 */
export function sanitizeFilename(dirty: string): string {
	let result = dirty;

	// Step 1: Replace problematic characters with Unicode lookalikes
	result = result.replace(/\?/g, "\uFE56");  // ﹖ Small Question Mark
	result = result.replace(/:/g, "\uFE55");   // ﹕ Small Colon
	result = result.replace(/\[/g, "\u298F");  // ⦏ Left Square Bracket with Tick
	result = result.replace(/\]/g, "\u2990");  // ⦐ Right Square Bracket with Tick
	result = result.replace(/\//g, "\u29F8");  // ⧸ Big Solidus
	result = result.replace(/\\/g, "\u29F9");  // ⧹ Big Reverse Solidus
	result = result.replace(/#/g, "\u2D4C");   // ⵌ Tifinagh Letter Tuareg Yagh

	// Step 2: Remove remaining dangerous characters
	// eslint-disable-next-line no-control-regex
	result = result.replace(/[/\\?%*:|"<>\x7F\x00-\x1F]/g, "-");

	// Step 3: Smart truncate to max length
	return smartTruncate(result, MAX_FILENAME_LENGTH);
}
