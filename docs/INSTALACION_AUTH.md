# 🚀 GUÍA DE INSTALACIÓN - SISTEMA DE AUTENTICACIÓN SEGURO

## ⚡ Instalación Rápida

### 1️⃣ Instalar Dependencias

```bash
# Backend
npm install

# Frontend
cd frontend
npm install
```

### 2️⃣ Configurar Base de Datos

```bash
# Ejecutar scripts SQL en orden:
sqlcmd -S localhost\SQLEXPRESS -d Autodata -i sql/11_crear_refresh_tokens_auditoria.sql
sqlcmd -S localhost\SQLEXPRESS -d Autodata -i sql/12_seed_usuarios_seguros.sql
```

### 3️⃣ Verificar Variables de Entorno

**Backend (.env):**
```env
DB_HOST=localhost
DB_INSTANCE=SQLEXPRESS
DB_USER=sa
DB_PASSWORD=Pancho12_
DB_DATABASE=Autodata
PORT=3000
NODE_ENV=development
JWT_SECRET=8003a23c19dd13dc576d17b7d25409977205e834787af55bf63ec9b63928e89919fd152ad172a00ff5a30515bc06fd67eeb0a0113ba7fcc23274bea42996252e
JWT_REFRESH_SECRET=523e7fb779b88fe89f6d22edd8765d90e9d08ebe9f20e9cd2a4cf22a45e1d418c4e08c2e81e02323fe903ef02455a073219f4a8475c4a92d596a3d787dd8fe58
```

**Frontend (frontend/.env):**
```env
VITE_API_URL=https://a49cfb82effe.ngrok-free.app/api
```

### 4️⃣ Iniciar Servidores

```bash
# Terminal 1 - Backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

---

## 🔑 Credenciales de Acceso

| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| admin | Autodata9001_ | admin |
| santiago.martinez | Santiago2024$Secure | admin |
| claudio.bustillo | Claudio2024$Secure | entrada_datos |
| noel.capurro | Noel2024$Secure | revision |

---

## ✅ Verificación Post-Instalación

### 1. Verificar que los usuarios se crearon:
```sql
SELECT UsuarioID, Username, Nombre, Rol, Activo FROM Usuario;
```

### 2. Verificar las tablas de seguridad:
```sql
SELECT name FROM sys.tables WHERE name IN ('RefreshToken', 'AuditoriaAcceso');
```

### 3. Probar login desde el frontend:
- Ir a http://localhost:3001/login
- Usar usuario: `admin`, contraseña: `Autodata9001_`
- Verificar que redirige al dashboard

### 4. Verificar auditoría:
```sql
SELECT TOP 10 * FROM AuditoriaAcceso ORDER BY FechaHora DESC;
```

---

## 🔧 Solución de Problemas

### Error: "Usuario y contraseña requeridos"
- Verificar que estás enviando los campos correctos
- Abrir DevTools > Network para ver el request

### Error: "Credenciales inválidas"
- Verificar que el usuario existe en la BD
- Verificar que el hash de contraseña sea correcto
- Revisar tabla AuditoriaAcceso para detalles

### Error: "Demasiados intentos de login"
- Esperar 15 minutos
- El rate limiter está funcionando correctamente

### Error: "Token inválido o expirado"
- El token dura 15 minutos
- El sistema debería auto-refrescar
- Verificar que el refresh token esté guardado

### Frontend no conecta con Backend
- Verificar VITE_API_URL en frontend/.env
- Verificar que el backend esté corriendo en el puerto correcto
- Verificar ngrok si lo estás usando

---

## 📊 Comandos Útiles

### Ver logs del backend en tiempo real:
```bash
Get-Content .\logs\combined.log -Tail 50 -Wait
```

### Limpiar tokens expirados manualmente:
```sql
EXEC sp_LimpiarTokensExpirados;
```

### Ver intentos de login fallidos:
```sql
SELECT * FROM vw_LoginsFallidos;
```

### Ver historial de un usuario:
```sql
EXEC sp_ObtenerHistorialAccesos @Username = 'admin', @Dias = 7;
```

---

## 🎯 Próximos Pasos

1. Iniciar sesión con cada usuario para verificar funcionamiento
2. Probar el cambio de contraseña
3. Verificar que el refresh token funcione dejando la sesión abierta > 15 min
4. Revisar los logs de auditoría

---

**Sistema implementado:** 1 de Febrero, 2026  
**Estado:** ✅ Listo para uso en desarrollo
