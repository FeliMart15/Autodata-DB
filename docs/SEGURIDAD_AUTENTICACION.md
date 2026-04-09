# 🔒 SISTEMA DE AUTENTICACIÓN SEGURO - AUTODATA

## 📅 Fecha de Implementación: 1 de Febrero, 2026

---

## ✅ Mejoras de Seguridad Implementadas

### 1. **Protección contra SQL Injection**
- ✅ Eliminado uso de concatenación de strings en queries SQL
- ✅ Implementados queries parametrizados en todos los endpoints de autenticación
- ✅ Validación de entrada con regex para nombres de usuario

### 2. **JWT Secrets Robustos**
- ✅ Generados secrets de 128 caracteres hexadecimales usando crypto.randomBytes
- ✅ JWT_SECRET: Para access tokens (15 minutos de duración)
- ✅ JWT_REFRESH_SECRET: Para refresh tokens (7 días de duración)
- ✅ Access tokens de corta duración (15 min) para minimizar ventana de exposición

### 3. **Sistema de Refresh Tokens**
- ✅ Implementado sistema de refresh tokens con rotación
- ✅ Tokens almacenados en base de datos con tracking de dispositivo e IP
- ✅ Revocación automática al cambiar contraseña
- ✅ Limpieza automática de tokens expirados mediante stored procedure

### 4. **Rate Limiting**
- ✅ Login: Máximo 5 intentos cada 15 minutos por usuario/IP
- ✅ API General: Máximo 100 requests cada 15 minutos por IP
- ✅ Operaciones sensibles: Máximo 3 intentos por hora

### 5. **Auditoría de Accesos**
- ✅ Tabla AuditoriaAcceso con registro completo de eventos
- ✅ Tracking de: login exitoso/fallido, logout, refresh tokens, cambios de password
- ✅ Registro de IP, User-Agent, timestamps
- ✅ Vista de logins fallidos para detectar intentos de ataque
- ✅ Stored procedures para consultas optimizadas

### 6. **Contraseñas Seguras**
- ✅ Bcrypt con 12 rounds (más seguro que 10)
- ✅ Validación de complejidad en cambio de contraseña
- ✅ Hashes reales generados para todos los usuarios

### 7. **Validación de Entrada**
- ✅ Validación de formato de username (alfanumérico, punto, guión)
- ✅ Validación de presencia y tipo de datos
- ✅ Sanitización de entrada en todos los endpoints

### 8. **Mejoras en Middleware de Autenticación**
- ✅ Verificación adicional del estado activo del usuario en cada request
- ✅ Códigos de error específicos (TOKEN_EXPIRED, TOKEN_INVALID)
- ✅ Logging detallado de intentos fallidos
- ✅ Helpers para roles (requireAdmin, requireAdminOrAprobacion)

### 9. **Frontend Seguro**
- ✅ Manejo automático de refresh tokens
- ✅ Cola de peticiones durante refresh para evitar race conditions
- ✅ Limpieza de tokens en localStorage al logout
- ✅ Redirección automática al login cuando expiran tokens

### 10. **Configuración de Producción**
- ✅ Límite de payload (10MB) para prevenir DoS
- ✅ Header X-Powered-By deshabilitado
- ✅ Mensajes de error genéricos en producción (sin stack traces)
- ✅ Logging de IPs en todos los eventos de seguridad

---

## 👥 Usuarios del Sistema

### Usuario Administrador Principal
- **Usuario:** `admin`
- **Contraseña:** `Autodata9001_`
- **Rol:** admin
- **Email:** admin@autodata.com

### Usuario Administrador - Santiago
- **Usuario:** `santiago.martinez`
- **Contraseña:** `Santiago2024$Secure`
- **Rol:** admin
- **Email:** santiago.martinez@autodata.com

### Usuario Entrada de Datos - Claudio
- **Usuario:** `claudio.bustillo`
- **Contraseña:** `Claudio2024$Secure`
- **Rol:** entrada_datos
- **Email:** claudio.bustillo@autodata.com

### Usuario Revisión - Noel
- **Usuario:** `noel.capurro`
- **Contraseña:** `Noel2024$Secure`
- **Rol:** revision
- **Email:** noel.capurro@autodata.com

---

## 🗂️ Estructura de Base de Datos

### Tabla: Usuario
- UsuarioID, Username, Password (bcrypt hash), Nombre, Email, Rol, Activo
- Índices en Username, Email, Rol para performance
- Constraint CHECK para roles válidos

### Tabla: RefreshToken
- Almacena tokens de refresco con expiración
- Tracking de dispositivo, IP, fecha de creación
- Sistema de revocación y reemplazo de tokens
- Foreign key con Usuario (CASCADE on delete)

### Tabla: AuditoriaAcceso
- Registro completo de eventos de autenticación
- Campos: Usuario, Acción, Fecha/Hora, IP, UserAgent, Exitoso, Error
- Índices optimizados para consultas de auditoría
- Relación con Usuario (SET NULL on delete)

### Stored Procedures
- `sp_RegistrarAcceso`: Registra eventos de auditoría
- `sp_LimpiarTokensExpirados`: Limpia tokens viejos/revocados
- `sp_ObtenerHistorialAccesos`: Obtiene historial de un usuario

