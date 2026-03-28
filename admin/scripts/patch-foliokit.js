/**
 * Patches @foliokit package.json files to add proper exports.
 * The 1.0.1 packages ship TypeScript source without module/exports fields.
 * Run via: npm run postinstall
 */
const fs = require('fs');
const path = require('path');

const pkgs = ['@foliokit/cms-core', '@foliokit/cms-ui', '@foliokit/cms-markdown', '@foliokit/cms-admin-ui'];

for (const pkg of pkgs) {
  const pkgPath = path.join(__dirname, '..', 'node_modules', pkg, 'package.json');
  if (!fs.existsSync(pkgPath)) continue;
  const json = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  json.exports = { '.': { default: './src/index.ts' }, './package.json': { default: './package.json' } };
  json.main = './src/index.ts';
  json.types = './src/index.ts';
  fs.writeFileSync(pkgPath, JSON.stringify(json, null, 2));
}
