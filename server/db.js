
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const { Pool } = pg;

// ── Conexión a PostgreSQL ────────────────────────────────────────────────────
let pool = null;
let usingFallback = false;

// Datos en memoria para el fallback (cuando PostgreSQL no está disponible)
export const fallbackStore = {
    orders: [],
};

/**
 * Intenta crear el pool de conexión a PostgreSQL.
 */
export async function initDb() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        console.warn('⚠️  DATABASE_URL no definida. Usando configuración local o modo fallback.');
    }

    const config = connectionString
        ? { connectionString, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 5000 }
        : {
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432'),
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
            database: process.env.DB_NAME || 'casa_marquito',
            connectionTimeoutMillis: 3000,
        };

    try {
        pool = new Pool(config);
        const client = await pool.connect();
        client.release();
        console.log(`✅ Conectado a PostgreSQL (Supabase/Remote)`);
        usingFallback = false;
        return true;
    } catch (err) {
        console.warn(`⚠️  PostgreSQL no disponible (${err.message}). Usando modo fallback (memoria).`);
        pool = null;
        usingFallback = true;
        return false;
    }
}

/** Retorna true si estamos en modo fallback */
export function isFallback() {
    return usingFallback;
}

/**
 * Ejecuta una query SQL. Lanza error si no hay conexión activa.
 */
export async function query(text, params) {
    if (!pool) throw new Error('No hay conexión a PostgreSQL activa.');
    return pool.query(text, params);
}

/**
 * Obtiene un cliente del pool para transacciones manuales.
 */
export async function getClient() {
    if (!pool) throw new Error('No hay conexión a PostgreSQL activa.');
    return pool.connect();
}
