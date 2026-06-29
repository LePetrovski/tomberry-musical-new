import { readFile } from "node:fs/promises";

export type SqlTableSchema = {
  name: string;
  columns: Array<{ name: string; type: string; nullable: boolean }>;
};

const CREATE_TABLE_START_REGEX = /CREATE\s+TABLE\s+`?(\w+)`?\s*\(/gi;

const COLUMN_LINE_REGEX =
  /^\s*`?(\w+)`?\s+([a-zA-Z]+(?:\([^)]*\))?)/;

export async function readSqlDump(filePath: string): Promise<string> {
  return readFile(filePath, "utf8");
}

function extractBalancedParenthesesBody(sql: string, openParenIndex: number): string {
  let depth = 0;

  for (let index = openParenIndex; index < sql.length; index += 1) {
    const char = sql[index];

    if (char === "(") {
      depth += 1;
      continue;
    }

    if (char === ")") {
      depth -= 1;
      if (depth === 0) {
        return sql.slice(openParenIndex + 1, index);
      }
    }
  }

  throw new Error("CREATE TABLE mal formé : parenthèse fermante introuvable.");
}

function extractUntilStatementEnd(sql: string, start: number): string {
  let inString = false;
  let stringQuote = "";
  let escaping = false;

  for (let index = start; index < sql.length; index += 1) {
    const char = sql[index];

    if (inString) {
      if (escaping) {
        escaping = false;
        continue;
      }
      if (char === "\\") {
        escaping = true;
        continue;
      }
      if (char === stringQuote) {
        inString = false;
        stringQuote = "";
      }
      continue;
    }

    if (char === "'" || char === '"') {
      inString = true;
      stringQuote = char;
      continue;
    }

    if (char === ";") {
      return sql.slice(start, index);
    }
  }

  return sql.slice(start);
}

export function extractTablesFromDump(sql: string): SqlTableSchema[] {
  const tables: SqlTableSchema[] = [];
  const matches = sql.matchAll(CREATE_TABLE_START_REGEX);

  for (const match of matches) {
    const name = match[1];
    const openParenIndex = match.index! + match[0].length - 1;
    const body = extractBalancedParenthesesBody(sql, openParenIndex);
    const columns: SqlTableSchema["columns"] = [];

    for (const rawLine of body.split("\n")) {
      const line = rawLine.trim().replace(/,$/, "");
      if (
        !line ||
        line.startsWith("PRIMARY KEY") ||
        line.startsWith("UNIQUE KEY") ||
        line.startsWith("KEY ") ||
        line.startsWith("CONSTRAINT") ||
        line.startsWith("INDEX")
      ) {
        continue;
      }

      const columnMatch = line.match(COLUMN_LINE_REGEX);
      if (!columnMatch) continue;

      columns.push({
        name: columnMatch[1],
        type: columnMatch[2],
        nullable: !/NOT NULL/i.test(line),
      });
    }

    if (columns.length > 0) {
      tables.push({ name, columns });
    }
  }

  return tables;
}

export function extractInsertRows(
  sql: string,
  tableName: string,
): Array<Record<string, unknown>> {
  const rows: Array<Record<string, unknown>> = [];
  const insertStartRegex = new RegExp(
    `INSERT\\s+INTO\\s+\`?${tableName}\`?\\s*\\(([^)]+)\\)\\s*VALUES\\s*`,
    "gi",
  );

  for (const match of sql.matchAll(insertStartRegex)) {
    const declaredColumns = match[1]
      .split(",")
      .map((column) => column.trim().replace(/`/g, ""))
      .filter(Boolean);

    const valuesStart = match.index! + match[0].length;
    const valuesBlock = extractUntilStatementEnd(sql, valuesStart).trim();
    const tuples = splitSqlValueTuples(valuesBlock);

    for (const tuple of tuples) {
      const values = parseSqlTuple(tuple);
      const row: Record<string, unknown> = {};
      declaredColumns.forEach((column, index) => {
        row[column] = values[index] ?? null;
      });
      rows.push(row);
    }
  }

  return rows;
}

function splitSqlValueTuples(valuesBlock: string): string[] {
  const tuples: string[] = [];
  let depth = 0;
  let start = -1;
  let inString = false;
  let stringQuote = "";
  let escaping = false;

  for (let index = 0; index < valuesBlock.length; index += 1) {
    const char = valuesBlock[index];

    if (inString) {
      if (escaping) {
        escaping = false;
        continue;
      }
      if (char === "\\") {
        escaping = true;
        continue;
      }
      if (char === stringQuote) {
        inString = false;
        stringQuote = "";
      }
      continue;
    }

    if (char === "'" || char === '"') {
      inString = true;
      stringQuote = char;
      continue;
    }

    if (char === "(") {
      if (depth === 0) start = index + 1;
      depth += 1;
      continue;
    }

    if (char === ")") {
      depth -= 1;
      if (depth === 0 && start >= 0) {
        tuples.push(valuesBlock.slice(start, index));
        start = -1;
      }
    }
  }

  return tuples;
}

function parseSqlTuple(tuple: string): unknown[] {
  const values: unknown[] = [];
  let current = "";
  let inString = false;
  let stringQuote = "";
  let escaping = false;

  const pushCurrent = () => {
    const trimmed = current.trim();
    if (trimmed.toUpperCase() === "NULL") {
      values.push(null);
    } else if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
      values.push(Number(trimmed));
    } else {
      values.push(trimmed.replace(/^['"]|['"]$/g, "").replace(/\\'/g, "'"));
    }
    current = "";
  };

  for (let index = 0; index < tuple.length; index += 1) {
    const char = tuple[index];

    if (inString) {
      if (escaping) {
        current += char;
        escaping = false;
        continue;
      }
      if (char === "\\") {
        escaping = true;
        continue;
      }
      if (char === stringQuote) {
        inString = false;
        continue;
      }
      current += char;
      continue;
    }

    if (char === "'" || char === '"') {
      inString = true;
      stringQuote = char;
      continue;
    }

    if (char === ",") {
      pushCurrent();
      continue;
    }

    current += char;
  }

  if (current.length > 0) {
    pushCurrent();
  }

  return values;
}
