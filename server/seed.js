
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { initDb, query, isFallback } from './db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const PRODUCTS = [
    { id: '1', name: 'Jarrón Cerámico', price: 25.00, category: 'Decoración', stock: 8, image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBk9NjumA1YAiEt_7cL8lq13fazikGfyNw85crq3jbsLrqBdrJKtTMZ8_N8kHyfsN__N5spe9HzLuK5NFp5PpUaBpk2uQNrD6y4UhYyQQ5X3t9PqoYFXpeGGxELbPSnvk9rYh38e2UZuJyclQP1zVMXs8zGyGB9FLkviyB05evBz7iQu0QM8Rs7g0ClfjyfjMuFdBq-6qVuoGgOGRcgbYpCBpeK1xlcX19qDMpgd8zhe36t4lDwBjv9nNnXFW6jcBNfuKwnwYslvNu-', description: 'Jarrón minimalista de cerámica blanca con acabado mate.' },
    { id: '2', name: 'Utensilios de Cocina', price: 32.50, category: 'Cocina', stock: 2, image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCDSQ_tji91pojsd8uyWJPapPs4VKtysjIdtdZsj9A4A64BA_46AmhMgjnSoFhNEQgGT5FHG0rZ3Q-CGvch94BKdSGpOwc5qla87si0CnEfsPWjByXaSTfaXEl65M2nOXz8PEYWN3td-hvIDSUWT6Gvi9KKqphiJIX352VCh4SpBcZwelcWk7E59SoXtzm0FV4cmZqr_Uh7zLp7Z9mpez1qVjr8twVYypGtYDvSc4aCUuSrLcsLMEVY2M-u4gCfNuiXOHj5vsug0q8r', description: 'Set de utensilios de madera de bambú sostenibles.' },
    { id: '3', name: 'Lámpara de Escritorio', price: 48.00, category: 'Decoración', stock: 0, image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD63QL6DidxWpw8GQkC_lbvt8OrBHM7eml_5mkdxTvsdOPn4AlhYAMtZW56lLb0msA4VK8iQca5kZIVMais9XMlcjx8yqjxksApXjqexLeXsAX5bOjD8a-kH1Oq1ZTpUloYb_Qu1G5bwpsd1W5e6BPRv7CeSdUrqFPYdsFk0jNogoR-1hVjraOK6O65vtT3Dbh3L-I2ZUDE5HSQf8qj2eu3HI-BIAjsfzmhCWr_umtylX3Rvjb_g_QVyUpc5AiSsdWay1ydpJd4SoWZ', description: 'Lámpara LED moderna con luz cálida ajustable.' },
    { id: '4', name: 'Cojín Texturizado', price: 19.99, category: 'Textil', stock: 3, image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCkpPiP9YUx4_Bbj6XK5yHaYAhHR1elKb71Dpaow00wi8oyhS3ZMML83o-xdWeJPIJB0BL-QZS1p7YGBtmaGX2l91fNYBN1VueJxw4sFczngyUdgNcQh8tjtuukVgVF53bTNP3xzwQ5aGrHsP0mOKZvaaTXLHyzB1G4I2cfv2SyB6ZTzFzNf8z4Rw4awiz0A3Xs0BLerduLDo5RhoLA_f1uXu1vjqYBYab0BCBWjL8CpDRPwq2w_TbgmJzUA-1c9_VcxXu2RNJwZb44', description: 'Cojín suave con textura tejida en color beige neutro.' },
    { id: '5', name: 'Planta Suculenta', price: 15.00, category: 'Jardín', stock: 12, image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBmsIcdbby4-1PQXkSMo3iaa4xagJKOBkYgMpg6HseRn6VgLmaxMqV6Xp4Wk7lDQTI7JLY_BdioVGNiJGbEmNmHTV29hp5uu9vx1-A1qWhJb59tzm7hOobRAiqKG1aRdNvDr8-yW3D9xvi1hUrA7VvWhscXNcVEiawp9O-W5e-yhcgK0GqML-rLeG7yb4dV_-fky9R4hyRiTasjz7hnexvhVJO4PcT31bakkeWA5yasVeiFn0Ju2rb8274zsSgVnmyOE0CJzynRu5NF', description: 'Pequeña suculenta artificial en maceta geométrica.' },
    { id: '6', name: 'Dispensador de Jabón', price: 22.00, category: 'Baño', stock: 1, image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCfX2wEaiwHf4wp9QHJkwKZQb81ck2A8umeY5UPQ--SC2OFXYZza_4wp9QHJkwKZQb81ck2A8umeY5UPQ--SC2OFXYZza_wHQ-Qwk1Fl7o6zP_XWVUkWAA1-N1l7simWXUBYLi8Ogby0RiubXwWUAE20mUPYyZVYCFFmdLfpZgD-kpNd7O6_nSo2H4G3Let0kbDMoOoJsqeAM2mhJ5aSBAaBHtiOmzNTGypyEyfcsH92HajKYTSSj0Jea-ITAdr3KTLLKYOp0zYTpX8QSHafbNyI_XvVGlXUMPK05UhP2xzGW8o2xu-aeNf_', description: 'Dispensador de vidrio ámbar elegante y reutilizable.' },
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
