import { useEffect, useState } from 'react';
import type { Index } from '../types';
import { loadBody } from '../data';
import { SafeMarkdown } from '../SafeMarkdown';

export function ArtifactDetail({ index, id }: { index: Index; id: string }) {
  const entry = index.entries.find((e) => e.id === id && e.kind !== 'plugin');
  const [body, setBody] = useState('');

  useEffect(() => {
    setBody('');
    if (entry) {
      loadBody(entry.bodyPath).then(setBody);
    }
  }, [entry]);

  if (!entry) {
    return (
      <div>
        <p>Component "{id}" not found.</p>
        <a href="#/">Back to home</a>
      </div>
    );
  }

  return (
    <div>
      <p>
        <a href={`#/plugin/${entry.plugin}`}>← {entry.plugin}</a>
      </p>
      <h1>
        {entry.name} <span className="kind-tag">({entry.kind})</span>
      </h1>
      <p>{entry.description}</p>

      {entry.kind === 'agent' && (
        <ul className="meta-list">
          {entry.model && <li>Model: {entry.model}</li>}
          {entry.tools && <li>Tools: {entry.tools}</li>}
          {entry.skills && entry.skills.length > 0 && (
            <li>
              Preloaded skills:{' '}
              {entry.skills.map((s, i) => (
                <span key={s}>
                  {i > 0 && ', '}
                  <a href={`#/artifact/${s.includes(':') ? s : `${entry.plugin}:skill:${s}`}`}>
                    {s}
                  </a>
                </span>
              ))}
            </li>
          )}
        </ul>
      )}

      <SafeMarkdown markdown={body} />
    </div>
  );
}
