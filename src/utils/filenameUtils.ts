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

	// Step 3: Crop to 100 characters
	return result.slice(0, 100);
}
