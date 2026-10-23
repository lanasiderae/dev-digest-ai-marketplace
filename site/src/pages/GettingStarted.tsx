export function GettingStarted() {
  return (
    <div>
      <h1>Getting started</h1>
      <ol>
        <li>Clone or copy this marketplace repository locally.</li>
        <li>
          Add it as a marketplace:
          <pre>
            <code>claude plugin marketplace add /path/to/dev-digest-ai-marketplace</code>
          </pre>
        </li>
        <li>
          Install a plugin:
          <pre>
            <code>/plugin install sdd-engineering@dev-digest-ai-marketplace</code>
          </pre>
          (installing <code>sdd-engineering</code> auto-installs its three declared
          dependencies.)
        </li>
        <li>
          See <a href="#/">the plugin list</a> or <a href="#/search">search</a> for individual
          skills/agents.
        </li>
      </ol>
      <p>
        For contribution guidelines and validation commands, see this repository's{' '}
        <code>CONTRIBUTING.md</code>.
      </p>
    </div>
  );
}
