/**
 * Lines of an MDX body that are not inside a fenced code block.
 * Shared by the content validator and the table-of-contents builder so both
 * agree on what counts as a heading or a component tag.
 */
export function* proseLines(body: string): Generator<string> {
  let fence: { marker: string; length: number } | null = null;
  for (const line of body.split(/\r?\n/)) {
    const fenceMatch = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(line);
    if (fenceMatch) {
      const [, run, rest] = fenceMatch;
      if (fence === null) {
        fence = { marker: run[0], length: run.length };
        continue;
      }
      // A fence closes only on the same character, at least as long, with nothing after it.
      if (
        run[0] === fence.marker &&
        run.length >= fence.length &&
        rest.trim() === ""
      ) {
        fence = null;
        continue;
      }
    }
    if (fence === null) yield line;
  }
}
