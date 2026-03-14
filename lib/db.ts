import { createClient } from "@libsql/client";

let _client: ReturnType<typeof createClient> | null = null;

function getClient() {
  if (!_client) {
    _client = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN!,
    });
  }
  return _client;
}

export async function initDB() {
  const client = getClient();
  await client.execute(`
    CREATE TABLE IF NOT EXISTS allowed_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const defaultUsers = ["kts123@kookmin.ac.kr"];
  for (const email of defaultUsers) {
    await client.execute({
      sql: "INSERT OR IGNORE INTO allowed_users (email) VALUES (?)",
      args: [email],
    });
  }
}

export async function isAllowedUser(email: string): Promise<boolean> {
  const client = getClient();
  const result = await client.execute({
    sql: "SELECT email FROM allowed_users WHERE email = ?",
    args: [email],
  });
  return result.rows.length > 0;
}

export async function getAllowedUsers(): Promise<string[]> {
  const client = getClient();
  const result = await client.execute("SELECT email FROM allowed_users ORDER BY created_at");
  return result.rows.map((row) => row.email as string);
}

export async function addAllowedUser(email: string): Promise<void> {
  const client = getClient();
  await client.execute({
    sql: "INSERT OR IGNORE INTO allowed_users (email) VALUES (?)",
    args: [email],
  });
}
