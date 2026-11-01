import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

// Construct tokens so this file does not itself contain the forbidden literals.
const forbiddenTokens = [
  ['VITE', 'API', 'ADMIN', 'KEY'].join('_'),
  ['x', 'admin', 'key'].join('-'),
]

const skipDirNames = new Set(['.git', 'node_modules'])
const skipFileNames = new Set(['package-lock.json'])
const binaryExtensions = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.ico',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot',
  '.mp4',
  '.webm',
  '.pdf',
  '.zip',
  '.gz',
  '.wasm',
])

const collectFiles = (dir, files = []) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (skipDirNames.has(entry.name)) continue
      collectFiles(fullPath, files)
      continue
    }
    if (skipFileNames.has(entry.name)) continue
    if (binaryExtensions.has(path.extname(entry.name).toLowerCase())) continue
    files.push(fullPath)
  }
  return files
}

const detectorSample = [
  `import.meta.env.${forbiddenTokens[0]}`,
  `headers['${forbiddenTokens[1]}'] = secret`,
].join('\n')

for (const token of forbiddenTokens) {
  if (!detectorSample.includes(token)) {
    console.error(`[security] Internal detector failed to recognize ${token}`)
    process.exit(1)
  }
}

const files = collectFiles(projectRoot)
const hits = []

for (const filePath of files) {
  let contents
  try {
    const stats = statSync(filePath)
    if (!stats.isFile() || stats.size === 0) continue
    contents = readFileSync(filePath, 'utf8')
  } catch {
    continue
  }

  if (contents.includes('\u0000')) continue

  for (const token of forbiddenTokens) {
    if (contents.includes(token)) {
      hits.push(`${path.relative(projectRoot, filePath)}: ${token}`)
    }
  }
}

if (hits.length) {
  console.error('[security] Forbidden admin-key references found:')
  for (const hit of hits) {
    console.error(`  - ${hit}`)
  }
  process.exit(1)
}

const distHint = existsSync(path.join(projectRoot, 'dist'))
  ? 'source and built assets'
  : 'source (dist not present yet)'

console.log(`[security] No forbidden admin-key references in ${distHint}.`)
