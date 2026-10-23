import { useMemo, useState } from 'react';
import MiniSearch from 'minisearch';
import type { Index, IndexEntry } from '../types';

interface SearchDoc {
  id: string;
  kind: IndexEntry['kind'];
  plugin: string;
  name: string;
  description: string;
  keywords: string;
  searchText: string;
}

function buildSearch(index: Index) {
  const ms = new MiniSearch<SearchDoc>({
    fields: ['name', 'description', 'keywords', 'searchText'],
    storeFields: ['kind', 'id', 'plugin', 'name', 'description'],
    searchOptions: {
      prefix: true,
      fuzzy: 0.2,
      boost: { name: 4, description: 2, keywords: 2, searchText: 1 },
    },
  });
  ms.addAll(
    index.entries.map((e) => ({
      id: e.id,
      kind: e.kind,
      plugin: e.plugin,
      name: e.name,
      description: e.description,
      keywords: e.keywords.join(' '),
      searchText: e.searchText,
    }))
  );
  return ms;
}

export function Search({
  index,
  initialQuery = '',
  initialKind = null,
}: {
  index: Index;
  initialQuery?: string;
  initialKind?: 'plugin' | 'skill' | 'agent' | null;
}) {
  const ms = useMemo(() => buildSearch(index), [index]);
  const [query, setQuery] = useState(initialQuery);

  const results = useMemo(() => {
    if (!query.trim()) {
      // No query text: browsing a kind (from Home's stat tiles) shows
      // every entry of it rather than requiring search text.
      if (!initialKind) return [];
      return index.entries
        .filter((e) => e.kind === initialKind)
        .map((e) => ({
          id: e.id,
          kind: e.kind,
          plugin: e.plugin,
          name: e.name,
          description: e.description,
          keywords: e.keywords.join(' '),
          searchText: e.searchText,
          score: 1,
        }));
    }
    return ms.search(query) as unknown as Array<SearchDoc & { score: number }>;
  }, [ms, query, index, initialKind]);

  const grouped = {
    plugin: results.filter((r) => r.kind === 'plugin'),
    skill: results.filter((r) => r.kind === 'skill'),
    agent: results.filter((r) => r.kind === 'agent'),
  };

  const detailHref = (e: SearchDoc) =>
    e.kind === 'plugin' ? `#/plugin/${e.id}` : `#/artifact/${e.id}`;

  return (
    <div>
      <h1>Search</h1>
      <input
        autoFocus
        type="search"
        placeholder="Search plugins, skills, agents…"
        value={query}
        onChange={(ev) => setQuery(ev.target.value)}
        className="search-box"
      />

      {!query.trim() && !initialKind && <p>Describe what you need, or pick a kind from Home.</p>}
      {query.trim() && results.length === 0 && <p>No results for "{query}".</p>}
      {!query.trim() && initialKind && results.length === 0 && (
        <p>No {initialKind} entries in the catalog yet.</p>
      )}

      {(['plugin', 'skill', 'agent'] as const).map((kind) =>
        grouped[kind].length > 0 ? (
          <section key={kind}>
            <h2>{kind === 'plugin' ? 'Plugins' : kind === 'skill' ? 'Skills' : 'Agents'}</h2>
            <ul className="result-list">
              {grouped[kind].map((r) => (
                <li key={r.id}>
                  <a href={detailHref(r)}>{r.name}</a>
                  <span className="plugin-tag"> ({r.plugin})</span>
                  <p>{r.description}</p>
                </li>
              ))}
            </ul>
          </section>
        ) : null
      )}
    </div>
  );
}
