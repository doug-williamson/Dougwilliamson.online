/**
 * FolioKit npm packages ship `module`/`typings` pointing at built ESM under `esm2022/`
 * while `exports.default` may still reference removed `./src/index.ts`.
 * Rewrites `exports`, `main`, and `types` to the built entry so the app resolves correctly.
 */
const fs = require('fs');
const path = require('path');

const pkgs = ['@foliokit/cms-core', '@foliokit/cms-ui', '@foliokit/cms-markdown', '@foliokit/cms-admin-ui'];
const root = path.join(__dirname, '..');

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

/**
 * AdminLoginComponent calls `router.navigate([this.redirectTo()])`. When
 * `withComponentInputBinding()` maps an empty/missing `redirectTo` query param
 * onto the input, `redirectTo()` is undefined → NG04008. Use navigateByUrl with
 * a fallback instead.
 */
function patchAdminLoginPostRedirect() {
  const loginJs = path.join(
    root,
    'node_modules',
    '@foliokit',
    'cms-admin-ui',
    'esm2022',
    'lib',
    'login',
    'admin-login.component.js',
  );
  if (!fs.existsSync(loginJs)) {
    return false;
  }
  let src = fs.readFileSync(loginJs, 'utf8');
  const next = src.replace(
    /this\.router\.navigate\(\[this\.redirectTo\(\)\]\)/g,
    "this.router.navigateByUrl(this.redirectTo() || '/posts')",
  );
  if (next !== src) {
    fs.writeFileSync(loginJs, next);
    return true;
  }
  return false;
}

for (const pkg of pkgs) {
  const pkgPath = path.join(root, 'node_modules', pkg, 'package.json');
  if (fs.existsSync(pkgPath)) {
    patchPackageJson(pkgPath);
  }
}
patchAdminLoginPostRedirect();
