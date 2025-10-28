import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const SRC = path.resolve('src');

const PROJECT = ts.readConfigFile('tsconfig.json', ts.sys.readFile).config;
const PARSED = ts.parseJsonConfigFileContent(PROJECT, ts.sys, process.cwd());
const PROGRAM = ts.createProgram(PARSED.fileNames, PARSED.options);
const CHECKER = PROGRAM.getTypeChecker();

type ImportUse = { file: string; from: string; names: string[] };

const byModule = new Map<string, Set<string>>(); // module -> set of imported names
const exported = new Map<string, Set<string>>(); // module -> set of exported names

function isLibModule(spec: string) {
  return spec.startsWith('@/lib/');
}

function add(map: Map<string, Set<string>>, key: string, val: string) {
  if (!map.has(key)) map.set(key, new Set());
  map.get(key)!.add(val);
}

for (const sf of PROGRAM.getSourceFiles()) {
  if (!sf.fileName.startsWith(SRC)) continue;

  sf.forEachChild((node) => {
    if (
      ts.isImportDeclaration(node) &&
      node.importClause &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      const spec = node.moduleSpecifier.text;
      if (!isLibModule(spec)) return;

      if (node.importClause.namedBindings && ts.isNamedImports(node.importClause.namedBindings)) {
        const names = node.importClause.namedBindings.elements.map((el) => el.name.text);
        names.forEach((n) => add(byModule, spec, n));
      }
    }

    if (ts.isExportDeclaration(node) && node.exportClause && ts.isNamedExports(node.exportClause)) {
      // re-exports like: export { x, y } from './foo'
      const spec =
        node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)
          ? node.moduleSpecifier.text
          : null;
      const names = node.exportClause.elements.map((el) => el.name.text);
      const key = spec
        ? spec
        : sf.fileName
            .replace(process.cwd() + path.sep, '')
            .replace(/\\/g, '/')
            .replace(/^src\//, '')
            .replace(/\.tsx?$/, '');
      names.forEach((n) => add(exported, key, n));
    }

    if (ts.isSourceFile(node)) {
      // gather direct exports: export function foo() {}, export const bar = ...
      node.statements.forEach((st) => {
        if (
          ts.canHaveModifiers(st) &&
          st.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
        ) {
          if (ts.isFunctionDeclaration(st) && st.name)
            add(exported, moduleKey(sf.fileName), st.name.text);
          if (ts.isVariableStatement(st)) {
            st.declarationList.declarations.forEach((d) => {
              if (ts.isIdentifier(d.name)) add(exported, moduleKey(sf.fileName), d.name.text);
            });
          }
          if (ts.isClassDeclaration(st) && st.name)
            add(exported, moduleKey(sf.fileName), st.name.text);
          if (ts.isTypeAliasDeclaration(st)) add(exported, moduleKey(sf.fileName), st.name.text);
          if (ts.isInterfaceDeclaration(st)) add(exported, moduleKey(sf.fileName), st.name.text);
        }
      });
    }
  });
}

function moduleKey(fileName: string) {
  const rel = fileName.replace(process.cwd() + path.sep, '').replace(/\\/g, '/');
  const withoutSrc = rel.startsWith('src/') ? rel.slice(4) : rel;
  return withoutSrc.replace(/\.d\.ts$|\.tsx?$|\/index\.ts$/g, '');
}

// Normalize keys so "@/lib/tools" maps to "lib/tools"
function normalizeImportKey(spec: string) {
  return spec.replace(/^@\/(.*)$/, '$1');
}

// Build a flattened export map allowing index files
const flattened = new Map<string, Set<string>>();
for (const [key, names] of exported) {
  const k = key.replace(/^src\//, '').replace(/\.tsx?$/, '');
  if (!flattened.has(k)) flattened.set(k, new Set());
  names.forEach((n) => flattened.get(k)!.add(n));
}

const missing: Array<{ from: string; name: string }> = [];

for (const [mod, names] of byModule) {
  const key = normalizeImportKey(mod);
  const expNames = flattened.get(key) || flattened.get(`${key}/index`) || new Set<string>();

  names.forEach((n) => {
    if (!expNames.has(n)) missing.push({ from: mod, name: n });
  });
}

if (!fs.existsSync('.triage')) fs.mkdirSync('.triage');
fs.writeFileSync('.triage/missing-lib-exports.json', JSON.stringify(missing, null, 2));

console.log(`Missing exports: ${missing.length}`);
if (missing.length) {
  const by = missing.reduce(
    (m, cur) => {
      if (!m[cur.from]) m[cur.from] = [];
      m[cur.from]!.push(cur.name);
      return m;
    },
    {} as Record<string, string[]>,
  );

  console.log(JSON.stringify(by, null, 2));
}
