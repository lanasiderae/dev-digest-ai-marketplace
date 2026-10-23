import { useEffect, useState } from 'react';
import { useHashRoute } from './useHashRoute';
import { loadIndex, loadReleases, loadStats } from './data';
import type { Index, Releases, Stats } from './types';
import { Home } from './pages/Home';
import { Search } from './pages/Search';
import { PluginDetail } from './pages/PluginDetail';
import { ArtifactDetail } from './pages/ArtifactDetail';
import { WhatsNew } from './pages/WhatsNew';
import { GettingStarted } from './pages/GettingStarted';

export function App() {
  const [hash] = useHashRoute();
  const [index, setIndex] = useState<Index | null>(null);
  const [releases, setReleases] = useState<Releases | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadIndex().then(setIndex).catch((e) => setError(String(e)));
    loadReleases().then(setReleases).catch(() => undefined);
    loadStats().then(setStats).catch(() => undefined);
  }, []);

  if (error) {
    return (
      <main className="container">
        <p>Failed to load catalog data: {error}</p>
        <p>Run `node scripts/build-index.mjs` from the repo root, then rebuild the site.</p>
      </main>
    );
  }

  if (!index) {
    return (
      <main className="container">
        <p>Loading…</p>
      </main>
    );
  }

  const [routePath, queryString] = hash.split('?');
  const params = new URLSearchParams(queryString || '');
  const pluginMatch = routePath.match(/^\/plugin\/(.+)$/);
  const artifactMatch = routePath.match(/^\/artifact\/(.+)$/);

  let page: React.ReactNode;
  if (routePath === '/' || routePath === '') {
    page = <Home index={index} stats={stats} releases={releases} />;
  } else if (routePath === '/search') {
    page = (
      <Search
        index={index}
        initialQuery={params.get('q') || ''}
        initialKind={(params.get('kind') as 'plugin' | 'skill' | 'agent' | null) || null}
      />
    );
  } else if (pluginMatch) {
    page = <PluginDetail index={index} releases={releases} name={decodeURIComponent(pluginMatch[1])} />;
  } else if (artifactMatch) {
    page = <ArtifactDetail index={index} id={decodeURIComponent(artifactMatch[1])} />;
  } else if (routePath === '/whats-new') {
    page = <WhatsNew releases={releases} />;
  } else if (routePath === '/getting-started') {
    page = <GettingStarted />;
  } else {
    page = (
      <div>
        <p>Not found: {routePath}</p>
        <a href="#/">Back to home</a>
      </div>
    );
  }

  return (
    <main className="container">
      <nav className="top-nav">
        <a href="#/">Home</a>
        <a href="#/search">Search</a>
        <a href="#/whats-new">What's new</a>
        <a href="#/getting-started">Getting started</a>
      </nav>
      {page}
    </main>
  );
}
