/**
 * `draft-tools.tsx` for the static build — see the comment there for why it is
 * replaced rather than switched off.
 *
 * There is no editor behind a file host and nothing to preview against, so the honest
 * implementation of "show the draft tooling" is to show nothing. Kept as a component
 * rather than removing the call site, so the two builds render the same tree with one
 * branch of it empty.
 */
export function DraftTools() {
  return null
}
