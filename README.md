# Gestor Suro API - Backend

Backend API para el Dashboard Gestor Suro que maneja la integración con Google Sheets API.

## 🚀 Deployment en VPS con EasyPanel

### Requisitos Previos
- VPS con EasyPanel instalado
- Node.js 18+ disponible
- Acceso a Google Sheets API

### Pasos de Deployment

#### 1. Crear Aplicación en EasyPanel
1. Ir a EasyPanel → Apps → Create App
2. Seleccionar "Node.js" como tipo
3. Nombre: `gestor-suro-api`
4. Puerto: `3000`

#### 2. Subir Archivos
Subir todos los archivos de la carpeta `backend/` a tu aplicación:
```
gestor-suro-api/
├── server.js
├── package.json
├── routes/
├── services/
├── middleware/
└── .env
```

#### 3. Configurar Variables de Entorno
En EasyPanel → Tu App → Environment Variables:

```bash
GOOGLE_SHEETS_API_KEY=AIzaSyDF1vWoFtewHVYRxkIN1-f523TaxHAK6kc
GOOGLE_SHEET_ID=1QCjfTgxQOgs5dXUniafhJyLfHOHa4Zj4s8D7MEbyaMk
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://gestor-suro-dashboard.vercel.app
CACHE_TTL=300
```

#### 4. Instalar Dependencias
En la terminal de EasyPanel:
```bash
npm install
```

#### 5. Iniciar Aplicación
```bash
npm start
```

### URL del API
Tu API estará disponible en: `https://tu-dominio.com/api/`

### Endpoints Disponibles

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/api/sheets/validate` | GET | Valida conexión Google Sheets |
| `/api/sheets/data` | GET | Obtiene datos de hoja |
| `/api/sheets/available` | GET | Lista pestañas disponibles |
| `/api/sheets/financial-config` | GET | Configuración financiera |
| `/api/cache/stats` | GET | Estadísticas de cache |
| `/api/cache/clear` | POST | Limpiar cache |

### Parámetros de Query

#### `/api/sheets/data`
- `range`: Rango de celdas (default: `A:Z`)
- `sheet`: Nombre de la pestaña (default: `Base`)

#### `/api/sheets/financial-config`
- `scenario`: Escenario a obtener (default: `Base`)

### Ejemplos de Uso

```bash
# Health check
curl https://tu-api.com/

# Validar conexión
curl https://tu-api.com/api/sheets/validate

# Obtener datos de Base
curl https://tu-api.com/api/sheets/data

# Obtener datos de Escenario1
curl https://tu-api.com/api/sheets/data?sheet=Escenario1

# Obtener configuración financiera
curl https://tu-api.com/api/sheets/financial-config?scenario=Base
```

### Logs y Debugging

El servidor incluye logging detallado:
- ✅ Requests entrantes
- 📊 Operaciones de Google Sheets
- 🚀 Cache hits/misses
- ❌ Errores con stack trace (solo en desarrollo)

### Seguridad

- **Helmet**: Headers de seguridad
- **CORS**: Configurado para frontend específico
- **Rate limiting**: Implementado via cache
- **Error handling**: Sin leak de información sensible

### Performance

- **Compression**: Gzip habilitado
- **Cache**: TTL configurable (default 5 minutos)
- **Memory monitoring**: Stats disponibles en `/api/cache/stats`

### Troubleshooting

#### Error: "Connection validation failed"
- Verificar `GOOGLE_SHEETS_API_KEY`
- Verificar `GOOGLE_SHEET_ID`
- Verificar permisos en Google Cloud Console

#### Error: "CORS blocked"
- Verificar `FRONTEND_URL` en variables de entorno
- Verificar dominio en lista de CORS

#### Error: "Port already in use"
- Cambiar `PORT` en variables de entorno
- Verificar que no hay otra aplicación en el mismo puerto