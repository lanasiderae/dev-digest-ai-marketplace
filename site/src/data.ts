import type { Index, Releases, Stats } from './types';

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`Failed to load ${path}: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function loadIndex(): Promise<Index> {
  return fetchJson<Index>('./index.json');
}

export function loadReleases(): Promise<Releases> {
  return fetchJson<Releases>('./releases.json');
}

export function loadStats(): Promise<Stats> {
  return fetchJson<Stats>('./stats.json');
}

export async function loadBody(bodyPath: string | null): Promise<string> {
  if (!bodyPath) return '';
  const res = await fetch(`./${bodyPath}`);
  if (!res.ok) return '';
  return res.text();
}
