import { App, Modal, Notice, Setting } from "obsidian";

/**
 * Modal for inputting BibTeX data.
 * Provides a textarea for pasting BibTeX and confirm/cancel buttons.
 */
export class BibtexInputModal extends Modal {
	private bibtexInput = "";
	private readonly onSubmit: (bibtex: string) => void;

	constructor(app: App, onSubmit: (bibtex: string) => void) {
		super(app);
		this.onSubmit = onSubmit;
	}

	onOpen(): void {
		const { contentEl } = this;

		contentEl.createEl("h2", { text: "Create literature note from BibTeX" });

		// Textarea for BibTeX input
		const textareaContainer = contentEl.createDiv({ cls: "bibtex-input-container" });
		const textarea = textareaContainer.createEl("textarea", {
			attr: {
				placeholder: "Paste BibTeX entry here...\n\nExample:\n@article{key,\n  author = {Author Name},\n  title = {Article Title},\n  year = {2023},\n  journal = {Journal Name}\n}",
				rows: "15",
			},
		});
		textarea.style.width = "100%";
		textarea.style.fontFamily = "monospace";
		textarea.style.resize = "vertical";

		textarea.addEventListener("input", (e) => {
			this.bibtexInput = (e.target as HTMLTextAreaElement).value;
		});

		// Button row
		new Setting(contentEl)
			.addButton((btn) =>
				btn
					.setButtonText("Cancel")
					.onClick(() => this.close())
			)
			.addButton((btn) =>
				btn
					.setButtonText("Create note")
					.setCta()
					.onClick(() => {
						if (this.bibtexInput.trim()) {
							this.onSubmit(this.bibtexInput);
							this.close();
						} else {
							new Notice("Please enter BibTeX data");
						}
					})
			);
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
	}
}
