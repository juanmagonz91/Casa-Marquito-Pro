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

### Infraestructura (Multi-Cloud)
| Componente | Proveedor | Uso |
|---|---|---|
| **Frontend Hosting** | **Firebase** | Alojamiento de la aplicación React estática |
| **Autenticación** | **Firebase Auth** | Gestión de usuarios e inicio de sesión (Google/Email) |
| **Backend API** | **Render** | Servidor Express para procesamiento de pedidos y lógica |
| **Base de Datos** | **Supabase** | Base de Datos Relacional (PostgreSQL) |

### Frontend
- **React 19** + **TypeScript 5.8**
- **Vite 6** (Bundler y entorno)
- **TailwindCSS** (Estilizado)
- **Material Symbols** (Iconografía)

### Backend
- **Node.js** + **Express 5**
- **PostgreSQL (pg)** — Conector de base de datos
- **Nodemailer** — Envío de correos vía SMTP (Gmail)
- **PDFKit** & **ExcelJS** — Generación de documentos

---

## 📁 Estructura del Proyecto

```
Casa-Marquito/
├── src/
│   └── firebase.ts          # Configuración del SDK de Firebase
├── components/              # Componentes de React (Home, Checkout, Perfil, etc.)
├── services/
│   ├── productService.ts    # Consumo de API en Render
│   └── authService.ts       # Integración con Firebase Auth
├── server/
│   ├── index.js             # API REST principal (Render)
│   ├── db.js                # Conexión a PostgreSQL (Supabase)
│   ├── emailService.js      # Lógica de correos con adjuntos
│   ├── pdfGenerator.js      # Generación de resúmenes en PDF
│   └── excelGenerator.js    # Generación de reportes en Excel
├── scripts/                 # Scripts de migración y herramientas
└── server/schema.sql        # Definición de tablas PostgreSQL
```

---

## ☁️ Arquitectura Multi-Cloud

Para garantizar escalabilidad y evitar límites de facturación, **Casa Marquito** utiliza un enfoque distribuido:

1.  **Frontend (Firebase)**: Servido de forma global. Utiliza Firebase Auth para proteger las rutas y gestionar usuarios.
2.  **Backend (Render)**: Recibe los pedidos del frontend y los procesa. Se encarga de la lógica de negocio pesada, como generar documentos y enviar emails.
3.  **Database (Supabase)**: Almacena de forma persistente y relacional los productos, usuarios y pedidos.

---

## 🔌 API REST (Render)

La API vive en `https://casa-marquito.onrender.com/api` (o tu URL de producción).

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/status` | Verifica el estado del servidor y la conexión a la base de datos |
| `GET` | `/api/products` | Obtiene el catálogo desde PostgreSQL |
| `POST` | `/api/orders` | Guarda un pedido en SQL y dispara el flujo de emails |
| `POST` | `/api/coupons/validate` | Valida cupones de descuento |

---

## 🚀 Instalación y Ejecución Local

### Prerrequisitos
- **Node.js** 18+
- Un proyecto en **Firebase**
- Una base de datos en **Supabase**

### Pasos

1.  **Backend**:
    ```bash
    # En la raíz, configurar el archivo .env
    DATABASE_URL=tu_conexion_supabase
    SMTP_USER=tu_email
    SMTP_PASS=tu_app_password
    
    # Iniciar servidor
    npm run server
    ```

2.  **Frontend**:
    ```bash
    # Configurar VITE_API_URL en .env
    VITE_API_URL=http://localhost:3001/api
    
    # Iniciar React
    npm run dev
    ```

---

## ✨ Funcionalidades Destacadas

- 🔍 **Búsqueda inteligente** — Soporte para acentos y categorías.
- � **Checkout SQL** — Los pedidos se guardan en una DB relacional robusta.
- � **Notificaciones PDF/Excel** — El cliente recibe un PDF y el administrador un Excel.
- 🔐 **Autenticación Real** — Integrado con Firebase Auth para una seguridad profesional.
- 🌙 **Modern Design** — Soporte nativo para Dark Mode y micro-animaciones.
