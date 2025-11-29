# 📺 Simple TV App Manager

> **Gestión Inteligente de Cuentas y Dispositivos de TV**
> *Optimiza, Organiza y Controla tu negocio de TV Satelital con estilo.*

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-B73C92?style=for-the-badge&logo=vite&logoColor=white)
![Material UI](https://img.shields.io/badge/Material--UI-0081CB?style=for-the-badge&logo=material-ui&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=3ECF8E)

---

## ✨ Sobre el Proyecto

**Simple TV App** es una solución moderna y elegante diseñada para simplificar la administración de cuentas de televisión por suscripción. Con una interfaz intuitiva y potentes herramientas de reporte, permite llevar un control total sobre clientes, decodificadores, fechas de corte y finanzas.

¡Dile adiós a las hojas de cálculo desordenadas y hola a la productividad! 🚀

---

## 🚀 Características Principales

### 👥 Gestión de Cuentas
*   **Registro Completo**: Almacena información detallada de clientes (Alias, Email, Ubicación).
*   **Control de Dispositivos**: Administra múltiples decodificadores por cuenta.
*   **Tarjetas Visuales**: Visualiza el estado de cada cuenta con tarjetas interactivas y coloridas.

### 📊 Reportes Avanzados
*   **Dashboard Interactivo**: Vista general del estado de tu negocio.
*   **Proyección de Renovaciones**: *[NUEVO]* Visualiza tus ingresos futuros y carga de trabajo con un timeline de vencimientos.
*   **Top Clientes**: Identifica a tus clientes más valiosos.
*   **Alertas de Vencimiento**: Nunca pierdas una fecha de corte con indicadores visuales claros.

### 🔔 Notificaciones Inteligentes
*   **Integración con WhatsApp y Email**: Envía recordatorios de pago con un solo clic.
*   **Plantillas Automáticas**: Mensajes pre-formateados con el resumen de deuda y fechas.

### 🎨 UI/UX Premium
*   **Diseño Material Design**: Interfaz limpia, moderna y responsiva.
*   **Modo Oscuro/Claro**: Adaptable a tus preferencias (preparado para el futuro).
*   **Navegación Fluida**: Menú lateral colapsable y navegación flotante para acceso rápido.

---

## 🛠️ Stack Tecnológico

Este proyecto ha sido construido con las tecnologías más robustas y modernas del mercado:

*   **Frontend**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
*   **Build Tool**: [Vite](https://vitejs.dev/) (¡Velocidad extrema!)
*   **UI Framework**: [Material UI v7](https://mui.com/)
*   **Backend & Base de Datos**: [Supabase](https://supabase.com/) (PostgreSQL)
*   **Manejo de Fechas**: [Day.js](https://day.js.org/)
*   **Iconos**: MUI Icons

---

## 🏁 Comenzando

Sigue estos pasos para ejecutar el proyecto en tu máquina local:

### Prerrequisitos
*   Node.js (v18 o superior)
*   npm o yarn

### Instalación

1.  **Clonar el repositorio**
    ```bash
    git clone https://github.com/tu-usuario/simple-tv-app.git
    cd simple-tv-app
    ```

2.  **Instalar dependencias**
    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno**
    Crea un archivo `.env` en la raíz y agrega tus credenciales de Supabase:
    ```env
    VITE_SUPABASE_URL=tu_url_de_supabase
    VITE_SUPABASE_ANON_KEY=tu_clave_anonima
    ```

4.  **Correr el servidor de desarrollo**
    ```bash
    npm run dev
    ```

5.  **¡Listo!** Abre tu navegador en `http://localhost:5173`

---

## 📂 Estructura del Proyecto

```
src/
├── 📂 components/       # Componentes reutilizables (Cards, Forms, Lists)
├── 📂 assets/          # Imágenes y recursos estáticos
├── 📜 App.tsx          # Componente principal y Rutas
├── 📜 supabaseClient.ts # Configuración del cliente Supabase
└── 📜 main.tsx         # Punto de entrada de la aplicación
```

---

<div align="center">

Hecho con ❤️ por **[Tu Nombre / Tu Equipo]**

</div>
