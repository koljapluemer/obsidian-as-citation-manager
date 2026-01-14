import { App, PluginSettingTab, Setting } from "obsidian";
import CitationManagerPlugin from "./main";
import { CitationManagerSettings } from "./types";
import { FolderSuggest } from "./ui/FolderSuggest";

export const DEFAULT_SETTINGS: CitationManagerSettings = {
	literatureFolder: "",
	addUrlToContent: true,
};

export class CitationManagerSettingTab extends PluginSettingTab {
	plugin: CitationManagerPlugin;

	constructor(app: App, plugin: CitationManagerPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl("h2", { text: "Citation manager settings" });

		// Literature folder setting with autocomplete
		new Setting(containerEl)
			.setName("Literature folder")
			.setDesc("The folder where literature notes will be created.")
			.addText((text) => {
				// Add folder suggest functionality
				new FolderSuggest(this.app, text.inputEl);

				text
					.setPlaceholder("e.g., Literature")
					.setValue(this.plugin.settings.literatureFolder)
					.onChange(async (value) => {
						this.plugin.settings.literatureFolder = value;
						await this.plugin.saveSettings();
					});
			});

		// URL in content toggle
		new Setting(containerEl)
			.setName("Add URL to note content")
			.setDesc("When enabled, URLs from BibTeX entries will be added as clickable links in the note body.")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.addUrlToContent)
					.onChange(async (value) => {
						this.plugin.settings.addUrlToContent = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
