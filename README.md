# 🏠 Casa Marquito — Tienda Online de Artículos para el Hogar

**Casa Marquito** es una aplicación web de e-commerce orientada a la venta de productos para el hogar. Permite a los usuarios explorar un catálogo de artículos, agregarlos al carrito, completar el proceso de compra y consultar su historial de pedidos.

---

## 🎯 Finalidad del Proyecto

El objetivo principal de **Casa Marquito** es ofrecer una experiencia de compra online sencilla, rápida y agradable para productos del hogar. La tienda está pensada para:

- Mostrar un catálogo de productos organizado por categorías (Cocina, Decoración, Jardín, Textil, Baño).
- Permitir búsquedas de productos con soporte para acentos y mayúsculas.
- Gestionar un carrito de compras persistente (guardado en el navegador).
- Procesar pedidos con datos de envío y método de pago por transferencia bancaria.
- Registrar el historial de pedidos y las direcciones del usuario de forma local.
- Enviar (de forma simulada) un email de confirmación con recomendaciones de productos adicionales.

---

## 🛠️ Tecnologías Utilizadas

### Frontend
| Tecnología | Versión | Uso |
|---|---|---|
| **React** | 19 | Librería principal de UI |
| **TypeScript** | 5.8 | Tipado estático |
| **Vite** | 6 | Bundler y servidor de desarrollo |

### Backend
| Tecnología | Versión | Uso |
|---|---|---|
| **Node.js** | — | Entorno de ejecución |
| **Express** | 5 | Framework para la API REST |
| **CORS** | 2.8 | Manejo de peticiones cross-origin |
| **body-parser** | 2.2 | Parseo de cuerpos JSON |

---

## 📁 Estructura del Proyecto

```
Casa-Marquito/
├── App.tsx                  # Componente raíz: estado global, navegación y lógica principal
├── types.ts                 # Interfaces TypeScript: Product, CartItem, Order, Address
├── index.tsx                # Punto de entrada de React
├── index.html               # HTML base
├── vite.config.ts           # Configuración de Vite
├── components/
│   ├── HomeView.tsx         # Página de inicio con acceso por categorías
│   ├── ProductCard.tsx      # Tarjeta individual de producto
│   ├── ProductDetailModal.tsx # Modal con detalle ampliado del producto
│   ├── CategoryFilter.tsx   # Filtro horizontal de categorías
│   ├── CartDrawer.tsx       # Carrito lateral deslizable
│   ├── CheckoutView.tsx     # Formulario de checkout y datos de envío
│   ├── OrderSuccessView.tsx # Pantalla de confirmación con recomendaciones
│   ├── ProfileView.tsx      # Historial de pedidos y gestión de direcciones
│   └── AuthView.tsx         # Vista de autenticación (modo invitado)
├── services/
│   ├── productService.ts    # Obtención de productos y envío de pedidos a la API
│   ├── emailService.ts      # Generación simulada de email de confirmación
│   └── authService.ts       # Gestión de sesión (modo invitado con localStorage)
└── server/
    ├── index.js             # Servidor Express con API REST (puerto 3001)
    └── data.js              # Datos de productos (base de datos en memoria)
```

---

## 🔌 API REST (Backend)

El servidor corre en `http://localhost:3001` y expone los siguientes endpoints:

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/products` | Retorna la lista completa de productos |
| `GET` | `/api/products/:id` | Retorna un producto específico por ID |
| `POST` | `/api/orders` | Registra un nuevo pedido |

> Si el backend no está disponible, el frontend carga automáticamente datos de ejemplo (mock data) para que la app siga funcionando.

---

## 🗂️ Categorías de Productos

`Cocina` · `Decoración` · `Jardín` · `Textil` · `Baño`

---

## 🚀 Instalación y Ejecución

### Prerrequisitos
- **Node.js** instalado

### Pasos

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Configurar la API Key de Gemini (necesaria para el servicio de email):
   ```
   GEMINI_API_KEY=tu_api_key_aqui
   ```
   Crear el archivo `.env.local` en la raíz del proyecto con la variable anterior.

3. Iniciar la aplicación:
   ```bash
   npm run dev
   ```

La app estará disponible en `http://localhost:5173` (o el puerto que indique Vite).

---

## 🐳 Docker

El proyecto incluye soporte completo para Docker, permitiendo levantar toda la aplicación con un solo comando.

### Archivos incluidos

| Archivo | Descripción |
|---|---|
| `Dockerfile.frontend` | Build multi-etapa: compila con Node y sirve con Nginx |
| `Dockerfile.backend` | Imagen Node ligera para el servidor Express |
| `docker-compose.yml` | Orquesta ambos servicios con healthcheck |
| `nginx.conf` | Configuración de Nginx para SPA + proxy inverso a la API |
| `.dockerignore` | Excluye archivos innecesarios del contexto de build |

### Levantar con Docker Compose

```bash
# Construir imágenes e iniciar los servicios
docker-compose up --build

# En segundo plano
docker-compose up --build -d
```

Una vez iniciado:
- **Frontend** → `http://localhost:3000`
- **Backend API** → `http://localhost:3001/api/products`

### Comandos útiles

```bash
# Ver logs en tiempo real
docker-compose logs -f

# Detener los servicios
docker-compose down

# Reconstruir solo un servicio
docker-compose build backend
docker-compose build frontend
```

> **Nota:** Si usás la API de Gemini, creá un archivo `.env` en la raíz con `GEMINI_API_KEY=tu_api_key` antes de hacer el build.

---

## ✨ Funcionalidades Destacadas

- 🔍 **Búsqueda inteligente** — Ignora acentos y mayúsculas; busca en todas las categorías simultáneamente.
- 🛒 **Carrito persistente** — El carrito se guarda en `localStorage` y sobrevive recargas de página.
- 📦 **Historial de pedidos** — Los pedidos completados quedan guardados en el perfil del usuario.
- 📍 **Gestión de direcciones** — El usuario puede agregar y administrar múltiples direcciones de envío.
- 🎁 **Recomendaciones post-compra** — Al finalizar un pedido, se sugieren productos relacionados.
- 🌙 **Soporte Dark Mode** — La interfaz se adapta automáticamente al tema del sistema operativo.
