# Aplicación PWA en React para Control de Asistencia a Eventos

## Prompt Original (Deepseek)

> Necesito una aplicación en ReactJS PWA con capacidad de trabajar offline/online, para control de asistencia a eventos de personas.
> Tanto los Eventos como las Personas relacionadas a cada Evento ya se encuentran ingresados en el Sistema.
> Los Eventos tienen un nombre, descripción, fecha de realización y estado (abierto/cerrado).
> Las personas tienen: Nombre, Número de Credencial, DNI, Email.
> La aplicación en la home me presenta una lista de Eventos para registrar la asistencia de las Personas ya asignadas.
> Cuando seleccionamos un Evento y vamos a Registrar Asistencia, nos muestra el listado de personas posibles de marcarle la asistencia.
> Esas personas se pueden buscar por cualquiera de sus campos, y cuando se selecciona una, se puede marcar la Asistencia; esta acción queda registrada con el horario de realización.
> En el listado principal de Eventos se muestra un resumen de los Eventos con Cantidad total de Personas y Cantidad de Asistentes.

## Características Implementadas

### Funcionamiento Offline/Online

- Usa IndexedDB para almacenamiento local  
- Detecta cambios en la conexión  
- Sincroniza datos cuando vuelve a estar online  

### Registro de Asistencia

- Búsqueda por cualquier campo de persona  
- Marca asistencia con timestamp  
- Muestra resumen de asistencia  

### Listado de Eventos

- Muestra estado (abierto/cerrado)  
- Resumen con total de personas y asistentes  

### Progressive Web App

- Funciona offline  
- Puede instalarse en el dispositivo  
- Service Worker para caché de recursos  


## Características Clave de la API

### Autenticación (Opcional)

Puedes agregar JWT para proteger los endpoints:

```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ message: 'Acceso denegado' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Token inválido' });
  }
};
```

### Validación de Datos
Usa librerías como express-validator para validar los datos de entrada.

### Paginación
Implementa paginación en endpoints que devuelvan listas largas.

### Búsqueda Avanzada
Añade parámetros de query para filtrar eventos o personas.

## Próximos Pasos
- Implementar autenticación de usuarios
- Añadir roles y permisos (admin, organizador, etc.)
- Implementar generación de reportes (PDF, Excel)
- Añadir notificaciones por email
- Implementar WebSockets para actualizaciones en tiempo real
- Esta implementación proporciona una base sólida para tu sistema de control de asistencia con MongoDB, lista para integrarse con tu aplicación PWA React.