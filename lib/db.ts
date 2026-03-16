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

// 방명록
export async function initGuestbook() {
  const client = getClient();
  await client.execute(`
    CREATE TABLE IF NOT EXISTS guestbook (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      author_email TEXT NOT NULL,
      author_name TEXT NOT NULL,
      content TEXT NOT NULL,
      my_service_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export async function getGuestbookEntries() {
  const client = getClient();
  const result = await client.execute(
    "SELECT * FROM guestbook ORDER BY created_at DESC LIMIT 100"
  );
  return result.rows;
}

export async function addGuestbookEntry(
  author_email: string,
  author_name: string,
  content: string,
  my_service_url: string
) {
  const client = getClient();
  await client.execute({
    sql: "INSERT INTO guestbook (author_email, author_name, content, my_service_url) VALUES (?, ?, ?, ?)",
    args: [author_email, author_name, content, my_service_url],
  });
}

export async function deleteGuestbookEntry(id: number, author_email: string) {
  const client = getClient();
  await client.execute({
    sql: "DELETE FROM guestbook WHERE id = ? AND author_email = ?",
    args: [id, author_email],
  });
}
