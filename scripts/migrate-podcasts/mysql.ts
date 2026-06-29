import mysql from "mysql2/promise";
import type { MysqlPodcastRow } from "./mapping";

export type MysqlConnectionConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
};

export function getMysqlConfigFromEnv(): MysqlConnectionConfig {
  const host = process.env.MYSQL_HOST ?? "127.0.0.1";
  const port = Number(process.env.MYSQL_PORT ?? "3306");
  const user = process.env.MYSQL_USER;
  const password = process.env.MYSQL_PASSWORD ?? "";
  const database = process.env.MYSQL_DATABASE;

  if (!user || !database) {
    throw new Error("MYSQL_USER et MYSQL_DATABASE sont requis pour la source mysql.");
  }

  return { host, port, user, password, database };
}

export async function fetchPodcastsFromMysql(
  table: string,
): Promise<MysqlPodcastRow[]> {
  const config = getMysqlConfigFromEnv();
  const connection = await mysql.createConnection(config);

  try {
    const [rows] = await connection.query(`SELECT * FROM \`${table}\``);
    return rows as MysqlPodcastRow[];
  } finally {
    await connection.end();
  }
}
