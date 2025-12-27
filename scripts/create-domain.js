#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const domainName = process.argv[2];

if (!domainName) {
    console.error("❌ Please provide a domain name, e.g:");
    console.error("   node scripts/create-domain.js user");
    process.exit(1);
}

const pkgName = `domain-${domainName}`;
const packageDir = path.resolve(__dirname, "../packages", pkgName);

if (fs.existsSync(packageDir)) {
    console.error(`❌ Package ${pkgName} already exists.`);
    process.exit(1);
}

function mkdir(p) {
    fs.mkdirSync(p, { recursive: true });
}

function write(file, content) {
    fs.writeFileSync(file, content.trimStart(), "utf8");
}

mkdir(packageDir);
mkdir(path.join(packageDir, "src"));

/* package.json */
write(
    path.join(packageDir, "package.json"),
    `
{
  "name": "@repo/${pkgName}",
  "version": "0.1.0",
  "private": true,
  "main": "src/index.js"
}
`
);

/* model.js */
write(
    path.join(packageDir, "src/model.js"),
    `
export function canAccess${capitalize(domainName)}Dashboard(${domainName}) {
  return ${domainName}.role === "admin";
}
`
);

/* service.js */
write(
    path.join(packageDir, "src/service.js"),
    `
export async function fetch${capitalize(domainName)}() {
  await new Promise((r) => setTimeout(r, 150));

  return {
    id: "${domainName}_001",
    name: "${capitalize(domainName)} demo",
    role: "admin"
  };
}
`
);

/* index.js */
write(
    path.join(packageDir, "src/index.js"),
    `
export * from "./model";
export * from "./service";
`
);

console.log(`✅ Domain package created: packages/${pkgName}`);

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
