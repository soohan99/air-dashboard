import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export async function initDB() {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS allowed_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 기본 허용 사용자 추가
  const defaultUsers = ["kts123@kookmin.ac.kr"];
  for (const email of defaultUsers) {
    await client.execute({
      sql: "INSERT OR IGNORE INTO allowed_users (email) VALUES (?)",
      args: [email],
    });
  }
}

export async function isAllowedUser(email: string): Promise<boolean> {
  const result = await client.execute({
    sql: "SELECT email FROM allowed_users WHERE email = ?",
    args: [email],
  });
  return result.rows.length > 0;
}

export async function getAllowedUsers(): Promise<string[]> {
  const result = await client.execute("SELECT email FROM allowed_users ORDER BY created_at");
  return result.rows.map((row) => row.email as string);
}

export async function addAllowedUser(email: string): Promise<void> {
  await client.execute({
    sql: "INSERT OR IGNORE INTO allowed_users (email) VALUES (?)",
    args: [email],
  });
}

export default client;
