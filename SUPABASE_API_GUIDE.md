# Guía de Integración API con Supabase Car-Guard

Esta guía explica cómo integrar tu API externa con el sistema Supabase de Car-Guard para validar usuarios, vehículos y permisos.

## Configuración Inicial

### Variables de Entorno
```bash
SUPABASE_URL=https://vnwefdkejobzkszssmge.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZud2VmZGtlam9iemtzenNzbWdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNzY4MjEsImV4cCI6MjA3MDg1MjgyMX0.dzoHmRoFIDH7lkX8Fx8A_xZjqhPXVzphNgoNOHaUVfU
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
```

## Autenticación y Validación de Usuarios

### 1. Validar Token de Usuario

```bash
# Verificar si un token es válido
curl -X GET "${SUPABASE_URL}/auth/v1/user" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${USER_ACCESS_TOKEN}"
```

**Respuesta exitosa:**
```json
{
  "id": "f393e3e8-0882-4c7c-b6e7-868a4f38123c",
  "email": "usuario@example.com",
  "email_confirmed_at": "2025-01-15T10:30:00Z",
  "user_metadata": {
    "first_name": "Juan",
    "last_name": "Pérez"
  }
}
```

### 2. Obtener Perfil Completo del Usuario

```bash
# Obtener perfil del usuario autenticado
curl -X GET "${SUPABASE_URL}/rest/v1/profiles?user_id=eq.${USER_ID}&select=*" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${USER_ACCESS_TOKEN}"
```

**Respuesta:**
```json
[
  {
    "id": "uuid",
    "user_id": "f393e3e8-0882-4c7c-b6e7-868a4f38123c",
    "email": "usuario@example.com",
    "first_name": "Juan",
    "last_name": "Pérez",
    "role": "user",
    "phone": "+1234567890",
    "address": "Dirección del usuario",
    "avatar_url": null,
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-01-15T10:30:00Z"
  }
]
```

## Gestión de Vehículos

### 3. Obtener Vehículos del Usuario

```bash
# Listar vehículos del usuario autenticado
curl -X GET "${SUPABASE_URL}/rest/v1/vehicles?user_id=eq.${USER_ID}&select=*" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${USER_ACCESS_TOKEN}"
```

### 4. Validar Propietario de Vehículo

```bash
# Verificar si un usuario es propietario de un vehículo específico
curl -X GET "${SUPABASE_URL}/rest/v1/vehicles?id=eq.${VEHICLE_ID}&user_id=eq.${USER_ID}&select=id,user_id,model,plate" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${USER_ACCESS_TOKEN}"
```

**Respuesta si es propietario:**
```json
[
  {
    "id": "vehicle-uuid",
    "user_id": "user-uuid",
    "model": "Toyota Corolla",
    "plate": "ABC123"
  }
]
```

**Respuesta si NO es propietario:**
```json
[]
```

### 5. Crear/Actualizar Vehículo (Solo Propietario)

```bash
# Agregar nuevo vehículo
curl -X POST "${SUPABASE_URL}/rest/v1/vehicles" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${USER_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Honda Civic",
    "plate": "XYZ789",
    "color": "Azul",
    "year": 2023,
    "engine": "1.5L Turbo",
    "fuel_type": "gasolina",
    "mileage": 15000,
    "vin": "1HGBH41JXMN109186"
  }'
```

## Validaciones para Administradores

### 6. Verificar Rol de Administrador

Para operaciones que requieren permisos de administrador:

```bash
# Verificar si el usuario tiene rol de admin
curl -X GET "${SUPABASE_URL}/rest/v1/profiles?user_id=eq.${USER_ID}&role=eq.admin&select=role" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${USER_ACCESS_TOKEN}"
```

### 7. Operaciones de Admin - Ver Todos los Vehículos

```bash
# Solo admins pueden ver todos los vehículos (usando service role key)
curl -X GET "${SUPABASE_URL}/rest/v1/vehicles?select=*" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}"
```

## Sistema de Notificaciones

### 8. Crear Notificación para Usuario

```bash
# Crear notificación (requiere service role para INSERT)
curl -X POST "${SUPABASE_URL}/rest/v1/push_notifications" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user-uuid",
    "title": "Alerta de Seguridad",
    "message": "Se detectó movimiento inusual en tu vehículo",
    "type": "alert",
    "data": {
      "vehicle_id": "vehicle-uuid",
      "alert_type": "movement",
      "timestamp": "2025-01-15T15:30:00Z"
    }
  }'
```

### 9. Obtener Notificaciones del Usuario

```bash
# El usuario puede ver sus propias notificaciones
curl -X GET "${SUPABASE_URL}/rest/v1/push_notifications?user_id=eq.${USER_ID}&order=created_at.desc&select=*" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${USER_ACCESS_TOKEN}"
```

## Funciones Útiles para Validación

### 10. Función para Verificar Propiedad de Vehículo

```sql
-- Esta función ya está en tu base de datos
SELECT public.user_owns_vehicle('user-uuid', 'vehicle-uuid');
```

```bash
# Llamar función vía RPC
curl -X POST "${SUPABASE_URL}/rest/v1/rpc/user_owns_vehicle" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${USER_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user-uuid",
    "vehicle_id": "vehicle-uuid"
  }'
```

## Códigos de Estado y Manejo de Errores

### Códigos Comunes:
- **200**: Operación exitosa
- **201**: Recurso creado exitosamente
- **400**: Solicitud mal formada
- **401**: Token inválido o expirado
- **403**: Sin permisos (RLS)
- **404**: Recurso no encontrado
- **406**: Violación de políticas RLS

