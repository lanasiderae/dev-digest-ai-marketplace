import { useEffect, useState } from 'react';
import type { Index, Releases } from '../types';
import { loadBody } from '../data';
import { SafeMarkdown } from '../SafeMarkdown';
import { InstallCommand } from '../InstallCommand';

export function PluginDetail({
  index,
  releases,
  name,
}: {
  index: Index;
  releases: Releases | null;
  name: string;
}) {
  const plugin = index.entries.find((e) => e.kind === 'plugin' && e.id === name);
  const components = index.entries.filter(
    (e) => e.kind !== 'plugin' && e.plugin === name
  );
  const [body, setBody] = useState('');

  useEffect(() => {
    setBody('');
    if (plugin) {
      loadBody(plugin.bodyPath).then(setBody);
    }
  }, [plugin]);

  if (!plugin) {
    return (
      <div>
        <p>Plugin "{name}" not found.</p>
        <a href="#/">Back to home</a>
      </div>
    );
  }

  const pluginReleases = releases?.releases.filter((r) => r.plugin === name) ?? [];

  return (
    <div>
      <p>
        <a href="#/">← All plugins</a>
      </p>
      <h1>{plugin.name}</h1>
      <p className="version">
        v{plugin.version} · owner: {index.marketplace.owner?.name ?? 'unknown'}
      </p>
      {plugin.compatibility?.claudeCode && (
        <p>Requires Claude Code {plugin.compatibility.claudeCode}</p>
      )}

      {plugin.dependencies && plugin.dependencies.length > 0 && (
        <div>
          <h2>Dependencies</h2>
          <ul>
            {plugin.dependencies.map((dep) => {
              const [depName, range] = dep.split('@');
              return (
                <li key={dep}>
                  <a href={`#/plugin/${depName}`}>{depName}</a> {range ? `@${range}` : ''}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <h2>Components</h2>
      <ul>
        {components.map((c) => (
          <li key={c.id}>
            <a href={`#/artifact/${c.id}`}>
              {c.name} <span className="kind-tag">({c.kind})</span>
            </a>
          </li>
        ))}
        {components.length === 0 && <li>No skills or agents indexed for this plugin.</li>}
      </ul>

      <h2>Install</h2>
      <InstallCommand pluginName={plugin.name} />

      {pluginReleases.length > 0 && (
        <>
          <h2>Releases</h2>
          <ul>
            {pluginReleases.map((r) => (
              <li key={r.version}>
                <strong>v{r.version}</strong> {r.date ? `— ${r.date}` : ''}
              </li>
            ))}
          </ul>
        </>
      )}

      <h2>README</h2>
      <SafeMarkdown markdown={body} />
    </div>
  );
}
