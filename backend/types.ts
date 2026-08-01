/**
 * Luvio Platform — Environment Types
 * Defines the Cloudflare Worker bindings available in the Hono context.
 */

export interface Env {
  Bindings: {
    DB: D1Database;
    R2_BUCKET: R2Bucket;
    CHAT_ROOM: DurableObjectNamespace;
    JWT_SECRET: string;
    REFRESH_TOKEN_SECRET: string;
    JWT_EXPIRES_IN: string;
    REFRESH_TOKEN_EXPIRES_IN: string;
    TURSO_DATABASE_URL: string;
    TURSO_AUTH_TOKEN: string;
    IMGBB_API_KEY: string;
    OTP_SERVICE_API_KEY: string;
    OTP_SERVICE_URL: string;
    SENDPULSE_API_USER_ID: string;
    SENDPULSE_API_SECRET: string;
    SENDPULSE_FROM_EMAIL: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    APPLE_CLIENT_ID: string;
    STRIPE_SECRET_KEY: string;
    STRIPE_WEBHOOK_SECRET: string;
    MAPBOX_ACCESS_TOKEN: string;
    FCM_SERVER_KEY: string;
    APP_NAME: string;
    NODE_ENV: string;
  };
  Variables: {
    userId: string;
    userRole: string;
    validatedBody: any;
    validatedQuery: any;
  };
}