### Vistas
- `vw_LoginsFallidos`: Detecta intentos de ataque (3+ fallos en 24h)

---

## 📋 Scripts de Instalación

Ejecutar en orden:

```bash
# 1. Crear tablas de seguridad
sqlcmd -S localhost\SQLEXPRESS -d Autodata -i sql/11_crear_refresh_tokens_auditoria.sql

# 2. Insertar usuarios con contraseñas reales
sqlcmd -S localhost\SQLEXPRESS -d Autodata -i sql/12_seed_usuarios_seguros.sql
```

---

## 🔐 Configuración de Variables de Entorno

### Backend (.env)
```env
# Database
DB_HOST=localhost
DB_INSTANCE=SQLEXPRESS
DB_USER=sa
DB_PASSWORD=Pancho12_
DB_DATABASE=Autodata

# Server
PORT=3000
NODE_ENV=development

# JWT Secrets (NUNCA compartir o commitear a git)
JWT_SECRET=8003a23c19dd13dc576d17b7d25409977205e834787af55bf63ec9b63928e89919fd152ad172a00ff5a30515bc06fd67eeb0a0113ba7fcc23274bea42996252e
JWT_REFRESH_SECRET=523e7fb779b88fe89f6d22edd8765d90e9d08ebe9f20e9cd2a4cf22a45e1d418c4e08c2e81e02323fe903ef02455a073219f4a8475c4a92d596a3d787dd8fe58
```

### Frontend (frontend/.env)
```env
VITE_API_URL=https://a49cfb82effe.ngrok-free.app/api
```

---

## 🚀 Flujo de Autenticación

### Login
1. Usuario envía credenciales a `/api/auth/login`
2. Rate limiter verifica intentos (max 5 cada 15 min)
3. Backend valida formato de entrada
4. Busca usuario con query parametrizado (protección SQL injection)
5. Verifica contraseña con bcrypt.compare
6. Genera access token (15 min) y refresh token (7 días)
7. Guarda refresh token en BD con metadata (IP, dispositivo)
8. Registra evento en auditoría
9. Retorna tokens y datos de usuario

### Refresh Token
1. Access token expira después de 15 minutos
2. Frontend detecta código TOKEN_EXPIRED
3. Automáticamente llama a `/api/auth/refresh`
4. Backend valida refresh token en BD
5. Genera nuevo access token y refresh token
6. Revoca token anterior (rotación)
7. Frontend reintenta request original con nuevo token

### Logout
1. Usuario cierra sesión
2. Frontend envía refresh token a `/api/auth/logout`
3. Backend revoca el refresh token
4. Registra evento en auditoría
5. Frontend limpia localStorage

---

## 🛡️ Protecciones Implementadas

| Amenaza | Protección |
|---------|-----------|
| SQL Injection | Queries parametrizados |
| Brute Force | Rate limiting (5 intentos/15 min) |
| Token Theft | Tokens de corta duración + refresh rotation |
| Session Hijacking | Tracking de IP y dispositivo |
| XSS | Headers seguros, validación de entrada |
| CSRF | Tokens en headers (no cookies) |
| DoS | Rate limiting + payload size limit (10MB) |
| Enumeration | Mensajes genéricos de error |
| Weak Passwords | Bcrypt 12 rounds + validación complejidad |

---

## 📊 Monitoreo y Auditoría

### Consultar Intentos Fallidos Recientes
```sql
SELECT * FROM vw_LoginsFallidos;
```

### Historial de Accesos de un Usuario
```sql
EXEC sp_ObtenerHistorialAccesos @Username = 'admin', @Dias = 30, @Top = 50;
```

### Limpiar Tokens Expirados (ejecutar diariamente)
```sql
EXEC sp_LimpiarTokensExpirados;
```

### Ver Todos los Intentos Fallidos de Hoy
```sql
SELECT 
    Username, 
    IpAddress, 
    FechaHora, 
    MensajeError
FROM AuditoriaAcceso
WHERE Accion = 'login_fallido'
  AND FechaHora >= CAST(GETDATE() AS DATE)
ORDER BY FechaHora DESC;
```

---

## ⚙️ Endpoints de Autenticación

### POST /api/auth/login
**Rate Limit:** 5 intentos cada 15 minutos por usuario/IP

**Request:**
```json
{
  "username": "admin",
  "password": "Autodata9001_"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login exitoso",
  "token": "eyJhbGc...",
  "refreshToken": "a1b2c3d4...",
  "user": {
    "id": 1,
    "username": "admin",
    "nombre": "Administrador del Sistema",
    "email": "admin@autodata.com",
    "rol": "admin"
  }
}
```

### POST /api/auth/refresh
**Request:**
```json
{
  "refreshToken": "a1b2c3d4..."
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "refreshToken": "e5f6g7h8..."
}
```

### GET /api/auth/me
**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "admin",
    "nombre": "Administrador del Sistema",
    "email": "admin@autodata.com",
    "rol": "admin",
    "fechaCreacion": "2026-02-01T...",
    "fechaUltimoAcceso": "2026-02-01T..."
  }
}
```

### POST /api/auth/logout
**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "refreshToken": "a1b2c3d4..."
}
```

