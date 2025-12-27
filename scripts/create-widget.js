#!/usr/bin/env node
/*
 * create-widget.js
 *
 * Usage:
 *   node create-widget.js pv-chat
 *   node create-widget.js pv-chat-widget
 *
 * What it generates:
 *   packages/widgets/<widget-name>/
 *     package.json
 *     README.md
 *     src/
 *       index.js
 *       <PascalName>.jsx
 *       styles.css
 *       adapters/
 *         exampleAdapter.js
 */

const fs = require("fs");
const path = require("path");

function toKebab(input) {
  return String(input)
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[_\s]+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

function toPascal(input) {
  const parts = toKebab(input).split("-").filter(Boolean);
  return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join("");
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeFileSafe(filePath, content) {
  if (fs.existsSync(filePath)) {
    throw new Error(`File already exists: ${filePath}`);
  }
  fs.writeFileSync(filePath, content, "utf8");
}

function main() {
  const rawName = process.argv[2];
  if (!rawName) {
    console.error("\nUsage: node create-widget.js <widget-name>\n");
    console.error("Example: node create-widget.js pv-chat\n");
    process.exit(1);
  }

  const widgetName = toKebab(rawName);
  const pascalName = toPascal(widgetName);
  const packageName = `@repo/widget-${widgetName}`;

  const repoRoot = process.cwd();
  const widgetsRoot = path.join(repoRoot, "packages", "widgets");
  const widgetRoot = path.join(widgetsRoot, widgetName);
  const srcRoot = path.join(widgetRoot, "src");
  const adaptersRoot = path.join(srcRoot, "adapters");

  // Create directories
  ensureDir(adaptersRoot);

  // package.json
  const pkgJson = {
    name: packageName,
    version: "0.1.0",
    private: true,
    main: "src/index.js",
  };

  writeFileSafe(
    path.join(widgetRoot, "package.json"),
    JSON.stringify(pkgJson, null, 2) + "\n"
  );

  // README.md
  const readme = `# ${widgetName}

A reusable **widget** (UI + style + limited business semantics) intended for financial products.

## Responsibility
- Encapsulate a small, embeddable business scenario
- Expose a single React component API
- Accept environment differences via an adapter (API/auth/tracking)

## Public API

\`\`\`jsx
import ${pascalName} from "${packageName}";
import { createExampleAdapter } from "${packageName}/src/adapters/exampleAdapter";

const adapter = createExampleAdapter();

<${pascalName}
  title="${pascalName}"
  adapter={adapter}
  onEvent={(e) => console.log(e)}
/>
\`\`\`

## Notes
- Do NOT put routing, page layout, or product-level state here.
- Prefer "domain" packages for stable business facts/rules.
`;

  writeFileSafe(path.join(widgetRoot, "README.md"), readme);

  // src/index.js (single public entry)
  const indexJs = `import "./styles.css";
import ${pascalName} from "./${pascalName}";

export default ${pascalName};
`;
  writeFileSafe(path.join(srcRoot, "index.js"), indexJs);

  // src/<PascalName>.jsx (empty UI + adapter pattern)
  const componentJsx = `import React from "react";

/**
 * ${pascalName}
 *
 * A widget should be an embeddable black box:
 * - Export a single component
 * - Keep internal structure private
 * - Accept runtime/environment differences via adapter
 */

export default function ${pascalName}({
  title = "${pascalName}",
  adapter,
  onEvent,
}) {
  const [status, setStatus] = React.useState("ready");

  React.useEffect(() => {
    let cancelled = false;

    async function boot() {
      if (!adapter || typeof adapter.bootstrap !== "function") return;
      setStatus("booting...");
      try {
        const info = await adapter.bootstrap();
        if (!cancelled) {
          setStatus(info?.status || "ready");
          onEvent?.({ type: "BOOTSTRAP_OK", payload: info });
        }
      } catch (err) {
        if (!cancelled) {
          setStatus("error");
          onEvent?.({ type: "BOOTSTRAP_ERROR", payload: String(err) });
        }
      }
    }

    boot();
    return () => {
      cancelled = true;
    };
  }, [adapter, onEvent]);

  return (
    <section className="widget">
      <header className="widget__header">
        <h4 className="widget__title">{title}</h4>
        <span className="widget__status">{status}</span>
      </header>

      <div className="widget__body">
        {/* TODO: implement your scenario UI here */}
        <p className="widget__hint">This is a generated widget skeleton.</p>
        <button
          className="widget__button"
          type="button"
          onClick={() => onEvent?.({ type: "CLICK", payload: { widget: "${widgetName}" } })}
        >
          Emit event
        </button>
      </div>
    </section>
  );
}
`;

  writeFileSafe(path.join(srcRoot, `${pascalName}.jsx`), componentJsx);

  // src/styles.css
  const stylesCss = `/* Generated widget styles (keep it local and minimal) */

.widget {
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
}

.widget__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}

.widget__title {
  margin: 0;
  font-size: 16px;
}

.widget__status {
  font-size: 12px;
  opacity: 0.7;
}

.widget__hint {
  margin: 0 0 10px;
  opacity: 0.8;
}

.widget__button {
  padding: 8px 12px;
  cursor: pointer;
}
`;
  writeFileSafe(path.join(srcRoot, "styles.css"), stylesCss);

  // src/adapters/exampleAdapter.js
  const adapterJs = `/**
 * Adapter example
 *
 * Widgets must not assume runtime environment (auth/API/tracking).
 * Inject differences through an adapter.
 */

export function createExampleAdapter({
  status = "ready",
  delay = 150,
} = {}) {
  return {
    async bootstrap() {
      await new Promise((r) => setTimeout(r, delay));
      return { status, ts: Date.now() };
    },

    // Example placeholders (implement per product):
    // async fetchData() {},
    // async sendAction(payload) {},
    // track(eventName, payload) {},
  };
}
`;

  writeFileSafe(path.join(adaptersRoot, "exampleAdapter.js"), adapterJs);

  console.log("\n✅ Widget created:");
  console.log(`   ${path.relative(repoRoot, widgetRoot)}`);
  console.log("\nNext:");
  console.log(`   yarn install`);
  console.log(`   import ${pascalName} from "${packageName}" in an app and render it.`);
  console.log("\n");
}

try {
  main();
} catch (err) {
  console.error(`\n❌ ${err.message}\n`);
  process.exit(1);
}
