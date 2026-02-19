import { initDb, query } from '../server/db.js';

// Restore original working lh3.googleusercontent.com URLs for products 1-5
// and keep the fixed Unsplash URL for product 6 (Dispensador de Jabón)
const IMAGES = [
    { id: '1', image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBk9NjumA1YAiEt_7cL8lq13fazikGfyNw85crq3jbsLrqBdrJKtTMZ8_N8kHyfsN__N5spe9HzLuK5NFp5PpUaBpk2uQNrD6y4UhYyQQ5X3t9PqoYFXpeGGxELbPSnvk9rYh38e2UZuJyclQP1zVMXs8zGyGB9FLkviyB05evBz7iQu0QM8Rs7g0ClfjyfjMuFdBq-6qVuoGgOGRcgbYpCBpeK1xlcX19qDMpgd8zhe36t4lDwBjv9nNnXFW6jcBNfuKwnwYslvNu-' },
    { id: '2', image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCDSQ_tji91pojsd8uyWJPapPs4VKtysjIdtdZsj9A4A64BA_46AmhMgjnSoFhNEQgGT5FHG0rZ3Q-CGvch94BKdSGpOwc5qla87si0CnEfsPWjByXaSTfaXEl65M2nOXz8PEYWN3td-hvIDSUWT6Gvi9KKqphiJIX352VCh4SpBcZwelcWk7E59SoXtzm0FV4cmZqr_Uh7zLp7Z9mpez1qVjr8twVYypGtYDvSc4aCUuSrLcsLMEVY2M-u4gCfNuiXOHj5vsug0q8r' },
    { id: '3', image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD63QL6DidxWpw8GQkC_lbvt8OrBHM7eml_5mkdxTvsdOPn4AlhYAMtZW56lLb0msA4VK8iQca5kZIVMais9XMlcjx8yqjxksApXjqexLeXsAX5bOjD8a-kH1Oq1ZTpUloYb_Qu1G5bwpsd1W5e6BPRv7CeSdUrqFPYdsFk0jNogoR-1hVjraOK6O65vtT3Dbh3L-I2ZUDE5HSQf8qj2eu3HI-BIAjsfzmhCWr_umtylX3Rvjb_g_QVyUpc5AiSsdWay1ydpJd4SoWZ' },
    { id: '4', image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCkpPiP9YUx4_Bbj6XK5yHaYAhHR1elKb71Dpaow00wi8oyhS3ZMML83o-xdWeJPIJB0BL-QZS1p7YGBtmaGX2l91fNYBN1VueJxw4sFczngyUdgNcQh8tjtuukVgVF53bTNP3xzwQ5aGrHsP0mOKZvaaTXLHyzB1G4I2cfv2SyB6ZTzFzNf8z4Rw4awiz0A3Xs0BLerduLDo5RhoLA_f1uXu1vjqYBYab0BCBWjL8CpDRPwq2w_TbgmJzUA-1c9_VcxXu2RNJwZb44' },
    { id: '5', image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBmsIcdbby4-1PQXkSMo3iaa4xagJKOBkYgMpg6HseRn6VgLmaxMqV6Xp4Wk7lDQTI7JLY_BdioVGNiJGbEmNmHTV29hp5uu9vx1-A1qWhJb59tzm7hOobRAiqKG1aRdNvDr8-yW3D9xvi1hUrA7VvWhscXNcVEiawp9O-W5e-yhcgK0GqML-rLeG7yb4dV_-fky9R4hyRiTasjz7hnexvhVJO4PcT31bakkeWA5yasVeiFn0Ju2rb8274zsSgVnmyOE0CJzynRu5NF' },
    // Product 6: use a working Unsplash soap dispenser image
    { id: '6', image_url: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&auto=format&fit=crop&q=80' },
];

await initDb();
for (const p of IMAGES) {
    await query('UPDATE products SET image_url = $1 WHERE id = $2', [p.image_url, p.id]);
    console.log(`✅ Producto ${p.id} actualizado.`);
}
console.log('✅ Todas las imágenes restauradas correctamente.');
process.exit(0);
