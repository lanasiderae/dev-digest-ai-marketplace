import type { Releases } from '../types';

export function WhatsNew({ releases }: { releases: Releases | null }) {
  if (!releases) return <p>Loading…</p>;

  return (
    <div>
      <h1>What's new</h1>
      <ul className="release-list">
        {releases.releases.map((r) => (
          <li key={`${r.plugin}-${r.version}`}>
            <h3>
              <a href={`#/plugin/${r.plugin}`}>{r.plugin}</a> v{r.version}{' '}
              {r.date && <span className="date">— {r.date}</span>}
            </h3>
            <p>{r.body.slice(0, 280)}</p>
          </li>
        ))}
        {releases.releases.length === 0 && <li>No releases recorded yet.</li>}
      </ul>
    </div>
  );
}
