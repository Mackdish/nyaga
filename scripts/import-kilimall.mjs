#!/usr/bin/env node
/**
 * One-command Kilimall import.
 *
 * Usage:
 *   node scripts/import-kilimall.mjs <startPage> [endPage] [query]
 *
 * Examples:
 *   node scripts/import-kilimall.mjs 3
 *   node scripts/import-kilimall.mjs 3 5
 *   node scripts/import-kilimall.mjs 1 2 "laptops and computers"
 *
 * It will:
 *   - fetch each Kilimall search page
 *   - parse products (name, price, image)
 *   - sanitize/normalize text (no smart quotes, no stray escapes, ASCII-safe)
 *   - classify into existing subcategories
 *   - append entries to src/lib/catalog.ts
 *   - INSERT rows into the products table via psql (if PGHOST is set)
 */

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const [, , startArg, endArg, ...qArgs] = process.argv;
if (!startArg) {
  console.error("Usage: node scripts/import-kilimall.mjs <startPage> [endPage] [query]");
  process.exit(1);
}
const startPage = parseInt(startArg, 10);
const endPage = endArg ? parseInt(endArg, 10) : startPage;
const query = (qArgs.join(" ") || "laptops and computers").trim();

const CATALOG_PATH = "src/lib/catalog.ts";

// ---------- text sanitization ----------
function sanitize(s) {
  if (!s) return "";
  return s
    .normalize("NFKC")
    // strip control chars
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    // smart quotes / primes -> straight or word
    .replace(/[\u2018\u2019\u201A\u201B\u2032]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036\u3003]/g, '"')
    .replace(/[\u2013\u2014\u2212]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/\u00A0/g, " ")
    // remove emojis & non-ASCII pictographs
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
    // replace inch quote chars near digits with " inch"
    .replace(/(\d+(?:\.\d+)?)\s*["”″'’′]/g, "$1 inch")
    // collapse whitespace
    .replace(/\s+/g, " ")
    .trim();
}

function tsString(s) {
  // safe for double-quoted TS string literal
  return '"' + s.replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';
}
function sqlString(s) {
  return "'" + s.replace(/'/g, "''") + "'";
}

// ---------- brand / subcategory classification ----------
function classify(name) {
  const n = name.toLowerCase();
  if (/\bhp\b|elitebook|probook|pavilion|envy/.test(n)) return { brand: "HP", sub: "hp-laptops" };
  if (/\bdell\b|latitude|inspiron|xps|vostro/.test(n)) return { brand: "Dell", sub: "dell-laptops" };
  if (/lenovo|thinkpad|ideapad|yoga|legion/.test(n)) return { brand: "Lenovo", sub: "lenovo-laptops" };
  if (/macbook|apple/.test(n)) return { brand: "Apple", sub: "refurbished-laptops" };
  if (/refurb|fujitsu|chuwi|acer|asus|toshiba/.test(n)) return { brand: "Refurbished", sub: "refurbished-laptops" };
  if (/all[- ]?in[- ]?one|aio/.test(n)) return { brand: "Generic", sub: "all-in-one-desktops" };
  if (/server|xeon|poweredge|proliant/.test(n)) return { brand: "Generic", sub: "servers" };
  return { brand: "Generic", sub: "refurbished-laptops" };
}

// ---------- parsing ----------
function parsePage(html) {
  const items = [];
  // Each card has a product-title, KSh price, and data-src image
  const cardRe = /<div[^>]*class="[^"]*product-item[^"]*"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g;
  const titleRe = /class="[^"]*product-title[^"]*"[^>]*>([\s\S]*?)</;
  const priceRe = /KSh[\s,]*([\d,]+)/;
  const imgRe = /data-src="([^"]+)"|<img[^>]+src="([^"]+)"/;

  let m;
  while ((m = cardRe.exec(html))) {
    const card = m[0];
    const t = titleRe.exec(card);
    const pr = priceRe.exec(card);
    const im = imgRe.exec(card);
    if (!t || !pr) continue;
    const name = sanitize(t[1].replace(/<[^>]+>/g, ""));
    const price = parseInt(pr[1].replace(/,/g, ""), 10);
    const image = im ? (im[1] || im[2]) : "";
    if (name && price && image) items.push({ name, price, image });
  }
  return items;
}

// ---------- main ----------
async function fetchPage(page) {
  const url = `https://www.kilimall.co.ke/search?q=${encodeURIComponent(query)}&page=${page}&source=search|enterSearch|${encodeURIComponent(query)}`;
  console.log("Fetching", url);
  const res = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} on page ${page}`);
  return await res.text();
}

function nextIdPrefix() {
  const src = readFileSync(CATALOG_PATH, "utf8");
  const re = /"kli(\d*)-/g;
  let max = 1;
  let m;
  while ((m = re.exec(src))) {
    const n = m[1] === "" ? 1 : parseInt(m[1], 10);
    if (n > max) max = n;
  }
  return `kli${max + 1}`;
}

function appendToCatalog(prefix, items) {
  const src = readFileSync(CATALOG_PATH, "utf8");
  const closeIdx = src.lastIndexOf("];");
  if (closeIdx < 0) throw new Error("Could not find PRODUCTS array end");
  const lines = items
    .map((it, i) => {
      const id = `${prefix}-${String(i + 1).padStart(2, "0")}`;
      const { brand, sub } = classify(it.name);
      const trimmed = it.name.length > 100 ? it.name.slice(0, 97) + "..." : it.name;
      return `  withImage(p(${tsString(id)}, ${tsString(trimmed)}, ${tsString(brand)}, "laptops-desktops", ${tsString(sub)}, ${it.price}, undefined, "PC", "bg-orange-50", 4.5, 50, 10), ${tsString(it.image)}),`;
    })
    .join("\n");
  const next = src.slice(0, closeIdx) + lines + "\n" + src.slice(closeIdx);
  writeFileSync(CATALOG_PATH, next);
}

function insertIntoDb(items) {
  if (!process.env.PGHOST) {
    console.log("PGHOST not set — skipping DB insert.");
    return;
  }
  const values = items
    .map(
      (it) =>
        `(${sqlString(it.name)}, 'laptops-desktops', ${it.price}, ${sqlString(it.image)}, 25, true)`,
    )
    .join(",\n");
  const sql = `INSERT INTO products (name, category, price, image_url, stock, active) VALUES\n${values};`;
  const dir = mkdtempSync(join(tmpdir(), "kli-"));
  const file = join(dir, "insert.sql");
  writeFileSync(file, sql);
  try {
    execSync(`psql -f ${file}`, { stdio: "inherit" });
  } catch (e) {
    console.error("DB insert failed:", e.message);
  }
}

(async () => {
  const all = [];
  for (let p = startPage; p <= endPage; p++) {
    try {
      const html = await fetchPage(p);
      const items = parsePage(html);
      console.log(`Page ${p}: ${items.length} products`);
      all.push(...items);
    } catch (e) {
      console.error(`Page ${p} failed:`, e.message);
    }
  }
  if (!all.length) {
    console.log("Nothing imported.");
    return;
  }
  const prefix = nextIdPrefix();
  appendToCatalog(prefix, all);
  console.log(`Appended ${all.length} entries to ${CATALOG_PATH} with prefix ${prefix}-`);
  insertIntoDb(all);
  console.log("Done.");
})();
