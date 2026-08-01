/**
 * Luvio Platform — High Availability Database Router
 * Intercepts Drizzle queries to handle D1/Turso failover and synchronization.
 */
import type { Env } from '../types';
import { getHealthState } from '../core/health';
import { createClient } from '@libsql/client';

/**
 * Wrapper for database WRITE operations (INSERT, UPDATE, DELETE).
 * Executes on Primary (D1) first. If Primary is healthy, queues for Backup (Turso).
 * If Primary is down, writes directly to Backup and queues for Primary.
 * 
 * @param env Cloudflare Bindings
 * @param queryBuilder An unexecuted Drizzle query (e.g., db.insert(users).values(...))
 */
export async function executeWrite(env: Env['Bindings'], queryBuilder: any) {
  const { sql, params } = queryBuilder.toSQL();
  const health = await getHealthState(env.HEALTH_STATE);

  if (health.d1_online) {
    // 1. Primary Path: Execute natively on D1 via Drizzle
    const result = await queryBuilder;
    
    // 2. Queue replication for Turso
    if (env.SYNC_QUEUE) {
       await env.SYNC_QUEUE.send({
         type: 'SYNC_DB_TO_TURSO',
         payload: { sql, params }
       });
    }
    return result;
  } else {
    console.log(`⚠️ D1 Offline - Routing write to Turso (Backup)`);
    // 1. Failover Path: Write directly to Turso using raw LibSQL client
    const client = createClient({ 
      url: env.TURSO_DATABASE_URL, 
      authToken: env.TURSO_AUTH_TOKEN 
    });
    const result = await client.execute({ sql, args: params });

    // 2. Queue replication for D1 (to execute when it recovers)
    if (env.SYNC_QUEUE) {
      await env.SYNC_QUEUE.send({
        type: 'SYNC_DB_TO_D1',
        payload: { sql, params }
      });
    }

    return result;
  }
}

/**
 * Wrapper for database READ operations (SELECT).
 * Tries Primary (D1). If offline, reads from Backup (Turso).
 */
export async function executeRead(env: Env['Bindings'], queryBuilder: any) {
  const health = await getHealthState(env.HEALTH_STATE);

  if (health.d1_online) {
    // Primary Path: Execute natively on D1 via Drizzle
    return await queryBuilder;
  } else {
    console.log(`⚠️ D1 Offline - Routing read to Turso (Backup)`);
    // Failover Path: Read from Turso
    const { sql, params } = queryBuilder.toSQL();
    const client = createClient({ 
      url: env.TURSO_DATABASE_URL, 
      authToken: env.TURSO_AUTH_TOKEN 
    });
    const result = await client.execute({ sql, args: params });
    // Note: Raw Turso results (.rows) may need mapping to match Drizzle's native output exactly,
    // but this serves as a robust fallback for critical operations.
    return result.rows;
  }
}
