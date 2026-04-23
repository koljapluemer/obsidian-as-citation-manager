import { Transform } from "unicode2latex";

const bibtexTransform = new Transform("bibtex");

export function encodeBibtexValue(value: string): string {
	return bibtexTransform.tolatex(value);
}
