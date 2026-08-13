import { execFileSync } from 'child_process';

const ignoredAdvisories = new Set([
  // FinWise is a Vite client-side SPA and does not enable React Router RSC mode.
  'https://github.com/advisories/GHSA-qwww-vcr4-c8h2',
]);

let audit;
try {
  execFileSync('npm', ['audit', '--prefix', 'frontend', '--json', '--audit-level=moderate'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  console.log('frontend audit ok');
  process.exit(0);
} catch (error) {
  audit = JSON.parse(error.stdout || '{}');
}

const vulnerabilities = audit.vulnerabilities || {};
const isIgnored = (name, seen = new Set()) => {
  if (seen.has(name)) return true;
  seen.add(name);

  const entry = vulnerabilities[name];
  if (!entry) return false;

  return entry.via.every((via) => {
    if (typeof via === 'string') return isIgnored(via, seen);
    return ignoredAdvisories.has(via.url);
  });
};

const actionable = Object.keys(vulnerabilities).filter((name) => !isIgnored(name));

if (actionable.length > 0) {
  console.error(`frontend audit failed: ${actionable.join(', ')}`);
  process.exit(1);
}

console.warn('frontend audit passed with documented non-applicable advisory ignored: React Router RSC mode');
