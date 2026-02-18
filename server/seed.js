
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { initDb, query, isFallback } from './db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const PRODUCTS = [
    { id: '1', name: 'Jarrón Cerámico', price: 25.00, category: 'Decoración', stock: 8, image_url: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&q=80&w=800', description: 'Jarrón minimalista de cerámica blanca con acabado mate.' },
    { id: '2', name: 'Utensilios de Cocina', price: 32.50, category: 'Cocina', stock: 2, image_url: 'https://images.unsplash.com/photo-1584346133934-a3afd2a33c4c?auto=format&fit=crop&q=80&w=800', description: 'Set de utensilios de madera de bambú sostenibles.' },
    { id: '3', name: 'Lámpara de Escritorio', price: 48.00, category: 'Decoración', stock: 0, image_url: 'https://images.unsplash.com/photo-1534073828943-f801091bb18c?auto=format&fit=crop&q=80&w=800', description: 'Lámpara LED moderna con luz cálida ajustable.' },
    { id: '4', name: 'Cojín Texturizado', price: 19.99, category: 'Textil', stock: 3, image_url: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=80&w=800', description: 'Cojín suave con textura tejida en color beige neutro.' },
    { id: '5', name: 'Planta Suculenta', price: 15.00, category: 'Jardín', stock: 12, image_url: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&q=80&w=800', description: 'Pequeña suculenta artificial en maceta geométrica.' },
    { id: '6', name: 'Dispensador de Jabón', price: 22.00, category: 'Baño', stock: 1, image_url: 'https://images.unsplash.com/photo-1603533866380-48281358997a?auto=format&fit=crop&q=80&w=800', description: 'Dispensador de vidrio ámbar elegante y reutilizable.' },
];

/**
 * Inicializa la base de datos: crea tablas y siembra productos.
 * Solo se ejecuta si PostgreSQL está disponible.
 */
export async function seedDatabase() {
    if (isFallback()) {
        console.log('ℹ️  Modo fallback activo — omitiendo inicialización de BD.');
        return;
    }

    try {
        // Leer y ejecutar el schema SQL
        const schemaPath = join(__dirname, 'schema.sql');
        const schemaSql = readFileSync(schemaPath, 'utf8');
        await query(schemaSql);
        console.log('✅ Tablas creadas/verificadas en PostgreSQL.');

        // Insertar productos si no existen (upsert)
        for (const p of PRODUCTS) {
            await query(
                `INSERT INTO products (id, name, price, category, image_url, description)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           price = EXCLUDED.price,
           category = EXCLUDED.category,
           image_url = EXCLUDED.image_url,
           description = EXCLUDED.description`,
                [p.id, p.name, p.price, p.category, p.image_url, p.description]
            );
        }
        console.log(`✅ ${PRODUCTS.length} productos sembrados en PostgreSQL.`);
    } catch (err) {
        console.error('❌ Error al inicializar la BD:', err.message);
    }
}

// Si se ejecuta directamente (node server/seed.js)
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    (async () => {
        await initDb();
        await seedDatabase();
        process.exit(0);
    })();
}

export { PRODUCTS };
