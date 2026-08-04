/** Cloudflare Worker/Pages bindings used by the client portal. */
interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  run(): Promise<{ meta?: { last_row_id?: number; changes?: number } }>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
}

interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch?<T = unknown>(statements: D1PreparedStatement[]): Promise<T[]>;
  exec?(query: string): Promise<unknown>;
}

interface CloudflareEnv {
  DB: D1Database;
}

export {};
