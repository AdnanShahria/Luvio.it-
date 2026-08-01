/**
 * Luvio Platform — Health Monitoring
 * Monitors uptime of Cloudflare D1/R2 and fallback Turso/ImgBB services.
 */

export interface HealthState {
  d1_online: boolean;
  r2_online: boolean;
  turso_online: boolean;
  imgbb_online: boolean;
  last_checked: string;
}

export const DEFAULT_HEALTH: HealthState = {
  d1_online: true,
  r2_online: true,
  turso_online: true,
  imgbb_online: true,
  last_checked: new Date().toISOString()
};

/**
 * Retrieves the current health state from KV.
 * If none exists, assumes everything is online.
 */
export async function getHealthState(kv: KVNamespace): Promise<HealthState> {
  const stateStr = await kv.get('health_state');
  if (!stateStr) return DEFAULT_HEALTH;
  try {
    return JSON.parse(stateStr) as HealthState;
  } catch {
    return DEFAULT_HEALTH;
  }
}

/**
 * Saves the health state to KV.
 */
export async function setHealthState(kv: KVNamespace, state: HealthState): Promise<void> {
  await kv.put('health_state', JSON.stringify(state));
}

/**
 * Marks a specific service as offline and updates KV.
 */
export async function markServiceOffline(
  kv: KVNamespace,
  service: 'd1_online' | 'r2_online' | 'turso_online' | 'imgbb_online'
): Promise<void> {
  const state = await getHealthState(kv);
  if (state[service]) {
    state[service] = false;
    state.last_checked = new Date().toISOString();
    await setHealthState(kv, state);
    console.log(`⚠️ ${service.replace('_online', '').toUpperCase()} Offline! Routing to fallback...`);
  }
}

/**
 * Pings all services to determine their uptime.
 * To be run in a Cron Trigger.
 */
export async function checkAllServices(env: any): Promise<void> {
  const state = await getHealthState(env.HEALTH_STATE);
  let stateChanged = false;

  // Ping D1 (simple select)
  try {
    await env.DB.prepare('SELECT 1').run();
    if (!state.d1_online) {
      console.log('📥 Recovery Detected (D1)');
      state.d1_online = true;
      stateChanged = true;
    }
  } catch (err) {
    if (state.d1_online) {
      console.log('⚠️ D1 Offline');
      state.d1_online = false;
      stateChanged = true;
    }
  }

  // Ping R2 (list bucket)
  try {
    await env.R2_BUCKET.list({ limit: 1 });
    if (!state.r2_online) {
      console.log('📥 Recovery Detected (R2)');
      state.r2_online = true;
      stateChanged = true;
    }
  } catch (err) {
    if (state.r2_online) {
      console.log('⚠️ R2 Offline');
      state.r2_online = false;
      stateChanged = true;
    }
  }

  // Ping Turso
  try {
    if (env.TURSO_DATABASE_URL) {
      const response = await fetch(env.TURSO_DATABASE_URL.replace('libsql://', 'https://') + '/v2', {
        headers: { Authorization: `Bearer ${env.TURSO_AUTH_TOKEN}` }
      });
      if (response.ok && !state.turso_online) {
         console.log('🟢 Turso Connected');
         state.turso_online = true;
         stateChanged = true;
      }
    }
  } catch (err) {
    if (state.turso_online) {
      console.log('⚠️ Turso Offline');
      state.turso_online = false;
      stateChanged = true;
    }
  }

  // Ping ImgBB
  try {
    if (env.IMGBB_API_KEY) {
      const response = await fetch('https://api.imgbb.com/');
      if (response.ok && !state.imgbb_online) {
         console.log('🟢 ImgBB Connected');
         state.imgbb_online = true;
         stateChanged = true;
      }
    }
  } catch (err) {
    if (state.imgbb_online) {
      console.log('⚠️ ImgBB Offline');
      state.imgbb_online = false;
      stateChanged = true;
    }
  }

  if (stateChanged) {
    state.last_checked = new Date().toISOString();
    await setHealthState(env.HEALTH_STATE, state);
    console.log('🔄 Health State Updated:', state);
  } else {
    console.log('✅ All services healthy (no state change)');
  }
}
