# Obsidian as Citation Manager

An Obsidian plugin that treats your vault as the source of truth for citation metadata.

Instead of managing references in a separate app and exporting into Obsidian later, this plugin lets you paste a BibTeX entry directly into Obsidian, create or enrich a literature note from it, and optionally keep a `.bib` file in sync with the metadata stored in those notes.

## What it does

- Creates a literature note from a pasted BibTeX entry
- Stores BibTeX fields in YAML frontmatter
- Generates a `citationKey` automatically
- Uses the BibTeX title to derive a safe note filename
- Optionally adds the BibTeX `url` into the note body as a clickable link
- Adds BibTeX metadata to the currently open note
- Can automatically maintain a `.bib` file from notes in your literature folder

## How it works

The intended workflow is:

1. Pick a folder in your vault for literature notes.
2. Run a command and paste a BibTeX entry.
3. The plugin parses the first BibTeX entry, creates note frontmatter from it, and saves the note in your literature folder.
4. If BibTeX sync is enabled, the plugin rebuilds a configured `.bib` file from frontmatter across notes in that folder.

This keeps the editable metadata inside your Obsidian notes while still allowing export back into BibTeX form.

## Commands

The plugin currently registers two commands:

- `Create literature note from BibTeX string`
- `Add BibTeX metadata to current note`

## Settings

### Literature folder

Path to the folder where new literature notes should be created. The setting uses vault folder suggestions while you type.

### Add URL to note content

When enabled, a BibTeX `url` field is also added to the note body as a clickable Markdown list item.

### Enable automatic .bib sync

When enabled, the plugin regenerates a `.bib` file whenever literature-note metadata changes, notes are deleted, or notes are renamed/moved.

### BibTeX file path

Path to the `.bib` file to maintain inside the vault. The setting supports autocomplete for existing `.bib` files and also allows entering a new path.

## Note format

For newly created literature notes, the plugin writes:

- all parsed BibTeX fields into YAML frontmatter
- a generated `citationKey`
- an `entryType` field when available
- an `aliases` field containing the original title if the filename had to be sanitized or truncated

If the note already exists, the plugin skips creation and shows an Obsidian notice.

If the generated citation key collides with an existing one, the plugin appends `-1`, `-2`, and so on until it finds a free key, then warns via notice.

## BibTeX sync behavior

When `.bib` sync is enabled, the plugin scans Markdown files in the configured literature folder and extracts BibTeX entries from frontmatter.

It excludes Obsidian-specific frontmatter keys such as:

- `aliases`
- `cssclass`
- `cssclasses`
- `tags`
- `position`

The generated `.bib` output is sorted by citation key for stable results.

## Installation for development

1. Clone this repository.
2. Install dependencies:

```bash
npm install
```

3. Build once:

```bash
npm run build
```

4. Or run the watcher during development:

```bash
npm run dev
```

5. Copy `main.js`, `manifest.json`, and `styles.css` into:

```text
<your-vault>/.obsidian/plugins/obsidian-as-citation-manager/
```

6. Reload Obsidian and enable the plugin under **Settings → Community plugins**.

## Project scripts

- `npm run dev` builds in watch mode
- `npm run build` runs TypeScript checks and creates the production bundle
- `npm run lint` runs ESLint

## Privacy and scope

This plugin is designed for local vault use. It does not need network access for its core features and works entirely on files inside your Obsidian vault.

## Current limitations

- The BibTeX import uses the first parsed entry from the pasted input
- The plugin assumes BibTeX data is stored in frontmatter for round-tripping into `.bib`
- Automatic `.bib` sync currently reacts to note metadata changes, deletions, and renames, but does not expose a separate manual sync command

## Sources

- [Article Collection Academic Obs Workflows](https://publish.obsidian.md/hub/04+-+Guides%2C+Workflows%2C+%26+Courses/for+Academic+Writing)
