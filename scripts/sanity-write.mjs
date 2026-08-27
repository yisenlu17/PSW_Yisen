/**
 * The credential dance, once, for the scripts that write to the dataset.
 *
 * Every script here needs the same three things before it can do anything: the names
 * out of `.env.local`, a token that is allowed to write, and a client built from
 * both. Kept together so that the answer to "why did it say I have no token" is in
 * one file, and so a second script does not drift from the first on what counts as a
 * credential.
 */
import { createClient } from '@sanity/client'
import { readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

export const root = join(dirname(fileURLToPath(import.meta.url)), '..')

/** `.env.local`, read the way next reads it: a name already in the environment wins. */
export function loadEnv() {
  for (const line of readFileSync(join(root, '.env.local'), 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
  }
}

/**
 * `sanity login` stores its token here, and it carries whatever the account can do —
 * which for the owner of the dataset includes writing. Reading it is what lets one
 * `npx sanity login` stand in for a hand-made Editor token, exactly as the CLI's own
 * commands work. An explicit SANITY_API_WRITE_TOKEN still wins.
 */
export function cliToken() {
  try {
    const config = JSON.parse(
      readFileSync(join(homedir(), '.config', 'sanity', 'config.json'), 'utf8')
    )
    return config.authToken || null
  } catch {
    return null
  }
}

/**
 * A client for `command`, or a message and a non-zero exit.
 *
 * `needsWrite` is false for a dry run, which only ever reads: it should work on a
 * machine that has never logged in, so that what a script is about to do can be seen
 * before anyone goes looking for a token.
 */
export function writeClient(command, { needsWrite = true } = {}) {
  loadEnv()

  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
  // What a token is called here says nothing about what it may do — the API decides
  // that, and this dataset's read token happens to carry Editor rights. So every
  // credential on hand is worth trying in turn, and a token that is genuinely not
  // allowed comes back as a 403 that says so, which is a better answer than refusing
  // to try. Order is deliberate: the one named for writing wins where it exists.
  const token =
    process.env.SANITY_API_WRITE_TOKEN || cliToken() || process.env.SANITY_API_READ_TOKEN

  if (!projectId || projectId === 'placeholder') {
    console.error('✗ Set NEXT_PUBLIC_SANITY_PROJECT_ID in .env.local first.')
    process.exit(1)
  }
  if (!token && needsWrite) {
    console.error('✗ No credential at all. Either:')
    console.error('    npx sanity login          # then re-run this — no token to make')
    console.error('  or create an Editor token at https://www.sanity.io/manage → API → Tokens')
    console.error(`  and put SANITY_API_WRITE_TOKEN=<token> in .env.local, or pass it to ${command}.`)
    process.exit(1)
  }

  return createClient({
    projectId,
    dataset,
    token,
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-08-07',
    useCdn: false,
  })
}
