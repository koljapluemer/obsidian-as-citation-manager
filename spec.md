You see here a basic Obsidian plugin template.
Let's build it out.

This should be a citation manager where Obsidian is directly the source of truth.
Let's build the MVP.

We need a `Setting` allowing is to set which of our folders is the literature folder.
Use some smart dropdown logic to auto-suggest folders from our vault.

And then, for now, implement a single command "Create literature note from bibtex string",
which opens a modal where the user can copypaste bibtex into a textarea, then confirm or cancel.

Then, a note is created in the folder, with the title being the title/name of the document.
Use this logic to generate a safe filename, and crop to 100 chars or so if needed. Do no other parsing!

```
dirty = dirty.replace("?", "﹖")
dirty = dirty.replace(":", "﹕")
dirty = dirty.replace("[", "⦏")
dirty = dirty.replace("]", "⦐")
dirty = dirty.replace("/", "⧸")
dirty = dirty.replace("\\", "⧹")
dirty = dirty.replace("#", "ⵌ")
clean = re.sub(r"[/\\?%*:|\"<>\x7F\x00-\x1F]", "-", dirty)
return clean
```

If a note with this title already exist, skip and throw a `Notice`.
Persist *all* bibtex props given in the string in the yaml frontmatter of the newly created note, in correct yaml.
Generate a `citationKey` as well, using some reasonable heuristic utilizing title, author, year, whatever. 
If `citiationKey` would collide, do a simple evasion (add `-1` or something) and warn the user of this in a `Notice`.

Also, if a `url` is given, not only add that url to the frontmatter, but also to the content of the note, as 
`\n- [url]($url)`, so the url is readily clickable from within Obs. Allow turning this behavior off in a setting.