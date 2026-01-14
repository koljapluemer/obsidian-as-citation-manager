export interface CitationManagerSettings {
	literatureFolder: string;
	addUrlToContent: boolean;
}

export interface BibtexEntry {
	entryType: string;
	citationKey?: string;
	entryTags: Record<string, string>;
}

export interface ParsedCitation {
	title: string;
	authors: string[];
	year?: string;
	url?: string;
	allFields: Record<string, string>;
}
