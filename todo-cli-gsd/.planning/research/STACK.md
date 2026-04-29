# Technology Stack

**Project:** todo-cli-gsd (TypeScript CLI Todo App)
**Researched:** 2026-04-29
**Confidence:** HIGH — verified against commander.js Context7 docs, tsx Context7 docs, TypeScript official docs, live npm registry

---

## Recommended Stack

### Core Runtime & Language

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Node.js | 22 LTS (min 20.6+) | Runtime | LTS release; v20.6+ required for `--import` flag used by tsx in dev; v25 available but 22 is the stable LTS target for production tools |
| TypeScript | 6.x (6.0.3 current) | Language | Strict typing catches bugs at author time; v6 is current stable on npm as of research date |
| `@types/node` | 25.x (25.6.0 current) | Node type definitions | Provides typed fs, path, process APIs — required for tsc to understand Node built-ins |

### The One External Dependency

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `commander` | 14.x (14.0.3 current) | CLI argument parsing | The project constraint. Eliminates manual `process.argv` slice-and-parse; handles help text, version, subcommands, and argument validation out of the box. Well-maintained (tj/commander.js), ships its own TypeScript types since v8. |

### Dev-Only Tooling

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `tsx` | 4.x (4.21.0 current) | Run `.ts` files directly during development | tsx is the 2025 successor to ts-node. It is faster (uses esbuild under the hood), requires zero config, and works with `node --import tsx` (Node 20.6+). ts-node (10.9.2) is still functional but slower and needs more tsconfig ceremony. `tsx watch` gives file-watch mode for free. |

---

## tsconfig.json — Recommended Settings

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "rootDir": "src",
    "outDir": "dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": false,
    "sourceMap": false
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**Rationale for each setting:**

- **`target: "ES2022"`** — Node 22 supports ES2022 fully (async/await, class fields, top-level await). No need to down-compile. Keeps output readable.
- **`module: "NodeNext"` / `moduleResolution: "NodeNext"`** — This is the only correct pairing for Node.js projects per TypeScript docs. It correctly models how Node resolves both CJS and ESM. Using `CommonJS` here would work but hides real-world module resolution bugs. Using `esnext` is wrong for Node.
- **`rootDir: "src"` / `outDir: "dist"`** — Clean separation: source TypeScript in `src/`, compiled JavaScript output in `dist/`. This is the universal convention.
- **`strict: true`** — All strict checks enabled. For a reference project intended to be readable and correct, strict mode is non-negotiable. It catches null dereferences, implicit any, uninitialized class properties.
- **`esModuleInterop: true`** — Allows `import fs from 'fs'` instead of `import * as fs from 'fs'`. Standard for Node.js projects. commander ships as CJS and this flag handles interop cleanly.
- **`skipLibCheck: true`** — Skips type-checking `.d.ts` declaration files from node_modules. Prevents spurious errors from third-party types. Universal best practice.
- **`declaration: false`** — This is a CLI tool, not a library. No consumers need `.d.ts` files. Leaving this off reduces build output noise.
- **`sourceMap: false`** — Production CLI. No debugger needs source maps. Keep dist clean.

---

## package.json — Required Fields

```json
{
  "name": "todo-cli",
  "version": "1.0.0",
  "type": "module",
  "bin": {
    "todo": "./dist/index.js"
  },
  "scripts": {
    "dev": "tsx src/index.ts",
    "dev:watch": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "commander": "^14.0.3"
  },
  "devDependencies": {
    "@types/node": "^25.6.0",
    "tsx": "^4.21.0",
    "typescript": "^6.0.3"
  }
}
```

**Field rationale:**

- **`"type": "module"`** — Declares the project as ESM. Combined with `module: NodeNext` in tsconfig, TypeScript emits `.js` files that Node runs as ESM. This is the modern default for new Node projects. If CJS is preferred, omit this field and use `module: CommonJS` in tsconfig instead — but ESM is forward-compatible.
- **`bin.todo`** — Points to the compiled entry point. When the package is installed globally (`npm install -g .`) or via `npx`, this makes the `todo` command available in PATH. The path `./dist/index.js` must match `outDir` + entry file name.
- **`dev` script** — Uses `tsx` to run source TypeScript directly. No build step. Immediate feedback during development.
- **`dev:watch`** — `tsx watch` reruns the file on save. Useful when testing CLI changes rapidly.
- **`build` script** — Runs `tsc` to compile `src/` → `dist/`. This is the production artifact.
- **`typecheck` script** — `tsc --noEmit` validates types without emitting files. Run in CI and before commits.

