# Tempo App

**Tempo App** es una aplicación web de productividad que combina gestión de tareas, temporizador tipo Pomodoro y recordatorios en una experiencia moderna y enfocada. 

Permite a los usuarios organizar su trabajo, medir su progreso por ciclos completados y mantener el enfoque en lo realmente importante.

---

## Características

* **Autenticación segura**: Gestión de usuarios integrada.
* **Gestión de tareas**: Creación, prioridad, estado y orden personalizado.
* **Pomodoro Engine**: Temporizador integrado por cada tarea.
* **Ambiente inmersivo**: Reproductor de sonidos de ambiente y integración con playlists de Spotify.
* **Notificaciones**: Recordatorios y avisos de fin de ciclo.
* **Sincronización**: Datos en tiempo real para no perder el progreso.

## Tecnologías utilizadas

* **Next.js** – Framework de React para el frontend y optimización.
* **Supabase** – Backend as a Service:
    * PostgreSQL (Base de datos).
    * Auth (Gestión de usuarios).
    * Row Level Security (RLS) para máxima seguridad.

---

## Instalación y configuración

Sigue estos pasos para ejecutar **Tempo App** en tu entorno local:

### 1. Clonar el repositorio
```bash
git clone [https://github.com/ItsLouis30/Tempo-App.git](https://github.com/ItsLouis30/Tempo-App.git)
cd tempo-app
```

### 2. Instalar dependencias
```bash
npm install
```

### 3️. Configurar variables de entorno
``` bash
Crear un archivo .env.local con:

NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 4️. Ejecutar en desarrollo
``` bash
npm run dev
```

Proyecto desarrollado por ItsLouis30
