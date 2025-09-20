# LunaGuard - Sistema de Seguridad Vehicular

## Descripción General

LunaGuard es una aplicación web y móvil desarrollada con React, TypeScript y Supabase que permite a los usuarios monitorear y controlar la seguridad de sus vehículos de forma remota. El sistema utiliza comunicación MQTT para enviar comandos en tiempo real a los dispositivos instalados en los vehículos.

## Arquitectura del Sistema

### Frontend
- **Framework**: React 18 con TypeScript
- **Estilos**: Tailwind CSS con sistema de diseño personalizado
- **UI Components**: Radix UI (shadcn/ui)
- **Navegación**: React Router DOM
- **Estado**: React Hooks personalizados
- **Capacitor**: Para funcionalidades móviles nativas

### Backend
- **Base de Datos**: Supabase PostgreSQL
- **Autenticación**: Supabase Auth
- **API**: Supabase REST API
- **Tiempo Real**: Supabase Realtime
- **Edge Functions**: Deno para lógica servidor

### Comunicación IoT
- **Protocolo**: MQTT para comunicación con dispositivos vehiculares
- **Comandos**: Lock/Unlock, Power On/Off, Panic Mode

## Estructura de Usuarios y Roles

### Roles del Sistema

#### Usuario Regular (`user`)
- Acceso limitado a sus propios vehículos
- Puede controlar dispositivos de seguridad
- Ve su historial de eventos
- Gestiona su perfil personal

#### Administrador (`admin`)
- Acceso completo al sistema
- Gestiona todos los usuarios y vehículos
- Ve estadísticas globales
- Puede crear, editar y eliminar usuarios
- Asigna vehículos a usuarios

### Flujo de Registro de Usuarios

1. **Registro Inicial**
   - El administrador crea nuevos usuarios desde el panel administrativo
   - Se requiere: email, contraseña, nombre, apellido y rol
   - Se crea automáticamente un perfil en la tabla `profiles`
   - El usuario recibe credenciales para acceder al sistema

2. **Activación de Cuenta**
   - Los usuarios reciben un email de confirmación (opcional, configurable)
   - Pueden acceder inmediatamente si la confirmación está deshabilitada

## Sistema de Autenticación

### Flujo de Login

1. **Acceso a la Aplicación**
   - Usuario ingresa email y contraseña
   - Sistema valida credenciales con Supabase Auth
   - Se crea una sesión autenticada

2. **Redirección por Rol**
   - **Usuarios regulares**: Acceden a la interfaz móvil optimizada
   - **Administradores**: Son redirigidos automáticamente al panel de administración

3. **Persistencia de Sesión**
   - Las sesiones se almacenan en `sessionStorage`
   - **No son persistentes**: Se pierden al cerrar la aplicación
   - Auto-logout configurable por inactividad (por defecto 5 segundos sin foco)

### Flujo de Logout

1. **Logout Manual**
   - Usuario selecciona "Cerrar Sesión"
   - Se invalida la sesión en Supabase
   - Redirección a pantalla de login

2. **Auto-Logout**
   - Se activa cuando la aplicación pierde el foco por tiempo configurado
   - Tiempo configurable desde la configuración (por defecto 5 segundos)
   - Puede ser deshabilitado por el usuario

## Gestión de Vehículos

### Registro de Vehículos

1. **Creación por Administrador**
   - Acceso desde el panel de administración
   - Información requerida:
     - Modelo del vehículo
     - Placa/matrícula
     - Color
     - Año de fabricación
     - Tipo de combustible
     - VIN (Número de identificación vehicular)
     - Motor
     - Kilometraje inicial

2. **Asignación a Usuario**
   - El administrador puede asignar vehículos a usuarios específicos
   - Un vehículo solo puede estar asignado a un usuario a la vez
   - Los usuarios solo ven los vehículos asignados a ellos

### Modificación de Vehículos

- **Usuarios**: Pueden actualizar información básica de sus vehículos asignados
- **Administradores**: Acceso completo para editar cualquier vehículo
- Campos editables: modelo, color, kilometraje, información de motor

## Control de Dispositivos Vehiculares

### Sistema MQTT

El sistema utiliza MQTT para comunicación en tiempo real con los dispositivos instalados en los vehículos.

#### Estados del Dispositivo

- **Locked/Unlocked**: Estado del sistema de bloqueo
- **Power On/Off**: Estado del sistema eléctrico
- **Panic Mode**: Modo de emergencia
- **Connection Status**: Estado de conexión MQTT
- **Last Command**: Último comando ejecutado con timestamp

