/**
 * Teaches TypeScript about the React that actually runs here.
 *
 * The App Router runs on a React canary that Next vendors itself, and that build
 * exports `<ViewTransition>`. TypeScript, meanwhile, resolves `react` to
 * `@types/react`, which describes the stable release and has never heard of it — so
 * without this line the import fails `tsc` while working perfectly at runtime.
 *
 * A reference rather than `compilerOptions.types`, which would replace the default
 * `@types` resolution rather than adding to it.
 */
/// <reference types="react/canary" />
