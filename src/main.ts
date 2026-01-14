import { Notice, Plugin, stringifyYaml, TFile } from "obsidian";
import { CitationManagerSettings } from "./types";
import { DEFAULT_SETTINGS, CitationManagerSettingTab } from "./settings";
import { BibtexInputModal } from "./ui/BibtexInputModal";
import { parseBibtex } from "./utils/bibtexParser";
import { sanitizeFilename } from "./utils/filenameUtils";
import { generateCitationKey, findUniqueCitationKey } from "./utils/citationKeyGenerator";

export default class CitationManagerPlugin extends Plugin {
	settings: CitationManagerSettings;

	async onload(): Promise<void> {
		await this.loadSettings();

		this.addCommand({
			id: "create-literature-note-from-bibtex",
			name: "Create literature note from BibTeX string",
			callback: () => {
				new BibtexInputModal(this.app, (bibtex) => {
					this.createLiteratureNote(bibtex);
				}).open();
			},
		});

		this.addSettingTab(new CitationManagerSettingTab(this.app, this));
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<CitationManagerSettings>);
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}

	private async createLiteratureNote(bibtexString: string): Promise<void> {
		// Validate folder setting
		if (!this.settings.literatureFolder) {
			new Notice("Please set a literature folder in settings first.");
			return;
		}

		// Ensure the folder exists
		const folder = this.app.vault.getAbstractFileByPath(this.settings.literatureFolder);
		if (!folder) {
			new Notice(`Literature folder "${this.settings.literatureFolder}" does not exist.`);
			return;
		}

		// Parse BibTeX
		const entry = parseBibtex(bibtexString);
		if (!entry) {
			new Notice("Failed to parse BibTeX entry. Please check the format.");
			return;
		}

		// Get title for filename
		const title = entry.entryTags.title || "Untitled";
		const sanitizedTitle = sanitizeFilename(title);
		const filePath = `${this.settings.literatureFolder}/${sanitizedTitle}.md`;

		// Check if note already exists
		const existingFile = this.app.vault.getAbstractFileByPath(filePath);
		if (existingFile instanceof TFile) {
			new Notice(`Note "${sanitizedTitle}" already exists. Skipping.`);
			return;
		}

		// Generate citation key with collision detection
		const baseKey = generateCitationKey(
			entry.entryTags.author,
			entry.entryTags.year,
			entry.entryTags.title
		);
		const { key: citationKey, hadCollision } = await findUniqueCitationKey(
			this.app,
			baseKey,
			this.settings.literatureFolder
		);

		if (hadCollision) {
			new Notice(`Citation key collision detected. Using "${citationKey}" instead.`);
		}

		// Build frontmatter with all BibTeX fields
		const frontmatterData: Record<string, string> = {
			citationKey,
			...entry.entryTags,
		};

		// Add entry type if not already present
		if (entry.entryType && !frontmatterData.entryType) {
			frontmatterData.entryType = entry.entryType;
		}

		const yamlContent = stringifyYaml(frontmatterData);
		let content = `---\n${yamlContent}---\n`;

		// Optionally add URL to content
		if (this.settings.addUrlToContent && entry.entryTags.url) {
			content += `\n- [${entry.entryTags.url}](${entry.entryTags.url})\n`;
		}

		// Create the note
		try {
			await this.app.vault.create(filePath, content);
			new Notice(`Created literature note: ${sanitizedTitle}`);
		} catch (error) {
			new Notice(`Failed to create note: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}
}
