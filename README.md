# Biblioteca — Next.js MVP

Primera versión realista de la web app **Biblioteca**, pensada como base para convertir el prototipo visual en una aplicación funcional.

## Qué incluye

- Next.js + TypeScript
- UI mobile-first
- Pantallas:
  - Inicio
  - Mapa
  - Leer
  - Silencio
  - Bibliotecario
- API local:
  - `/api/works`
  - `/api/resonances`
  - `/api/librarian`
- Preparación para:
  - Supabase
  - OpenAI API
  - PWA

## Cómo ejecutarla

1. Instalá Node.js 20 o superior.
2. Descomprimí este ZIP.
3. En la carpeta del proyecto, ejecutá:

```bash
npm install
npm run dev
```

4. Abrí:

```bash
http://localhost:3000
```

## Variables de entorno

Copiá `.env.example` a `.env.local`.

```bash
cp .env.example .env.local
```

Para usar IA real, agregá:

```bash
OPENAI_API_KEY=tu_clave
```

Para usar Supabase más adelante:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Próximo paso

Crear la base de datos:
- users
- works
- fragments
- notes
- highlights
- embeddings
- resonances
- silence_sessions

Y conectar la carga real de textos.


## Versión 0.2

Agregado:
- Pantalla `Añadir obra`
- Guardado local con `localStorage`
- Selección de obra
- Lectura del texto cargado
- Eliminación de obras creadas por el usuario

Este guardado es local: queda en ese navegador y esa computadora.


## Versión 0.3

Agregado:
- Resaltados reales por selección de texto
- Notas reales vinculadas a una obra o a un fragmento seleccionado
- Sección `Memoria de lectura`
- Eliminación de notas y resaltados
- Migración automática desde el guardado local de v0.2

Modo de uso:
1. Abrí una obra.
2. Seleccioná un fragmento del texto.
3. Tocá `Resaltar` o `Nota`.
4. La memoria queda guardada localmente en el navegador.


## Versión 0.4

Agregado:
- Importación de `.txt`
- Importación de `.md`
- Importación de `.pdf` con extracción de texto desde API local
- Importación de `.json`
- Importación de exportaciones de ChatGPT:
  - `conversations.json`
  - `.zip` oficial que contenga `conversations.json`

Notas:
- Los PDF escaneados como imagen todavía no funcionan porque requieren OCR.
- Exportaciones grandes de ChatGPT pueden superar el límite de `localStorage`; más adelante esto debe pasar a Supabase/PostgreSQL.
- Esta versión agrega dependencias nuevas, por eso sí requiere `npm install`.


## Versión 0.5

Agregado:
- Vista previa para exportaciones de ChatGPT.
- Selección de conversaciones antes de importar.
- Importar conversaciones seleccionadas como:
  - una sola obra combinada;
  - obras separadas.
- Límite de vista previa de 80 conversaciones para evitar romper `localStorage`.

Notas:
- Para exportaciones grandes, esta sigue siendo una solución local provisional.
- La versión correcta a futuro requiere base de datos.


## Versión 0.6

Agregado:
- Pantalla `Editar obra`.
- Botón de edición en la pantalla de lectura.
- Actualización de título, autor y contenido.
- Conservación de notas y resaltados al editar.
- Migración automática desde guardados locales anteriores.

Notas:
- Si se modifica demasiado el contenido, algunos resaltados pueden dejar de coincidir con el texto.


## Versión 0.7

Agregado:
- Bibliotecario local sin IA externa.
- Operaciones sobre la obra seleccionada:
  - resumen local;
  - conceptos frecuentes;
  - preguntas de lectura;
  - reducción provisional;
  - fragmentos relevantes.
- No requiere nuevas dependencias ni claves externas.

Notas:
- Esta función usa heurísticas simples.
- Sirve para probar el gesto conceptual del Bibliotecario antes de conectar IA real.


## Versión 0.8

Agregado:
- Conexión cloud-first con Supabase.
- Obras, notas y resaltados se leen y escriben en Supabase cuando hay variables de entorno configuradas.
- Si Supabase no está configurado, la app vuelve a modo local con localStorage.
- Banner de estado: `Nube Supabase activa`, `Modo local` o error de conexión.

Variables necesarias en Vercel y `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_public_key
```

Tablas requeridas:
- `works`
- `notes`
- `highlights`

Nota de seguridad:
- Las políticas abiertas sirven para prueba. Para una app pública real hay que agregar Auth y RLS por usuario.