### POST /api/auth/change-password
**Headers:** `Authorization: Bearer <token>`
**Rate Limit:** 3 intentos por hora

**Request:**
```json
{
  "oldPassword": "contraseña_actual",
  "newPassword": "nueva_contraseña_segura"
}
```

---

## 🎯 Roles y Permisos

### admin
- Acceso completo a todas las funcionalidades
- Puede gestionar usuarios (futuro)
- Aprobación final de datos

### aprobacion
- Aprobar modelos en estado `revision_equipamiento`
- Mover modelos a estado `definitivo`
- Rechazar y devolver a corrección

### revision
- Revisar datos mínimos y equipamiento
- Aprobar o rechazar para corrección
- No puede aprobar definitivamente

### entrada_datos
- Cargar y editar modelos en estados iniciales
- No puede aprobar ni revisar

---

## 🔧 Mantenimiento

### Tareas Programadas Recomendadas

1. **Diario:** Limpiar tokens expirados
   ```sql
   EXEC sp_LimpiarTokensExpirados;
   ```

2. **Semanal:** Revisar intentos de login fallidos
   ```sql
   SELECT * FROM vw_LoginsFallidos;
   ```

3. **Mensual:** Archivar registros de auditoría antiguos (>90 días)

### Rotación de JWT Secrets

Para producción, se recomienda rotar los JWT secrets cada 3-6 meses:

1. Generar nuevos secrets con el script:
   ```bash
   node scripts/generate-secure-credentials.js
   ```

2. Actualizar .env con los nuevos secrets
3. Reiniciar servidor
4. Los usuarios deberán volver a iniciar sesión

---

## 🚨 Respuesta a Incidentes

### Si se detecta compromiso de cuenta:

1. **Deshabilitar usuario:**
   ```sql
   UPDATE Usuario SET Activo = 0 WHERE Username = 'usuario_comprometido';
   ```

2. **Revocar todos sus tokens:**
   ```sql
   UPDATE RefreshToken 
   SET IsRevoked = 1, RevokedAt = GETDATE() 
   WHERE UsuarioID = (SELECT UsuarioID FROM Usuario WHERE Username = 'usuario_comprometido');
   ```

3. **Revisar auditoría:**
   ```sql
   EXEC sp_ObtenerHistorialAccesos @Username = 'usuario_comprometido', @Dias = 90;
   ```

### Si se detecta múltiples intentos fallidos:

1. Verificar IP sospechosa en `vw_LoginsFallidos`
2. Considerar bloqueo temporal o permanente de IP
3. Notificar al usuario afectado

---

## 📝 Checklist de Seguridad

- [x] SQL Injection Protection
- [x] Strong JWT Secrets (128 chars)
- [x] Password Hashing (bcrypt 12 rounds)
- [x] Rate Limiting
- [x] Refresh Token System
- [x] Access Audit Logging
- [x] Input Validation
- [x] Token Rotation
- [x] Short-lived Access Tokens (15 min)
- [x] User Enumeration Prevention
- [x] Error Message Sanitization
- [x] Payload Size Limits
- [x] CORS Configuration
- [ ] HTTPS en producción (pendiente)
- [ ] Helmet.js headers de seguridad (recomendado)
- [ ] 2FA (autenticación de dos factores - futuro)

---

## 📌 Notas Importantes

1. **Los JWT secrets NUNCA deben commitearse a Git**
   - Agregar .env a .gitignore
   - Usar variables de entorno en producción

2. **Contraseñas iniciales deben cambiarse**
   - Especialmente en producción
   - Implementar política de cambio periódico

3. **Monitorear la tabla de auditoría**
   - Revisar regularmente intentos fallidos
   - Configurar alertas para actividad sospechosa

4. **Backup de tokens**
   - La tabla RefreshToken contiene tokens activos
   - Incluir en backups pero proteger acceso

5. **Performance**
   - Índices creados en todas las tablas
   - Limpieza regular de tokens expirados
   - Considerar archivado de auditoría antigua

---

## 🔄 Próximos Pasos Recomendados

1. **Implementar HTTPS en producción**
2. **Agregar Helmet.js para headers de seguridad**
3. **Implementar gestión de usuarios (CRUD) solo para admins**
4. **Configurar alertas de seguridad (email/SMS)**
5. **Implementar 2FA para usuarios admin**
6. **Política de expiración de contraseñas**
7. **Bloqueo automático de cuenta tras X intentos fallidos**
8. **Whitelist de IPs para acceso admin (opcional)**

---

## 📞 Soporte

Para problemas de autenticación:
1. Verificar logs en `logs/combined.log` y `logs/error.log`
2. Revisar tabla AuditoriaAcceso
3. Verificar que las variables de entorno estén correctas
4. Confirmar que los scripts SQL se ejecutaron correctamente

---

**Última actualización:** 1 de Febrero, 2026
**Versión del sistema:** 2.0 (Sistema de Autenticación Seguro)
