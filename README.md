# RentLocal

RentLocal es una plataforma web para descubrir y publicar locales comerciales en Lima, Perú. Permite buscar inmuebles por operación y distrito, revisar su ubicación, contactar al propietario por WhatsApp y explorar un tour 3D interactivo cuando está disponible.

## Funcionalidades

- Catálogo público de locales en alquiler, venta y traspaso.
- Filtros por distrito, operación y precio.
- Fichas con ubicación, características, fotografías y contacto por WhatsApp.
- Tours 3D configurables con ambientes, medidas, materiales, muebles, iluminación y hotspots.
- Panel para propietarios: creación y edición de locales, medios y configuración del tour.
- Panel administrativo para moderar usuarios y locales, además de consultar auditoría y leads.
- Autenticación con roles `admin` y `owner`.
- Registro de leads originados desde el listado, la ficha o el tour 3D.
- Persistencia intercambiable entre SQLite para desarrollo y Supabase para producción.

## Stack

- Next.js 16.4 con App Router y React 19.
- TypeScript, Tailwind CSS 4 y ESLint.
- Three.js, React Three Fiber y Drei para el visor 3D.
- SQLite con `better-sqlite3` o Supabase como backend alternativo.
- Vitest para pruebas unitarias y Playwright para pruebas end-to-end.
- pnpm como gestor de paquetes.

## Requisitos

- Node.js 20 o superior.
- pnpm 12 (`corepack enable` puede habilitarlo).
- Para el modo Supabase: un proyecto de Supabase con las variables correspondientes.

## Instalación local

```bash
pnpm install
touch .env.local
```

Configura `.env.local` con valores propios. No subas ese archivo al repositorio ni compartas `SUPABASE_SERVICE_ROLE_KEY`.

Formato recomendado:

```dotenv
DB_DRIVER=sqlite
NEXT_PUBLIC_APP_URL=http://localhost:3000
AUTH_SECRET=cambia-este-secreto-por-uno-de-al-menos-32-caracteres
ADMIN_EMAIL=admin@tu-dominio.com
ADMIN_PASSWORD=cambia-esta-contraseña

# Solo si DB_DRIVER=supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-publica-de-supabase
SUPABASE_SERVICE_ROLE_KEY=tu-clave-privada-solo-en-el-servidor
```

Para desarrollo con SQLite puedes dejar fuera las tres variables de Supabase. Para producción usa `DB_DRIVER=supabase` y reemplaza todos los placeholders por valores seguros.

### SQLite (desarrollo)

```bash
pnpm db:migrate:sqlite
pnpm db:seed
pnpm dev
```

La aplicación quedará disponible en [http://localhost:3000](http://localhost:3000). El modo SQLite usa `data/dev.sqlite` y almacenamiento local para los archivos subidos.

### Supabase

1. Crea un proyecto en Supabase.
2. Ejecuta en el SQL Editor, en este orden, la migración, las políticas y la configuración de Storage:

   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/policies.sql`
   - `supabase/storage.sql`

3. Configura `DB_DRIVER=supabase`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY` en `.env.local`.
4. Crea o actualiza el administrador:

```bash
pnpm admin:create
pnpm dev
```

Variables principales:

| Variable | Descripción |
| --- | --- |
| `DB_DRIVER` | `sqlite` para desarrollo o `supabase` para Supabase. |
| `NEXT_PUBLIC_APP_URL` | URL pública de la aplicación. |
| `AUTH_SECRET` | Secreto de al menos 32 caracteres para sesiones y JWT. |
| `ADMIN_EMAIL` | Correo del administrador inicial. |
| `ADMIN_PASSWORD` | Contraseña del administrador inicial. |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública de Supabase. |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave privada para operaciones del servidor. |

## Scripts disponibles

| Comando | Uso |
| --- | --- |
| `pnpm dev` | Inicia el servidor de desarrollo. |
| `pnpm build` | Genera la compilación de producción. |
| `pnpm start` | Sirve la compilación de producción. |
| `pnpm lint` | Ejecuta ESLint. |
| `pnpm test` | Ejecuta las pruebas unitarias. |
| `pnpm test:e2e` | Ejecuta las pruebas end-to-end de Playwright. |
| `pnpm db:migrate:sqlite` | Crea o actualiza el esquema SQLite local. |
| `pnpm db:seed` | Carga datos de demostración en SQLite. |
| `pnpm admin:create` | Crea o actualiza el administrador configurado. |
| `pnpm db:schema:check` | Comprueba la paridad entre SQLite y Supabase. |

## Rutas principales

- `/` — página de inicio y locales destacados.
- `/locales` — catálogo y filtros.
- `/locales/[slug]` — detalle de un local.
- `/ingresar` y `/registro` — autenticación.
- `/panel` — panel del propietario.
- `/admin` — panel administrativo.
- `/r/[slug]` — ruta de redirección y registro de leads de WhatsApp.

## Estructura del proyecto

```text
src/
├── app/       # Rutas, layouts, metadata y endpoints de Next.js
├── modules/   # Dominios de auth, locales, media, leads, usuarios, admin y tours 3D
└── shared/    # Configuración, base de datos y utilidades compartidas
supabase/      # Migraciones, políticas RLS y Storage
scripts/       # Migración, seed, administración y comprobaciones de esquema
tests/         # Pruebas unitarias y end-to-end
public/        # Recursos estáticos y modelos 3D públicos
```

## Despliegue

El proyecto puede desplegarse en Vercel. Configura allí las mismas variables de entorno usadas en producción y utiliza `DB_DRIVER=supabase`; SQLite y el almacenamiento local no deben usarse como persistencia de producción en un entorno serverless.

Antes de desplegar, verifica:

```bash
pnpm lint
pnpm test
pnpm build
```

## Seguridad

- Las variables de entorno y las claves privadas deben permanecer fuera de Git.
- Genera un `AUTH_SECRET` único para cada entorno.
- Cambia las credenciales de administrador antes de usar datos reales.
- Revisa las políticas RLS de Supabase antes de publicar el proyecto.

## Licencia

No se ha definido una licencia pública para este proyecto.
