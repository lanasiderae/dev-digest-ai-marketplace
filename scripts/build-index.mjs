#!/usr/bin/env node
/**
 * build-index.mjs
 *
 * Reads .claude-plugin/marketplace.json plus each plugin's plugin.json,
 * README.md, CHANGELOG.md, COMPATIBILITY.md, and its skills'/agents'
 * frontmatter+body, and writes the site's data files:
 *
 *   site/public/index.json     - the searchable plugin/skill/agent catalog
 *   site/public/releases.json  - per-plugin version history (from CHANGELOG.md)
 *   site/public/stats.json     - aggregate counts
 *   site/public/bodies/*.md    - raw markdown bodies for detail pages
 *
 * No dependencies beyond Node's stdlib. Run with: node scripts/build-index.mjs
 */

import { readFile, writeFile, mkdir, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PLUGINS_DIR = path.join(ROOT, 'plugins');
const SITE_PUBLIC_DIR = path.join(ROOT, 'site', 'public');
const BODIES_DIR = path.join(SITE_PUBLIC_DIR, 'bodies');

/** Minimal YAML-frontmatter splitter: no external deps. Handles the
 * flat key: value / key: "value" / key: [a, b] shapes used in this
 * repo's SKILL.md / agent .md frontmatter. Not a general YAML parser. */
function splitFrontmatter(raw) {
  if (!raw.startsWith('---\n') && !raw.startsWith('---\r\n')) {
    return { frontmatter: {}, body: raw };
  }
  const end = raw.indexOf('\n---', 3);
  if (end === -1) return { frontmatter: {}, body: raw };
  const fmBlock = raw.slice(raw.indexOf('\n') + 1, end);
  const bodyStart = raw.indexOf('\n', end + 1);
  const body = bodyStart === -1 ? '' : raw.slice(bodyStart + 1);
  const frontmatter = parseFlatYaml(fmBlock);
  return { frontmatter, body };
}

function parseFlatYaml(block) {
  const lines = block.split('\n');
  const out = {};
  let currentKey = null;
  let currentList = null;
  for (const line of lines) {
    if (/^\s*-\s+/.test(line) && currentKey) {
      const item = line.replace(/^\s*-\s+/, '').trim().replace(/^["']|["']$/g, '');
      if (!currentList) {
        currentList = [];
        out[currentKey] = currentList;
      }
      currentList.push(item);
      continue;
    }
    const m = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!m) continue;
    const [, key, rawValue] = m;
    currentKey = key;
    currentList = null;
    let value = rawValue.trim();
    if (value === '' || value === '|' || value === '>') {
      // Block scalar or nested mapping/list starts on following lines —
      // not fully handled by this minimal parser; leave as empty/marker.
      out[key] = value === '' ? '' : value;
      continue;
    }
    if (value.startsWith('[') && value.endsWith(']')) {
      out[key] = value
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean);
      continue;
    }
    // Strip a matching pair of quotes if present, without touching escaped
    // quotes inside (good enough for the descriptions used in this repo).
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

async function readJsonIfExists(p) {
  if (!existsSync(p)) return null;
  return JSON.parse(await readFile(p, 'utf8'));
}

async function readTextIfExists(p) {
  if (!existsSync(p)) return null;
  return readFile(p, 'utf8');
}

async function listDirs(p) {
  if (!existsSync(p)) return [];
  const entries = await readdir(p, { withFileTypes: true });
  return entries.filter((e) => e.isDirectory()).map((e) => e.name);
}

async function findMarkdownFiles(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  async function walk(d) {
    const entries = await readdir(d, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) {
        await walk(full);
      } else if (e.isFile() && e.name.toLowerCase().endsWith('.md')) {
        out.push(full);
      }
    }
  }
  await walk(dir);
  return out;
}

function slugifyId(pluginName, kind, name) {
  return `${pluginName}:${kind}:${name}`;
}

/** Parse "## [x.y.z] — date" headings out of a CHANGELOG.md body. */
function parseChangelog(markdown, pluginName) {
  if (!markdown) return [];
  const entries = [];
  const headingRe = /^##\s*\[([^\]]+)\]\s*(?:—|-)?\s*(.*)$/gm;
  const matches = [...markdown.matchAll(headingRe)];
  for (let i = 0; i < matches.length; i++) {
    const [, version, dateRaw] = matches[i];
    const start = matches[i].index + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : markdown.length;
    const body = markdown.slice(start, end).trim();
    entries.push({
      plugin: pluginName,
      version: version.trim(),
      date: dateRaw.trim() || null,
      body,
    });
  }
  return entries;
}

/** Parse "Claude Code: >= x.y.z" (or similar) out of COMPATIBILITY.md. */
function parseCompatibility(markdown) {
  if (!markdown) return { claudeCode: null, raw: null };
  const m = markdown.match(/Claude Code[^\n]*?([><=]=?\s*[\d.]+)/i);
  return { claudeCode: m ? m[1].trim() : null, raw: markdown.trim() };
}

async function writeBody(relPath, content) {
  const fullPath = path.join(BODIES_DIR, relPath);
  await mkdir(path.dirname(fullPath), { recursive: true });
  await writeFile(fullPath, content, 'utf8');
  return `bodies/${relPath}`;
}

async function buildSkillEntries(pluginDir, pluginName) {
  const skillsDir = path.join(pluginDir, 'skills');
  const names = await listDirs(skillsDir);
  const entries = [];
  for (const name of names) {
    const skillMdPath = path.join(skillsDir, name, 'SKILL.md');
    if (!existsSync(skillMdPath)) continue;
    const raw = await readFile(skillMdPath, 'utf8');
    const { frontmatter, body } = splitFrontmatter(raw);
    const bodyPath = await writeBody(`${pluginName}/skill-${name}.md`, body);
    entries.push({
      kind: 'skill',
      id: slugifyId(pluginName, 'skill', frontmatter.name || name),
      plugin: pluginName,
      name: frontmatter.name || name,
      description: frontmatter.description || '',
      keywords: Array.isArray(frontmatter.keywords) ? frontmatter.keywords : [],
      bodyPath,
      searchText: [frontmatter.name, frontmatter.description, body]
        .filter(Boolean)
        .join(' ')
        .toLowerCase(),
    });
  }
  return entries;
}

async function buildAgentEntries(pluginDir, pluginName) {
  const agentsDir = path.join(pluginDir, 'agents');
  if (!existsSync(agentsDir)) return [];
  const entries = await readdir(agentsDir, { withFileTypes: true });
  const out = [];
  for (const e of entries) {
    if (!e.isFile() || !e.name.endsWith('.md')) continue;
    const full = path.join(agentsDir, e.name);
    const raw = await readFile(full, 'utf8');
    const { frontmatter, body } = splitFrontmatter(raw);
    const name = frontmatter.name || path.basename(e.name, '.md');
    const bodyPath = await writeBody(`${pluginName}/agent-${name}.md`, body);
    out.push({
      kind: 'agent',
      id: slugifyId(pluginName, 'agent', name),
      plugin: pluginName,
      name,
      description: frontmatter.description || '',
      tools: frontmatter.tools || null,
      model: frontmatter.model || null,
      skills: Array.isArray(frontmatter.skills) ? frontmatter.skills : [],
      keywords: [],
      bodyPath,
      searchText: [name, frontmatter.description, body].filter(Boolean).join(' ').toLowerCase(),
    });
  }
  return out;
}

async function countEvalCases(pluginDir) {
  const evalsDir = path.join(pluginDir, 'evals');
  if (!existsSync(evalsDir)) return 0;
  const md = await findMarkdownFiles(evalsDir);
  // A "case" is a directory directly under evals/ containing either
  // case.yaml or prompt.md.
  const topDirs = await listDirs(evalsDir);
  let count = 0;
  for (const d of topDirs) {
    const dir = path.join(evalsDir, d);
    if (existsSync(path.join(dir, 'case.yaml')) || existsSync(path.join(dir, 'prompt.md'))) {
      count += 1;
    }
  }
  return count || (md.length > 0 ? 1 : 0);
}

/** Commands are `commands/*.md` slash-command definitions. */
async function countCommands(pluginDir) {
  const commandsDir = path.join(pluginDir, 'commands');
  if (!existsSync(commandsDir)) return 0;
  const entries = await readdir(commandsDir, { withFileTypes: true });
  return entries.filter((e) => e.isFile() && e.name.endsWith('.md')).length;
}

/** Hooks can be declared as `hooks/hooks.json` (array/object of hook defs)
 * or inline in plugin.json's own `hooks` field — either shape, count how
 * many distinct hook entries are declared. */
async function countHooks(pluginDir, pluginJson) {
  let count = 0;
  const hooksJsonPath = path.join(pluginDir, 'hooks', 'hooks.json');
  const hooksJson = await readJsonIfExists(hooksJsonPath);
  if (hooksJson) {
    count += Array.isArray(hooksJson) ? hooksJson.length : Object.keys(hooksJson).length;
  }
  if (pluginJson && pluginJson.hooks) {
    count += Array.isArray(pluginJson.hooks)
      ? pluginJson.hooks.length
      : Object.keys(pluginJson.hooks).length;
  }
  return count;
}

/** MCP servers can be declared as `.mcp.json`/`mcp.json` (an
 * `mcpServers` map) or inline in plugin.json's own `mcpServers` field. */
async function countMcpServers(pluginDir, pluginJson) {
  let count = 0;
  for (const name of ['.mcp.json', 'mcp.json']) {
    const mcpJson = await readJsonIfExists(path.join(pluginDir, name));
    if (mcpJson && mcpJson.mcpServers) {
      count += Object.keys(mcpJson.mcpServers).length;
    }
  }
  if (pluginJson && pluginJson.mcpServers) {
    count += Object.keys(pluginJson.mcpServers).length;
  }
  return count;
}

/** "<owner>/<repo>" parsed from `git remote get-url origin`, or null if
 * no remote is configured (e.g. a not-yet-pushed local scaffold). */
function gitRepoSlug() {
  try {
    const url = execFileSync('git', ['remote', 'get-url', 'origin'], {
      cwd: ROOT,
      encoding: 'utf8',
    }).trim();
    const m = url.match(/github\.com[:/]([^/]+)\/([^/.]+?)(?:\.git)?$/);
    return m ? `${m[1]}/${m[2]}` : null;
  } catch {
    return null;
  }
}

async function main() {
  await mkdir(SITE_PUBLIC_DIR, { recursive: true });
  await mkdir(BODIES_DIR, { recursive: true });

  const marketplace = await readJsonIfExists(
    path.join(ROOT, '.claude-plugin', 'marketplace.json')
  );
  if (!marketplace) {
    throw new Error('.claude-plugin/marketplace.json not found — run from the repo root');
  }

  const indexEntries = [];
  const releases = [];
  let totalSkills = 0;
  let totalAgents = 0;
  let totalEvalCases = 0;
  let totalCommands = 0;
  let totalHooks = 0;
  let totalMcpServers = 0;

  for (const pluginRef of marketplace.plugins) {
    const pluginDir = path.resolve(ROOT, pluginRef.source);
    const pluginJsonPath = path.join(pluginDir, '.claude-plugin', 'plugin.json');
    const pluginJson = await readJsonIfExists(pluginJsonPath);
    if (!pluginJson) {
      console.warn(`[build-index] WARNING: no plugin.json at ${pluginJsonPath}, skipping`);
      continue;
    }
    const pluginName = pluginJson.name;

    const readme = await readTextIfExists(path.join(pluginDir, 'README.md'));
    const changelog = await readTextIfExists(path.join(pluginDir, 'CHANGELOG.md'));
    const compatibility = await readTextIfExists(path.join(pluginDir, 'COMPATIBILITY.md'));

    const readmeBodyPath = readme ? await writeBody(`${pluginName}/README.md`, readme) : null;

    const skillEntries = await buildSkillEntries(pluginDir, pluginName);
    const agentEntries = await buildAgentEntries(pluginDir, pluginName);
    totalSkills += skillEntries.length;
    totalAgents += agentEntries.length;
    totalEvalCases += await countEvalCases(pluginDir);
    totalCommands += await countCommands(pluginDir);
    totalHooks += await countHooks(pluginDir, pluginJson);
    totalMcpServers += await countMcpServers(pluginDir, pluginJson);

    indexEntries.push({
      kind: 'plugin',
      id: pluginName,
      plugin: pluginName,
      name: pluginName,
      description: pluginJson.description || '',
      version: pluginJson.version || null,
      keywords: Array.isArray(pluginJson.keywords) ? pluginJson.keywords : [],
      dependencies: Array.isArray(pluginJson.dependencies) ? pluginJson.dependencies : [],
      compatibility: parseCompatibility(compatibility),
      bodyPath: readmeBodyPath,
      searchText: [
        pluginName,
        pluginJson.description,
        ...(pluginJson.keywords || []),
        readme,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase(),
    });

    indexEntries.push(...skillEntries, ...agentEntries);

    releases.push(...parseChangelog(changelog, pluginName));
  }

  const index = {
    generatedAt: new Date().toISOString(),
    marketplace: {
      name: marketplace.name,
      description: marketplace.description || '',
      owner: marketplace.owner || null,
      repoSlug: gitRepoSlug(),
    },
    entries: indexEntries,
  };

  releases.sort((a, b) => (a.date && b.date ? (a.date < b.date ? 1 : -1) : 0));

  const stats = {
    generatedAt: index.generatedAt,
    totalPlugins: marketplace.plugins.length,
    totalSkills,
    totalAgents,
    totalEvalCases,
    totalCommands,
    totalHooks,
    totalMcpServers,
  };

  await writeFile(path.join(SITE_PUBLIC_DIR, 'index.json'), JSON.stringify(index, null, 2));
  await writeFile(
    path.join(SITE_PUBLIC_DIR, 'releases.json'),
    JSON.stringify({ generatedAt: index.generatedAt, releases }, null, 2)
  );
  await writeFile(path.join(SITE_PUBLIC_DIR, 'stats.json'), JSON.stringify(stats, null, 2));

  console.log(
    `[build-index] wrote index.json (${indexEntries.length} entries), releases.json (${releases.length} entries), stats.json`
  );
}

main().catch((err) => {
  console.error('[build-index] FAILED:', err);
  process.exitCode = 1;
});
