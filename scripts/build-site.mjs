// Builds the GitHub Pages site:
//   site/              landing page (site-src/index.html)
//   site/customer/     customer app (Vite build, hash routing, relative base)
//   site/gm-console/   GM console (static files, copied as-is)
import { execSync } from 'node:child_process';
import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';

const out = 'site';
rmSync(out, { recursive: true, force: true });
mkdirSync(out);

execSync('npx tsc --noEmit -p apps/customer && npx vite build apps/customer --base ./ --outDir ../../site/customer --emptyOutDir', {
  stdio: 'inherit',
  env: { ...process.env, VITE_ROUTER: 'hash' },
});

cpSync('apps/gm-console', `${out}/gm-console`, {
  recursive: true,
  filter: (src) => !/(^|\/)(README\.md|figma)$/.test(src),
});

cpSync('site-src', out, { recursive: true });
writeFileSync(`${out}/.nojekyll`, '');
console.log('Site ready in ./site');
