import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import {
  defaultMapping,
  resolveMappedColumns,
  type PodcastMappingConfig,
} from "./mapping";
import { fetchPodcastsFromMysql } from "./mysql";
import {
  extractInsertRows,
  extractTablesFromDump,
  readSqlDump,
} from "./parse-sql-dump";
import { createMigrationClient, importPodcastDraft } from "./sanity-import";
import { isPublishedRow, mysqlRowToSanityPodcast } from "./transform";

loadEnv({ path: resolve(process.cwd(), ".env.migration") });
loadEnv({ path: resolve(process.cwd(), "back/.env.local") });
loadEnv({ path: resolve(process.cwd(), "front/.env.local") });

const DUMP_PATH = resolve(
  process.cwd(),
  process.env.MYSQL_DUMP_PATH ?? "scripts/migrate-podcasts/data/dump.sql",
);

function getMappingConfig(): PodcastMappingConfig {
  return {
    ...defaultMapping,
    table: process.env.MYSQL_TABLE ?? defaultMapping.table,
  };
}

async function loadRowsFromDump(table: string) {
  const sql = await readSqlDump(DUMP_PATH);
  return extractInsertRows(sql, table);
}

async function loadRows(source: "dump" | "mysql", table: string) {
  if (source === "mysql") {
    return fetchPodcastsFromMysql(table);
  }
  return loadRowsFromDump(table);
}

async function inspect() {
  const mapping = getMappingConfig();
  const sql = await readSqlDump(DUMP_PATH);
  const tables = extractTablesFromDump(sql);

  console.log(`\nFichier analysé : ${DUMP_PATH}\n`);

  if (tables.length === 0) {
    console.log("Aucune table CREATE TABLE trouvée dans le dump.");
    return;
  }

  console.log("Tables détectées :\n");
  for (const table of tables) {
    const isTarget = table.name === mapping.table;
    console.log(`${isTarget ? "→" : " "} ${table.name}`);
    for (const column of table.columns) {
      console.log(`    - ${column.name} (${column.type})`);
    }
    console.log("");
  }

  const target = tables.find((table) => table.name === mapping.table);
  if (!target) {
    console.log(
      `Table cible "${mapping.table}" introuvable. Définis MYSQL_TABLE dans .env.migration`,
    );
    return;
  }

  const resolved = resolveMappedColumns(
    target.columns.map((column) => column.name),
    mapping,
  );

  console.log("Mappage proposé MySQL → Sanity podcast :\n");
  for (const [sanityField, mysqlColumn] of Object.entries(resolved)) {
    console.log(
      `  ${sanityField.padEnd(14)} ← ${mysqlColumn ?? "(aucune colonne détectée)"}`,
    );
  }

  const allRows = extractInsertRows(sql, mapping.table);
  const sampleRows = allRows.slice(0, 1);
  console.log(`\n${allRows.length} ligne(s) parsée(s) depuis INSERT.`);

  if (sampleRows.length > 0) {
    const preview = mysqlRowToSanityPodcast(sampleRows[0], mapping);
    console.log("\nExemple transformé :\n");
    console.log(JSON.stringify(preview, null, 2));
  }
}

async function migrate(dryRun: boolean) {
  const mapping = getMappingConfig();
  const source = (process.env.MIGRATION_SOURCE ?? "dump") as "dump" | "mysql";
  const rows = (await loadRows(source, mapping.table)).filter(isPublishedRow);

  console.log(`\n${rows.length} ligne(s) lues depuis ${source} (table ${mapping.table}).`);

  const drafts = rows
    .map((row) => mysqlRowToSanityPodcast(row, mapping))
    .filter((draft): draft is NonNullable<typeof draft> => draft !== null);

  const skipped = rows.length - drafts.length;
  if (skipped > 0) {
    console.log(`${skipped} ligne(s) ignorée(s) (titre ou date manquants).`);
  }

  if (drafts.length === 0) {
    console.log("Rien à importer.");
    return;
  }

  const outputDir = resolve(process.cwd(), "scripts/migrate-podcasts/data");
  await mkdir(outputDir, { recursive: true });
  await writeFile(
    resolve(outputDir, "podcasts-preview.json"),
    JSON.stringify(drafts, null, 2),
    "utf8",
  );
  console.log(`Prévisualisation écrite : scripts/migrate-podcasts/data/podcasts-preview.json`);

  if (dryRun) {
    console.log("\nMode dry-run : aucun document créé dans Sanity.");
    return;
  }

  const client = createMigrationClient();
  const context = {
    client,
    assetsBaseUrl: process.env.MYSQL_ASSETS_BASE_URL,
  };

  let imported = 0;
  for (const draft of drafts) {
    await importPodcastDraft(context, draft);
    imported += 1;
    console.log(`✓ ${imported}/${drafts.length} — ${draft.title}`);
  }

  console.log(`\nImport terminé : ${imported} podcast(s) dans Sanity.`);
}

async function main() {
  const command = process.argv[2] ?? "inspect";

  try {
    if (command === "inspect") {
      await inspect();
      return;
    }

    if (command === "dry-run") {
      await migrate(true);
      return;
    }

    if (command === "import") {
      await migrate(false);
      return;
    }

    console.log("Usage:");
    console.log("  npm run migrate:podcasts:inspect");
    console.log("  npm run migrate:podcasts:dry-run");
    console.log("  npm run migrate:podcasts:import");
  } catch (error) {
    console.error(`\nErreur : ${(error as Error).message}`);
    process.exitCode = 1;
  }
}

void main();
