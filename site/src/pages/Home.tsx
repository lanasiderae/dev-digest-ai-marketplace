import type { Index, Stats } from '../types';
import { InstallCommand } from '../InstallCommand';

export function Home({ index, stats }: { index: Index; stats: Stats | null }) {
  const plugins = index.entries.filter((e) => e.kind === 'plugin');

  return (
    <div>
      <h1>{index.marketplace.name}</h1>
      <p className="subtitle">{index.marketplace.description}</p>
      {stats && (
        <p className="stats-line">
          {stats.totalPlugins} plugins · {stats.totalSkills} skills · {stats.totalAgents} agents ·{' '}
          {stats.totalEvalCases} eval case{stats.totalEvalCases === 1 ? '' : 's'}
        </p>
      )}

      <div className="card-grid">
        {plugins.map((p) => (
          <a key={p.id} className="card" href={`#/plugin/${p.id}`}>
            <h2>{p.name}</h2>
            <p className="version">v{p.version}</p>
            <p>{p.description}</p>
            {p.dependencies && p.dependencies.length > 0 && (
              <p className="deps">Depends on: {p.dependencies.join(', ')}</p>
            )}
          </a>
        ))}
      </div>

      <h2>Install the full pipeline</h2>
      <InstallCommand pluginName="sdd-engineering" />

      <p>
        <a href="#/search">Search the catalog</a> · <a href="#/getting-started">Getting started</a>{' '}
        · <a href="#/whats-new">What's new</a>
      </p>
    </div>
  );
}
