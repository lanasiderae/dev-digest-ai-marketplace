export type EntryKind = 'plugin' | 'skill' | 'agent';

export interface Compatibility {
  claudeCode: string | null;
  raw: string | null;
}

export interface IndexEntry {
  kind: EntryKind;
  id: string;
  plugin: string;
  name: string;
  description: string;
  version?: string | null;
  keywords: string[];
  dependencies?: string[];
  compatibility?: Compatibility;
  tools?: string | null;
  model?: string | null;
  skills?: string[];
  bodyPath: string | null;
  searchText: string;
}

export interface Index {
  generatedAt: string;
  marketplace: {
    name: string;
    description: string;
    owner: { name: string } | null;
  };
  entries: IndexEntry[];
}

export interface ReleaseEntry {
  plugin: string;
  version: string;
  date: string | null;
  body: string;
}

export interface Releases {
  generatedAt: string;
  releases: ReleaseEntry[];
}

export interface Stats {
  generatedAt: string;
  totalPlugins: number;
  totalSkills: number;
  totalAgents: number;
  totalEvalCases: number;
}
