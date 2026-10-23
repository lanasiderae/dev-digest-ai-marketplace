import { useState } from 'react';

export function InstallCommand({
  pluginName,
  command,
}: {
  pluginName?: string;
  command?: string;
}) {
  const cmd = command ?? `/plugin install ${pluginName}@dev-digest-ai-marketplace`;
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(cmd);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API can be unavailable (permissions, insecure context) —
      // fail silently, the command is still shown as selectable text.
    }
  };

  return (
    <div className="install-command">
      <code>{cmd}</code>
      <button type="button" onClick={onCopy}>
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
}
