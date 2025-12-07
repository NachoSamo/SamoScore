# SamoScore

## 📱 Descripción del Proyecto

**SamoScore** es una aplicación móvil moderna diseñada para los amantes del deporte. Permite a los usuarios seguir resultados de partidos en tiempo real, consultar tablas de posiciones, ver detalles de ligas y gestionar sus equipos favoritos.

El proyecto está construido utilizando **React Native** con **Expo**, garantizando una experiencia fluida tanto en dispositivos iOS como Android (y compatible con Web).

## 🛠 Tecnologías y Herramientas

Este proyecto utiliza un stack tecnológico robusto y actualizado:

### Core & Framework
*   **[React Native](https://reactnative.dev/):** Framework principal para desarrollo móvil.
*   **[Expo](https://expo.dev/):** Plataforma y conjunto de herramientas para React Native (SDK 54).
*   **[TypeScript](https://www.typescriptlang.org/):** Lenguaje principal para asegurar tipado estático y código robusto.

### Navegación & UI
*   **[Expo Router](https://docs.expo.dev/router/introduction/):** Solución de enrutamiento basada en archivos (similar a Next.js).
*   **Expo Vector Icons & Expo Symbols:** Para la iconografía de la aplicación.
*   **React Native Reanimated:** Para animaciones fluidas y de alto rendimiento.
*   **React Native Gesture Handler:** Para interacciones táctiles avanzadas.

### Backend & Servicios
*   **[Supabase](https://supabase.com/):** Backend-as-a-Service utilizado para:
    *   Autenticación de usuarios.
    *   Base de datos (PostgreSQL) para guardar favoritos y preferencias de usuario.

## 🌐 APIs Consumidas

La aplicación integra servicios externos para obtener la data deportiva:

### 1. TheSportsDB API
Fuente principal de datos deportivos. Se utiliza para consultar:
*   📅 **Eventos/Partidos:** Resultados en vivo y fixtures por fecha (`fetchEventsByDate`).
*   🏆 **Tablas de Posiciones:** Rankings actuales de las ligas (`fetchLeagueTable`).
*   ⚽ **Detalles de Ligas:** Información sobre competiciones (`fetchLeagueDetails`, `fetchAllLeagues`).

### 2. Supabase API
Se utiliza para la persistencia de datos del usuario, permitiendo funcionalidades como:
*   Inigiar sesión y registrarse.
*   Guardar y sincronizar equipos o ligas favoritas entre dispositivos (`supabaseFavoritesService`, `supabaseUserService`).

## 🚀 Cómo ejecutar el proyecto

Sigue estos pasos para levantar la aplicación en tu entorno local:

1.  **Clonar el repositorio y acceder a la carpeta del frontend:**
    ```bash
    cd SamoScore/frontend
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    # o
    yarn install
    ```

3.  **Configurar Variables de Entorno:**
    Asegúrate de tener un archivo `.env` en la raíz de `frontend` con las siguientes claves (basado en los servicios utilizados):
    ```env
    EXPO_PUBLIC_THESPORTSDB_API_KEY=tu_api_key
    EXPO_PUBLIC_SUPABASE_URL=tu_supabase_url
    EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_key
    ```

4.  **Iniciar la aplicación:**
    ```bash
    npx expo start
    ```
    *   Presiona `a` para abrir en Android Emulator.
    *   Presiona `i` para abrir en iOS Simulator.
    *   Presiona `w` para abrir en Web.

## 📱 Estructura del Proyecto

*   `app/`: Pantallas y configuración de rutas (Expo Router).
*   `components/`: Componentes reutilizables de la UI.
*   `services/`: Lógica de conexión con las APIs (TheSportsDB y Supabase).
*   `hooks/`: Custom hooks para manejo de lógica.
*   `features/`: Módulos específicos de funcionalidad.
*   `assets/`: Imágenes, fuentes y recursos estáticos.
