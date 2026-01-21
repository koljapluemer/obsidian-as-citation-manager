import { AbstractInputSuggest, App, TFile } from "obsidian";

/**
 * A suggest component for file paths in the vault.
 * Provides autocomplete functionality for selecting files with a specific extension.
 * Also allows typing new paths for non-existent files.
 */
export class FileSuggest extends AbstractInputSuggest<TFile | string> {
	private textInputEl: HTMLInputElement;
	private extension: string;

	constructor(app: App, inputEl: HTMLInputElement, extension: string) {
		super(app, inputEl);
		this.textInputEl = inputEl;
		this.extension = extension.startsWith(".") ? extension : `.${extension}`;
	}

	getSuggestions(inputStr: string): (TFile | string)[] {
		const lowerInput = inputStr.toLowerCase();
		const suggestions: (TFile | string)[] = [];

		// Get all files with the specified extension
		const allFiles = this.app.vault.getAllLoadedFiles();
		for (const file of allFiles) {
			if (file instanceof TFile && file.extension === this.extension.slice(1)) {
				if (file.path.toLowerCase().includes(lowerInput)) {
					suggestions.push(file);
				}
			}
		}

		// Sort by path length (shorter paths first), then alphabetically
		suggestions.sort((a, b) => {
			const pathA = a instanceof TFile ? a.path : a;
			const pathB = b instanceof TFile ? b.path : b;
			if (pathA.length !== pathB.length) {
				return pathA.length - pathB.length;
			}
			return pathA.localeCompare(pathB);
		});

		// If input ends with the extension and no exact match exists, suggest creating new file
		if (inputStr.endsWith(this.extension) && inputStr.length > this.extension.length) {
			const existingPaths = suggestions.map(s => s instanceof TFile ? s.path : s);
			if (!existingPaths.includes(inputStr)) {
				suggestions.unshift(inputStr);
			}
		}

		return suggestions.slice(0, 20);
	}

	renderSuggestion(item: TFile | string, el: HTMLElement): void {
		if (item instanceof TFile) {
			el.setText(item.path);
		} else {
			el.setText(`${item} (create new)`);
		}
	}

	selectSuggestion(item: TFile | string): void {
		this.textInputEl.value = item instanceof TFile ? item.path : item;
		this.textInputEl.trigger("input");
		this.close();
	}
}