#### Comandos Disponibles

1. **Lock/Unlock**
   - Bloquea o desbloquea las puertas del vehículo
   - Respuesta inmediata del dispositivo
   - Se registra el evento en el historial

2. **Power Control**
   - Conecta o desconecta el sistema eléctrico
   - Útil para prevenir uso no autorizado
   - Registro completo de la acción

3. **Panic Mode**
   - Activa/desactiva modo de emergencia
   - Puede activar alarmas, luces, etc.
   - Prioridad alta en el sistema

### Flujo de Control

1. **Solicitud de Acción**
   - Usuario presiona botón de control en la interfaz
   - Sistema valida permisos del usuario
   - Se muestra estado de "procesando"

2. **Envío de Comando**
   - Comando se envía vía MQTT al dispositivo
   - Sistema espera confirmación del dispositivo
   - Timeout de 30 segundos para la respuesta

3. **Confirmación y Registro**
   - Dispositivo confirma ejecución del comando
   - Se actualiza el estado en tiempo real
   - Se registra el evento en el historial
   - Usuario recibe notificación de confirmación

## Sistema de Eventos y Notificaciones

### Registro de Eventos

Todos las acciones importantes se registran en la tabla `vehicle_events`:

#### Tipos de Eventos

- **Seguridad**: Lock/unlock, panic mode
- **Vehículo**: Power on/off, cambios de estado
- **Sistema**: Login, logout, errores de conexión

#### Severidad de Eventos

- **Low**: Acciones rutinarias (lock/unlock normal)
- **Medium**: Cambios importantes (power off)
- **High**: Emergencias (panic mode, errores críticos)

#### Información Registrada

- Usuario que ejecuta la acción
- Vehículo afectado
- Tipo y descripción del evento
- Timestamp preciso
- Datos adicionales en JSON
- Categoría y severidad

### Sistema de Notificaciones Push

1. **Creación de Notificaciones**
   - Se generan automáticamente para eventos importantes
   - Los administradores pueden crear notificaciones manuales
   - Se almacenan en la tabla `push_notifications`

2. **Entrega al Usuario**
   - Notificaciones se muestran en la interfaz
   - Soporte para diferentes tipos (sistema, vehículo, seguridad)
   - Estados: no leída/leída

3. **Gestión de Notificaciones**
   - Los usuarios pueden marcar como leídas
   - Eliminación automática después de cierto tiempo
   - Filtrado por tipo e importancia

## Panel de Administración

### Dashboard Principal

Proporciona una vista general del sistema:

#### Estadísticas Clave
- Número total de usuarios registrados
- Cantidad de vehículos en el sistema
- Usuarios activos recientes
- Actividades recientes del sistema

#### Actividades Recientes
- Últimos logins de usuarios
- Eventos de vehículos recientes
- Registro de nuevos usuarios/vehículos
- Alertas del sistema

### Gestión de Usuarios

1. **Lista de Usuarios**
   - Vista de todos los usuarios registrados
   - Información: nombre, email, rol, estado
   - Filtros por rol y estado

2. **Creación de Usuarios**
   - Formulario para nuevos usuarios
   - Validación de emails únicos
   - Asignación inicial de rol

3. **Edición de Usuarios**
   - Modificación de información personal
   - Cambio de roles
   - Activación/desactivación de cuentas

4. **Eliminación de Usuarios**
   - Confirmación requerida
   - Se mantiene historial de eventos
   - Reasignación de vehículos si es necesario

### Gestión de Vehículos

1. **Inventario Completo**
   - Lista de todos los vehículos registrados
   - Estado de asignación a usuarios
   - Información técnica completa

2. **Asignación a Usuarios**
   - Vinculación de vehículos con usuarios
   - Historial de asignaciones previas
   - Reasignación cuando sea necesario

3. **Mantenimiento de Información**
   - Actualización de datos técnicos
   - Registro de mantenimientos
   - Control de kilometraje

## Interfaz de Usuario Móvil

### Dashboard Principal

Interfaz optimizada para dispositivos móviles:

#### Información Personal
- Saludo personalizado con nombre del usuario
- Estado de sincronización del sistema
- Hora actual y fecha

#### Información del Vehículo
- Modelo, placa y color del vehículo asignado
- Kilometraje actual
- Estado general del sistema

#### Controles Rápidos
- Botones grandes para lock/unlock
- Control de power on/off
- Acceso rápido al modo pánico

#### Estados del Sistema
- Indicador de conexión MQTT
- Estado del dispositivo vehicular
- Último comando ejecutado

