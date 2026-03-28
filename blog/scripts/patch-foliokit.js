/**
 * FolioKit npm packages ship `module`/`typings` pointing at built ESM under `esm2022/`
 * while `exports.default` may still reference removed `./src/index.ts`.
 * Rewrites `exports`, `main`, and `types` to the built entry so the app resolves correctly.
 */
const fs = require('fs');
const path = require('path');

const pkgs = ['@foliokit/cms-core', '@foliokit/cms-ui', '@foliokit/cms-markdown'];

function patchPackageJson(pkgPath) {
  const raw = fs.readFileSync(pkgPath, 'utf8');
  const json = JSON.parse(raw);
  const moduleEntry = json.module;
  if (!moduleEntry || String(moduleEntry).includes('src/')) {
    return false;
  }
  const entryRel = moduleEntry.startsWith('./') ? moduleEntry : `./${moduleEntry}`;
  const typesFile = json.typings || json.types;
  const typesRel =
    typesFile && !String(typesFile).includes('src/')
      ? typesFile.startsWith('./')
        ? typesFile
        : `./${typesFile}`
      : undefined;

  const current = json.exports?.['.']?.default;
  if (current === entryRel) {
    return false;
  }

  json.exports = {
    '.': {
      ...(typesRel ? { types: typesRel } : {}),
      default: entryRel,
    },
    './package.json': { default: './package.json' },
  };
  json.main = entryRel;
  if (typesRel) {
    json.types = typesRel;
  }
  fs.writeFileSync(pkgPath, JSON.stringify(json, null, 2));
  return true;
}

const root = path.join(__dirname, '..');
for (const pkg of pkgs) {
  const pkgPath = path.join(root, 'node_modules', pkg, 'package.json');
  if (fs.existsSync(pkgPath)) {
    patchPackageJson(pkgPath);
  }
}