### Ejemplo de Error de Autenticación:
```json
{
  "code": "invalid_token",
  "message": "JWT expired",
  "details": null,
  "hint": null
}
```

### Ejemplo de Error de Permisos:
```json
{
  "code": "42501",
  "message": "new row violates row-level security policy",
  "details": null,
  "hint": null
}
```

## Casos de Uso Comunes

### Caso 1: Validar Acción en Vehículo
```bash
# 1. Verificar que el usuario existe y está autenticado
# 2. Verificar que el vehículo pertenece al usuario
# 3. Realizar la acción si las validaciones pasan

# Ejemplo completo:
USER_ID="f393e3e8-0882-4c7c-b6e7-868a4f38123c"
VEHICLE_ID="vehicle-uuid"

# Verificar propiedad
OWNERSHIP_CHECK=$(curl -s -X GET "${SUPABASE_URL}/rest/v1/vehicles?id=eq.${VEHICLE_ID}&user_id=eq.${USER_ID}&select=id" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${USER_ACCESS_TOKEN}")

if [ "$(echo $OWNERSHIP_CHECK | jq '. | length')" -gt 0 ]; then
  echo "Usuario autorizado para este vehículo"
  # Proceder con la acción
else
  echo "Usuario NO autorizado"
  # Rechazar la acción
fi
```

### Caso 2: Operación de Administrador
```bash
# Verificar rol de admin antes de permitir operación
ADMIN_CHECK=$(curl -s -X GET "${SUPABASE_URL}/rest/v1/profiles?user_id=eq.${USER_ID}&role=eq.admin&select=role" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${USER_ACCESS_TOKEN}")

if [ "$(echo $ADMIN_CHECK | jq '. | length')" -gt 0 ]; then
  echo "Usuario es administrador"
  # Permitir operación de admin
else
  echo "Usuario NO es administrador"
  # Rechazar operación
fi
```

## Políticas RLS Activas

El sistema tiene las siguientes políticas de seguridad:

### Profiles:
- Los usuarios solo pueden ver/editar su propio perfil
- Solo pueden insertar su propio perfil durante registro

### Vehicles:
- Los usuarios solo pueden ver/editar/eliminar sus propios vehículos
- Solo pueden insertar vehículos asignándolos a su user_id

### Push_notifications:
- Los usuarios solo pueden ver sus propias notificaciones
- Solo pueden marcar como leídas sus propias notificaciones
- NO pueden insertar notificaciones (solo via service role)

## Tips de Implementación

1. **Siempre valida el token** antes de cualquier operación
2. **Usa RLS** - Las políticas ya previenen acceso no autorizado
3. **Service Role Key** solo para operaciones de sistema (crear notificaciones, operaciones de admin)
4. **User Access Token** para operaciones del usuario final
5. **Verifica permisos** específicos para operaciones críticas
6. **Maneja errores** apropiadamente según los códigos de estado

## Edge Functions para Gestión Avanzada

### 11. Crear Usuario sin Verificación de Email

Para casos donde necesitas crear usuarios con emails que no existen o no pueden ser verificados:

```bash
# Crear usuario bypaseando verificación de email
curl -X POST "${SUPABASE_URL}/functions/v1/create-user-bypass-email" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@dominio-inexistente.com",
    "password": "Password123!",
    "first_name": "Juan",
    "last_name": "Pérez",
    "role": "user"
  }'
```

**Parámetros:**
- `email` (requerido): Email del usuario (no necesita existir)
- `password` (opcional): Contraseña. Default: "TempPassword123!"
- `first_name` (opcional): Nombre del usuario
- `last_name` (opcional): Apellido del usuario  
- `role` (opcional): Rol del usuario ("user" o "admin"). Default: "user"

**Respuesta exitosa:**
```json
{
  "success": true,
  "user": {
    "id": "f393e3e8-0882-4c7c-b6e7-868a4f38123c",
    "email": "usuario@dominio-inexistente.com",
    "created_at": "2025-01-15T10:30:00Z"
  },
  "message": "Usuario creado exitosamente sin verificación de email"
}
```

**Casos de Uso:**
- Crear usuarios desde sistemas administrativos
- Migración de usuarios desde otros sistemas
- Cuentas corporativas con emails internos
- Testing y desarrollo

**Nota:** Esta función utiliza el service role key internamente y bypasea completamente la verificación de email. El usuario queda inmediatamente activo en el sistema.

## Ejemplo de Middleware de Validación

```javascript
// Ejemplo en Node.js/Express
const validateUserAndVehicle = async (req, res, next) => {
  const { vehicleId } = req.params;
  const userToken = req.headers.authorization?.replace('Bearer ', '');
  
  try {
    // Validar token
    const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${userToken}`
      }
    });
    
    if (!userResponse.ok) {
      return res.status(401).json({ error: 'Token inválido' });
    }
    
    const user = await userResponse.json();
    
    // Verificar propiedad del vehículo
    const vehicleResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/vehicles?id=eq.${vehicleId}&user_id=eq.${user.id}&select=id`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${userToken}`
        }
      }
    );
    
    const vehicles = await vehicleResponse.json();
    
    if (vehicles.length === 0) {
      return res.status(403).json({ error: 'No autorizado para este vehículo' });
    }
    
    req.user = user;
    req.vehicle = vehicles[0];
    next();
    
  } catch (error) {
    res.status(500).json({ error: 'Error de validación' });
  }
};
```

Esta guía te permitirá integrar completamente tu API externa con el sistema Supabase de Car-Guard manteniendo la seguridad y las validaciones apropiadas.