### Navegación por Pestañas

1. **Dashboard**: Vista principal con controles
2. **Seguridad**: Historial de eventos de seguridad
3. **Perfil**: Información personal y configuración
4. **Notificaciones**: Centro de mensajes y alertas

## Configuración del Sistema

### Configuraciones Globales

- **Auto-logout**: Tiempo de inactividad antes del cierre automático
- **Confirmación de Email**: Requerimiento de verificación por email
- **Timeouts MQTT**: Tiempos de espera para comandos
- **Notificaciones**: Tipos de eventos que generan notificaciones

### Configuraciones por Usuario

- **Preferencias de Notificaciones**: Tipos de alertas deseadas
- **Auto-logout Personal**: Habilitación/deshabilitación individual
- **Información de Contacto**: Teléfono y dirección opcionales
- **Avatar**: Imagen de perfil personalizada

## Seguridad del Sistema

### Autenticación y Autorización

1. **Row Level Security (RLS)**
   - Políticas a nivel de base de datos
   - Los usuarios solo acceden a sus propios datos
   - Administradores tienen acceso global controlado

2. **Validación de Sesiones**
   - Tokens JWT con expiración automática
   - Verificación en cada solicitud
   - Invalidación automática por inactividad

3. **Permisos por Rol**
   - Separación clara entre usuarios y administradores
   - Acceso granular a funcionalidades
   - Prevención de escalación de privilegios

### Comunicación MQTT

1. **Autenticación del Dispositivo**
   - Credenciales únicas por vehículo
   - Certificados para comunicación segura
   - Validación de comandos por usuario autorizado

2. **Encriptación**
   - Comunicación TLS/SSL
   - Mensajes encriptados end-to-end
   - Verificación de integridad de comandos

## Monitoreo y Logs

### Sistema de Eventos

Registro completo de todas las actividades:

- **Eventos de Usuario**: Login, logout, acciones realizadas
- **Eventos de Dispositivo**: Cambios de estado, respuestas a comandos
- **Eventos del Sistema**: Errores, conexiones/desconexiones

### Análisis y Reportes

- **Estadísticas de Uso**: Frecuencia de comandos por usuario
- **Disponibilidad del Sistema**: Uptime de conexiones MQTT
- **Patrones de Actividad**: Horarios de mayor uso
- **Detección de Anomalías**: Actividad sospechosa o inusual

## Consideraciones Técnicas

### Escalabilidad

- **Base de Datos**: Optimizada para crecimiento de usuarios y eventos
- **MQTT**: Soporte para múltiples dispositivos concurrentes
- **API**: Rate limiting y cache para mejor rendimiento

### Mantenimiento

- **Actualizaciones**: Sistema versionado para actualizaciones graduales
- **Backups**: Respaldos automáticos de datos críticos
- **Monitoreo**: Alertas proactivas de problemas del sistema

### Compatibilidad

- **Navegadores**: Soporte para Chrome, Firefox, Safari, Edge
- **Móviles**: Responsive design para iOS y Android
- **Dispositivos**: Compatibilidad con hardware IoT estándar

## Flujos de Trabajo Típicos

### Usuario Regular - Día Típico

1. **Acceso Matutino**
   - Login en la aplicación
   - Revisión del estado del vehículo
   - Verificación de notificaciones

2. **Durante el Día**
   - Control remoto según necesidades
   - Monitoreo de estado en tiempo real
   - Recepción de alertas automáticas

3. **Cierre de Sesión**
   - Auto-logout por inactividad
   - O logout manual al terminar uso

### Administrador - Gestión Semanal

1. **Revisión de Sistema**
   - Check de estadísticas generales
   - Análisis de eventos recientes
   - Identificación de problemas

2. **Gestión de Usuarios**
   - Creación de nuevos usuarios
   - Actualización de permisos
   - Resolución de problemas de acceso

3. **Mantenimiento de Vehículos**
   - Registro de nuevos vehículos
   - Actualización de asignaciones
   - Verificación de estados de conexión

## Soporte y Troubleshooting

### Problemas Comunes

1. **Conexión MQTT**
   - Verificar conectividad del dispositivo
   - Check de credenciales MQTT
   - Reinicio del dispositivo si es necesario

2. **Problemas de Autenticación**
   - Verificación de credenciales
   - Reset de contraseña si es necesario
   - Check de estado de la cuenta

3. **Sincronización de Estados**
   - Refresh manual del dashboard
   - Verificación de timestamps
   - Revisión de logs de eventos