---

## Entry Point — src/index.ts

The compiled entry must have a shebang for global/npx execution:

```typescript
#!/usr/bin/env node

import { Command } from 'commander';

const program = new Command();

program
  .name('todo')
  .description('Manage todos in a local todos.json file')
  .version('1.0.0');

// subcommands registered here...

program.parse();
```

The `#!/usr/bin/env node` shebang is critical. When Node compiles the file to `dist/index.js`, this shebang is preserved. Without it, running `./dist/index.js` directly or invoking via the `bin` field requires an explicit `node` prefix.

After `tsc`, make the output executable:

```bash
chmod +x dist/index.js
```

Or add it to the `build` script:

```json
"build": "tsc && chmod +x dist/index.js"
```

---

## Dev Workflow vs Production

| Context | Command | What Happens |
|---------|---------|--------------|
| Development, manual test | `npm run dev -- add "Buy milk"` | tsx transpiles src/index.ts in-process, runs immediately, no dist/ needed |
| Development, iterating | `npm run dev:watch` | tsx reruns on file change |
| Type-checking only | `npm run typecheck` | tsc validates types, emits nothing |
| Production build | `npm run build` | tsc compiles src/ → dist/ |
| Run compiled output | `npm run start -- list` | node runs dist/index.js |
| Global install | `npm install -g .` | `todo` command available system-wide via bin field |
| Without install | `npx .` or `node dist/index.js` | Works after build |

**Why tsx over ts-node:** ts-node requires `ts-node/register` hooks and has known issues with ESM projects. tsx uses esbuild for transpilation (not tsc) — much faster startup (~100ms vs ~500ms), zero config needed, works with `--import tsx` in Node 20.6+. For a CLI where startup time is perceptible, this matters.

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Dev runner | `tsx` | `ts-node` | ts-node is slower, requires more tsconfig tuning for ESM, actively superseded by tsx in community practice |
| Module system | ESM (`"type": "module"`) | CommonJS | CommonJS still works but ESM is the Node.js forward direction; new projects should start with ESM unless requiring legacy compatibility |
| TypeScript version | 6.x | 5.x | 6.x is current stable; no breaking changes for this use case; use latest |
| `module` setting | `NodeNext` | `CommonJS` | `CommonJS` hides module resolution issues; `NodeNext` is the TypeScript-recommended setting for Node.js targets |
| Build tool | `tsc` | `esbuild`, `rollup`, `tsup` | Constraint is minimal dependencies. `tsc` is the zero-dependency compiler built into TypeScript itself. For a simple CLI with one file, no bundler is needed. |

---

## Installation

```bash
# Initialize project
npm init -y

# Production dependency
npm install commander

# Dev dependencies
npm install -D typescript tsx @types/node

# Initialize tsconfig
npx tsc --init
# Then replace contents with the tsconfig above

# Create source directory
mkdir src
```

---

## File Structure

```
todo-cli/
├── src/
│   └── index.ts          # Entry point (shebang + commander setup)
├── dist/                 # Compiled output (git-ignored)
├── tsconfig.json
├── package.json
└── todos.json            # Created at runtime, git-ignored
```

---

## Sources

- Commander.js TypeScript integration: https://github.com/tj/commander.js/blob/master/Readme.md (via Context7 /tj/commander.js)
- tsx usage and Node.js integration: https://github.com/privatenumber/tsx/blob/master/docs/getting-started.md (via Context7 /privatenumber/tsx)
- TypeScript module/moduleResolution for Node.js: https://github.com/microsoft/typeScript-website — "Choosing Compiler Options" guide (via Context7 /microsoft/typescript-website)
- TypeScript compiler options reference: https://www.typescriptlang.org/tsconfig
- npm registry versions verified live: commander@14.0.3, typescript@6.0.3, tsx@4.21.0, @types/node@25.6.0
