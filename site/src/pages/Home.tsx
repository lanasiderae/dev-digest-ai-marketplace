import { useMemo, useState } from 'react';
import type { Index, Releases, Stats } from '../types';
import { InstallCommand } from '../InstallCommand';

const TRY_QUERIES = [
  'write a spec for a feature',
  'review architecture',
  'research a library',
  'retro after release',
];

type StatKind = 'plugin' | 'skill' | 'agent' | 'command' | 'hook' | 'mcp';

const STAT_TILES: Array<{ kind: StatKind; label: string }> = [
  { kind: 'plugin', label: 'plugins' },
  { kind: 'skill', label: 'skills' },
  { kind: 'agent', label: 'agents' },
  { kind: 'command', label: 'commands' },
  { kind: 'hook', label: 'hooks' },
  { kind: 'mcp', label: 'MCP servers' },
];

function Icon({ d, ...rest }: { d: string } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...rest}>
      <path d={d} />
    </svg>
  );
}

const ICON_PATHS: Record<StatKind, string> = {
  plugin: 'M7 3v2.5a1.5 1.5 0 0 0 3 0V3h4v4h-2.5a1.5 1.5 0 0 0 0 3H14v4h-4v-2.5a1.5 1.5 0 0 0-3 0V14H3v-4h2.5a1.5 1.5 0 0 0 0-3H3V3z',
  skill: 'M3 4.5A1.5 1.5 0 0 1 4.5 3H10v12.5H4.5A1.5 1.5 0 0 0 3 17zM17 4.5A1.5 1.5 0 0 0 15.5 3H10v12.5h5.5a1.5 1.5 0 0 1 1.5 1.5z',
  agent: 'M10 2v2.5M5 8h10a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1zM7.5 12v-.5M12.5 12v-.5M3 11h2M15 11h2',
  command: 'M3 4h14a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zM5 8l3 2.5L5 13M11 13h4',
  hook: 'M7 3h3a2 2 0 0 1 2 2v6a3 3 0 1 1-6 0V6M12 11l2 2-2 2',
  mcp: 'M4 7h12M4 13h12M6.5 4.5v2M13.5 4.5v2M6.5 13.5v2M13.5 13.5v2',
};

function statCount(stats: Stats | null, kind: (typeof STAT_TILES)[number]['kind']): number {
  if (!stats) return 0;
  switch (kind) {
    case 'plugin':
      return stats.totalPlugins;
    case 'skill':
      return stats.totalSkills;
    case 'agent':
      return stats.totalAgents;
    case 'command':
      return stats.totalCommands;
    case 'hook':
      return stats.totalHooks;
    case 'mcp':
      return stats.totalMcpServers;
  }
}

function topKeywords(index: Index, limit = 6): string[] {
  const counts = new Map<string, number>();
  for (const e of index.entries) {
    for (const k of e.keywords) counts.set(k, (counts.get(k) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([k]) => k);
}

export function Home({ index, stats, releases }: { index: Index; stats: Stats | null; releases?: Releases | null }) {
  const [query, setQuery] = useState('');
  const keywords = useMemo(() => topKeywords(index), [index]);
  const repoSlug = index.marketplace.repoSlug;
  const recentReleases = (releases?.releases ?? []).slice(0, 5);

  const goSearch = (q: string) => {
    window.location.hash = `/search?q=${encodeURIComponent(q)}`;
  };

  return (
    <div className="home">
      <div className="home-grid">
        <div className="home-main">
          <h1>Find the plugin, skill or agent for the job.</h1>
          <p className="subtitle">
            Search everything in the marketplace, check what an artifact does and which
            tools it may use, then install it with one copy-paste.
          </p>

          <form
            className="hero-search"
            onSubmit={(ev) => {
              ev.preventDefault();
              if (query.trim()) goSearch(query);
            }}
          >
            <input
              type="search"
              placeholder="Describe what you need — e.g. 'skill for refactoring React'"
              value={query}
              onChange={(ev) => setQuery(ev.target.value)}
              className="search-box"
            />
            <button type="submit">Search</button>
          </form>

          <p className="try-row">
            Try{' '}
            {TRY_QUERIES.map((q, i) => (
              <span key={q}>
                <button type="button" className="chip" onClick={() => goSearch(q)}>
                  {q}
                </button>
                {i < TRY_QUERIES.length - 1 ? ' ' : ''}
              </span>
            ))}
          </p>

          {keywords.length > 0 && (
            <p className="keywords-row">
              Popular keywords:{' '}
              {keywords.map((k) => (
                <button key={k} type="button" className="keyword-tag" onClick={() => goSearch(k)}>
                  #{k}
                </button>
              ))}
            </p>
          )}

          <div className="catalog-header">
            <h2>Browse the catalog</h2>
            <span className="hint">Pick a kind to see every entry of it</span>
          </div>

          <div className="stat-grid">
            {STAT_TILES.map((t) => (
              <a key={t.kind} className="stat-tile" data-kind={t.kind} href={`#/search?kind=${t.kind}`}>
                <span className="stat-icon">
                  <Icon d={ICON_PATHS[t.kind]} />
                </span>
                <span className="stat-count">{statCount(stats, t.kind)}</span>
                <span className={`kind-tag kind-${t.kind}`}>{t.kind}</span>
                <span className="stat-label">{t.label}</span>
              </a>
            ))}
          </div>
        </div>

        <aside className="home-sidebar">
          <div className="sidebar-card">
            <p>Run this once in Claude Code, then install any plugin from the catalog.</p>
            {repoSlug ? (
              <InstallCommand command={`/plugin marketplace add ${repoSlug}`} />
            ) : (
              <InstallCommand command="/plugin marketplace add <owner>/<repo>" />
            )}
            <a className="sidebar-link" href="#/getting-started">
              Full setup guide, private repo access and team settings →
            </a>
          </div>

          <div className="sidebar-card">
            <div className="sidebar-card-header">
              <h3>What's new</h3>
              <a href="#/whats-new">All releases →</a>
            </div>
            {recentReleases.length === 0 ? (
              <p className="hint">No releases yet.</p>
            ) : (
              <ul className="whats-new-list">
                {recentReleases.map((r, i) => (
                  <li key={`${r.plugin}-${r.version}-${i}`}>
                    <div className="whats-new-row">
                      <a href={`#/plugin/${r.plugin}`}>{r.plugin}</a>
                      <span className="version-tag">v{r.version}</span>
                    </div>
                    <p className="whats-new-snippet">{r.body.slice(0, 80).replace(/\n/g, ' ')}…</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>

      <footer className="site-footer">
        {repoSlug ? <a href={`https://github.com/${repoSlug}`}>github.com/{repoSlug}</a> : <span />}
        <span>index generated {new Date(index.generatedAt).toISOString().replace('T', ' ').slice(0, 16)} UTC · schema v1</span>
      </footer>
    </div>
  );
}
