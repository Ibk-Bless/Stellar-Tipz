type FlagValue = boolean | number | string;

interface FlagDefinition {
  defaultValue: FlagValue;
  description?: string;
}

type FlagDefinitions = Record<string, FlagDefinition>;

type Flags = Record<string, FlagValue>;

const FLAG_PREFIX = 'VITE_FLAG_';

const defaultFlags: FlagDefinitions = {};

const viteEnv = (import.meta as { env?: Record<string, string | undefined> }).env ?? {};

function loadFlagsFromEnv(): Flags {
  const flags: Flags = {};
  for (const [key, value] of Object.entries(viteEnv)) {
    if (key.startsWith(FLAG_PREFIX) && value !== undefined) {
      const flagName = key.slice(FLAG_PREFIX.length).replace(/_/g, '.').toLowerCase();
      flags[flagName] = parseFlagValue(value);
    }
  }
  return flags;
}

function parseFlagValue(value: string): FlagValue {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (/^\d+$/.test(value)) return parseInt(value, 10);
  if (/^\d+\.\d+$/.test(value)) return parseFloat(value);
  return value;
}

const envFlags = loadFlagsFromEnv();

let remoteFlags: Flags = {};

export function setRemoteFlags(flags: Flags): void {
  remoteFlags = { ...flags };
}

export function getFlag(name: string): FlagValue | undefined {
  if (name in envFlags) return envFlags[name];
  if (name in remoteFlags) return remoteFlags[name];
  return undefined;
}

export function isFeatureEnabled(name: string, defaultValue: boolean = false): boolean {
  const value = getFlag(name);
  if (value === undefined) return defaultValue;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value === 'true' || value === '1';
  if (typeof value === 'number') return value !== 0;
  return Boolean(value);
}

export function getFeatureValue(name: string, defaultValue?: FlagValue): FlagValue | undefined {
  return getFlag(name) ?? defaultValue;
}

export function registerFlags(definitions: FlagDefinitions): void {
  Object.assign(defaultFlags, definitions);
}
