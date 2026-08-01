/**
 * Luvio Platform — Database Client Initialization
 * Creates Drizzle ORM client from Cloudflare D1 binding.
 */

import { drizzle, DrizzleD1Database } from 'drizzle-orm/d1';
import { drizzle as drizzleLibSQL } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

export type Database = DrizzleD1Database<typeof schema>;

export function createDb(d1: D1Database): Database {
  return drizzle(d1, { schema });
}

export function createBackupDb(url: string, authToken: string) {
  const client = createClient({
    url,
    authToken,
  });
  return drizzleLibSQL(client, { schema });
}

export { schema };
