# Que Importa - Visualización de Datos Urbanos

Plataforma unificada para la visualización y análisis de incidentes de seguridad y datos urbanos en Buenos Aires. Este proyecto combina un mapa interactivo, estadísticas en tiempo real y análisis histórico.

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 🚀 Tecnologías

Este proyecto está construido con una arquitectura moderna de microservicios (monorrepo):

### Frontend (`/frontend`)
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Estilos**: Tailwind CSS
- **Mapas**: Leaflet / React-Leaflet
- **Visualización**: Recharts para gráficos analíticos

### Backend (`/backend`)
- **Framework**: [NestJS](https://nestjs.com/)
- **Base de Datos**: PostgreSQL
- **ORM**: Prisma
- **Ingesta**: Procesamiento de CSVs para datos históricos de seguridad.

## 🛠️ Instalación y Configuración Local

### Prerequisitos
- Node.js (v18 o superior)
- PostgreSQL (o Docker para correr la base de datos)

### 1. Clonar el repositorio
```bash
git clone https://github.com/Sawkker/queimporta.git
cd queimporta
```

### 2. Configurar el Backend
```bash
cd backend
npm install

# Copiar variables de entorno
cp .env.example .env 
# (Asegúrate de configurar tu DATABASE_URL en el archivo .env)

# Correr migraciones y generar cliente de Prisma
npx prisma migrate dev

# Iniciar el servidor
npm run start:dev
```
El backend correrá en `http://localhost:8080`.

### 3. Configurar el Frontend
```bash
cd ../frontend
npm install

# Configurar variables de entorno
# Crear un archivo .env.local con:
# NEXT_PUBLIC_API_URL=http://localhost:8080

# Iniciar el servidor de desarrollo
npm run dev
```
El frontend correrá en `http://localhost:3000`.

## 📊 Características
- **Mapa de Calor**: Visualización de densidad de incidentes.
- **Filtros por Comuna**: Análisis granular por zonas de Buenos Aires.
- **Estadísticas**: Gráficos de tendencias históricas.
- **Ingesta de Datos**: Scripts automatizados para importar datasets gubernamentales.

## 🤝 Contribución
Las contribuciones son bienvenidas. Por favor, abre un issue para discutir cambios mayores antes de enviar un Pull Request.

## 📄 Licencia
Este proyecto está bajo la Licencia MIT.
