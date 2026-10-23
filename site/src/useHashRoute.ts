import { useEffect, useState } from 'react';

function currentHash(): string {
  const h = window.location.hash.replace(/^#/, '');
  return h || '/';
}

export function useHashRoute(): [string, (next: string) => void] {
  const [hash, setHash] = useState<string>(currentHash());

  useEffect(() => {
    const onHashChange = () => setHash(currentHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = (next: string) => {
    window.location.hash = next;
  };

  return [hash, navigate];
}
