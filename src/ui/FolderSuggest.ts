import { AbstractInputSuggest, App, TFolder } from "obsidian";

/**
 * A suggest component for folder paths in the vault.
 * Provides autocomplete functionality for selecting folders.
 */
export class FolderSuggest extends AbstractInputSuggest<TFolder> {
	private textInputEl: HTMLInputElement;

	constructor(app: App, inputEl: HTMLInputElement) {
		super(app, inputEl);
		this.textInputEl = inputEl;
	}

	getSuggestions(inputStr: string): TFolder[] {
		const lowerInput = inputStr.toLowerCase();
		const folders: TFolder[] = [];

		// Get all folders from the vault
		const allFiles = this.app.vault.getAllLoadedFiles();
		for (const file of allFiles) {
			if (file instanceof TFolder) {
				// Filter by input string (case-insensitive)
				if (file.path.toLowerCase().includes(lowerInput)) {
					folders.push(file);
				}
			}
		}

		// Sort by path length (shorter paths first), then alphabetically
		folders.sort((a, b) => {
			if (a.path.length !== b.path.length) {
				return a.path.length - b.path.length;
			}
			return a.path.localeCompare(b.path);
		});

		return folders.slice(0, 20);  // Limit suggestions
	}

	renderSuggestion(folder: TFolder, el: HTMLElement): void {
		el.setText(folder.path);
	}

	selectSuggestion(folder: TFolder): void {
		this.textInputEl.value = folder.path;
		this.textInputEl.trigger("input");
		this.close();
	}
}
