# Comercializadora SPG

Sistema de comercio electrónico multiperfil con arquitectura separada de frontend y backend.

## 📁 Estructura del Proyecto

```
Comercializadora/
├── backend/                 # 🔧 Servidor Node.js + Express
│   ├── config/             # Configuración de base de datos
│   ├── controllers/        # Controladores de API
│   ├── middlewares/        # Middlewares personalizados
│   ├── models/            # Modelos de MongoDB
│   ├── utils/             # Utilidades del servidor
│   ├── server.js          # Punto de entrada del servidor
│   └── package.json       # Dependencias del backend
│
├── frontend/               # ⚛️ Aplicación React + TypeScript
│   ├── src/               # Código fuente del frontend
│   ├── public/            # Archivos estáticos
│   ├── package.json       # Dependencias del frontend
│   └── tsconfig.json      # Configuración TypeScript
│
└── README.md              # Este archivo
```

## 🚀 Cómo ejecutar el proyecto

### Backend (Puerto 5001)
```bash
cd backend
npm install
npm start
```

### Frontend (Puerto 3000)
```bash
cd frontend
npm install
npm start
```

## 🛠️ Tecnologías

### Backend
- **Node.js** + Express.js
- **MongoDB** con Mongoose
- **JWT** para autenticación

### Frontend
- **React 19** + TypeScript
- **TailwindCSS** para estilos
- **Zustand** para manejo de estado
- **React Router** para navegación

## ✅ Proyecto Reorganizado

La estructura del proyecto ha sido completamente reorganizada para separar claramente:

- **Backend**: Todo el código del servidor en la carpeta `backend/`
- **Frontend**: Todo el código del cliente en la carpeta `frontend/`

Esta organización elimina la confusión de archivos mezclados y permite un desarrollo más limpio y mantenible. 